<?php
/**
 * Form handler for static builds on PHP-only cPanel hosting.
 *
 * Mirrors src/app/api/forms/[form]/route.dynamic.ts: same forms.json rules, same honeypot,
 * timing check, rate limit, optional Turnstile, and SMTP / mail() / webhook delivery.
 *
 *   POST /api/form.php?form=contact   (JSON from the React form, or a plain form post without JS)
 *
 * Config: form-config.php, looked up outside the web root first (~/form-config.php),
 * then next to this file. Copy form-config.example.php and fill it in.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

const HONEYPOT_FIELD = 'company_website';
const TIMESTAMP_FIELD = '_ts';
const TURNSTILE_FIELD = 'cf-turnstile-response';
const INTERNAL_FIELDS = [HONEYPOT_FIELD, TIMESTAMP_FIELD, TURNSTILE_FIELD, '_page'];
const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 1000 * 60 * 60 * 6;
const RATE_WINDOW = 600;
const RATE_MAX = 5;
/** Must match PHONE_PATTERN in src/lib/forms/registry.ts. */
const PHONE_PATTERN = '^[+()\d\s-]{8,20}$';
const SUCCESS_MESSAGE = "Thanks, we'll be in touch soon.";

// ---------------------------------------------------------------------------------------------

function load_config(): array
{
    $candidates = array_filter([
        getenv('FORM_CONFIG') ?: null,
        !empty($_SERVER['DOCUMENT_ROOT']) ? dirname($_SERVER['DOCUMENT_ROOT']) . '/form-config.php' : null,
        __DIR__ . '/form-config.php',
    ]);
    foreach ($candidates as $file) {
        if (is_file($file)) {
            $config = require $file;
            return is_array($config) ? $config : [];
        }
    }
    return [];
}

function wants_json(): bool
{
    return str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json');
}

function esc(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/** JSON for fetch submissions; redirect or a plain error page for no-JS posts. */
function respond(array $body, int $status, string $redirect = '/'): never
{
    if (wants_json()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($body['ok']) {
        header('Location: ' . $redirect, true, 303);
        exit;
    }
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    $items = implode('', array_map(fn ($e) => '<li>' . esc((string) $e) . '</li>', array_values($body['errors'] ?? [])));
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $back = preg_match('~^https?://~', $referer) ? esc($referer) : '/';
    echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="robots" content="noindex"><title>Please check the form</title>'
        . '<body style="font:16px/1.5 system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem">'
        . '<h1 style="font-size:1.5rem">' . esc($body['message']) . '</h1>'
        . ($items ? "<ul>$items</ul>" : '')
        . '<p><a href="' . $back . '">Go back to the form</a></p></body>';
    exit;
}

function client_ip(): ?string
{
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            return trim(explode(',', $_SERVER[$key])[0]);
        }
    }
    return null;
}

/** Fixed window per IP, stored as small files in the system temp dir. */
function rate_limited(?string $ip): bool
{
    if (!$ip) {
        return false;
    }
    $file = sys_get_temp_dir() . '/form_rl_' . md5(__DIR__ . $ip);
    $now = time();
    $entry = ['count' => 0, 'reset' => $now + RATE_WINDOW];
    if (is_file($file)) {
        $saved = json_decode((string) @file_get_contents($file), true);
        if (is_array($saved) && ($saved['reset'] ?? 0) > $now) {
            $entry = $saved;
        }
    }
    $entry['count']++;
    @file_put_contents($file, json_encode($entry), LOCK_EX);
    return $entry['count'] > RATE_MAX;
}

function bot_signal(array $data, bool $requireTimestamp): ?string
{
    if (!empty($data[HONEYPOT_FIELD])) {
        return 'honeypot';
    }
    $ts = (int) ($data[TIMESTAMP_FIELD] ?? 0);
    if (!$ts) {
        return $requireTimestamp ? 'missing-timestamp' : null;
    }
    $age = (int) round(microtime(true) * 1000) - $ts;
    if ($age < MIN_FILL_MS) {
        return 'too-fast';
    }
    if ($age > MAX_AGE_MS) {
        return 'stale';
    }
    return null;
}

function http_post(string $url, string $body, array $headers): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return [$status, is_string($response) ? $response : ''];
}

function verify_turnstile(array $config, ?string $token, ?string $ip): bool
{
    $secret = $config['turnstile_secret'] ?? '';
    if ($secret === '') {
        return true;
    }
    if (!$token) {
        return false;
    }
    [$status, $body] = http_post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        http_build_query(array_filter(['secret' => $secret, 'response' => $token, 'remoteip' => $ip])),
        ['Content-Type: application/x-www-form-urlencoded'],
    );
    $json = json_decode($body, true);
    return $status === 200 && is_array($json) && ($json['success'] ?? false) === true;
}

/** Same rules as fieldSchema() in registry.ts. Returns [clean data, errors]. */
function validate(array $fields, array $data): array
{
    $clean = [];
    $errors = [];
    foreach ($fields as $name => $rule) {
        $label = $rule['label'] ?? $name;
        $msg = $rule['message'] ?? 'Check your ' . strtolower($label);
        $type = $rule['type'] ?? 'text';
        $raw = $data[$name] ?? '';
        $value = is_string($raw) ? trim($raw) : '';

        if ($type === 'checkbox') {
            if (!empty($rule['required']) && $value !== 'on') {
                $errors[$name] = $msg;
            }
            $clean[$name] = $value;
            continue;
        }

        $clean[$name] = $value;
        if (isset($rule['max']) && mb_strlen($value) > (int) $rule['max']) {
            $errors[$name] = $msg;
            continue;
        }
        if ($value === '') {
            if (!empty($rule['required'])) {
                $errors[$name] = $msg;
            }
            continue;
        }
        if (isset($rule['min']) && mb_strlen($value) < (int) $rule['min']) {
            $errors[$name] = $msg;
            continue;
        }
        if ($type === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $errors[$name] = $msg;
            continue;
        }
        $pattern = $rule['pattern'] ?? ($type === 'tel' ? PHONE_PATTERN : null);
        if ($pattern !== null && !preg_match('~' . str_replace('~', '\~', $pattern) . '~u', $value)) {
            $errors[$name] = $msg;
        }
    }
    return [$clean, $errors];
}

function render_email(array $clean, array $labels, string $page): array
{
    $rows = [];
    foreach ($clean as $key => $value) {
        if ($value !== '') {
            $rows[] = [$labels[$key] ?? $key, $value];
        }
    }
    $text = implode("\n", array_map(fn ($r) => "{$r[0]}: {$r[1]}", $rows)) . "\n\nSent from {$page}";
    $html = '<table cellpadding="8" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">';
    foreach ($rows as [$label, $value]) {
        $html .= '<tr><td style="border-bottom:1px solid #eee;font-weight:bold;vertical-align:top;white-space:nowrap">' . esc($label)
            . '</td><td style="border-bottom:1px solid #eee;white-space:pre-wrap">' . esc($value) . '</td></tr>';
    }
    $html .= '</table><p style="font-family:Arial,sans-serif;font-size:12px;color:#666">Sent from ' . esc($page) . '</p>';
    return [$text, $html];
}

function send_email(array $config, string $subject, array $clean, array $labels, string $page): void
{
    require_once __DIR__ . '/lib/PHPMailer/Exception.php';
    require_once __DIR__ . '/lib/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/lib/PHPMailer/SMTP.php';

    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';

    if (!empty($config['smtp_host'])) {
        $port = (int) ($config['smtp_port'] ?? 587);
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->Port = $port;
        $secure = $config['smtp_secure'] ?? 'auto';
        if ($secure === 'auto') {
            $secure = $port === 465 ? 'ssl' : 'tls';
        }
        $mail->SMTPSecure = match ($secure) {
            'ssl' => PHPMailer::ENCRYPTION_SMTPS,
            'tls' => PHPMailer::ENCRYPTION_STARTTLS,
            default => '',
        };
        $mail->SMTPAutoTLS = $secure !== 'none';
        if (!empty($config['smtp_user'])) {
            $mail->SMTPAuth = true;
            $mail->Username = $config['smtp_user'];
            $mail->Password = $config['smtp_pass'] ?? '';
        }
    } else {
        // cPanel's local mail server. Use a From address on the site's own domain or it may be rejected.
        $mail->isMail();
    }

    $mail->setFrom($config['from_email'] ?? ($config['smtp_user'] ?? ''), $config['from_name'] ?? '');
    foreach (array_filter(array_map('trim', explode(',', (string) $config['to_email']))) as $to) {
        $mail->addAddress($to);
    }
    if (!empty($clean['email']) && filter_var($clean['email'], FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($clean['email']);
    }

    [$text, $html] = render_email($clean, $labels, $page);
    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = $html;
    $mail->AltBody = $text;
    $mail->send();
}

function send_webhook(array $config, string $form, array $clean, string $page): void
{
    $headers = ['Content-Type: application/json'];
    if (!empty($config['webhook_secret'])) {
        $headers[] = 'Authorization: Bearer ' . $config['webhook_secret'];
    }
    $payload = json_encode(
        ['form' => $form] + $clean + ['source' => $page, 'submittedAt' => gmdate('Y-m-d\TH:i:s.v\Z')],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
    );
    [$status] = http_post($config['webhook_url'], (string) $payload, $headers);
    if ($status < 200 || $status >= 300) {
        throw new RuntimeException("Webhook responded {$status}");
    }
}

// ---------------------------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(['ok' => false, 'message' => 'Method not allowed'], 405);
}

$config = load_config();
$definitions = json_decode((string) @file_get_contents(__DIR__ . '/forms.json'), true) ?: [];
$key = (string) ($_GET['form'] ?? '');
$form = ($key !== '' && $key !== '$comment' && isset($definitions[$key])) ? $definitions[$key] : null;
if (!$form) {
    respond(['ok' => false, 'message' => 'Unknown form'], 404);
}

$redirect = $form['redirect'] ?? '/';
$isJson = wants_json();
$data = $isJson ? (json_decode((string) file_get_contents('php://input'), true) ?: []) : $_POST;
$data = array_map(fn ($v) => is_scalar($v) ? (string) $v : '', is_array($data) ? $data : []);
$ip = client_ip();

if (rate_limited($ip)) {
    respond(['ok' => false, 'message' => 'Too many submissions. Please try again later.'], 429, $redirect);
}

$fields = array_diff_key($data, array_flip(INTERNAL_FIELDS));
[$clean, $errors] = validate($form['fields'] ?? [], $fields);
if ($errors) {
    respond(['ok' => false, 'message' => 'Please check the highlighted fields.', 'errors' => $errors], 422, $redirect);
}

// Validation runs first so real people always see field errors. Bots get a fake success.
if ($signal = bot_signal($data, $isJson)) {
    error_log("[forms] {$key} blocked ({$signal}) {$ip}");
    respond(['ok' => true, 'message' => SUCCESS_MESSAGE], 200, $redirect);
}

if (!verify_turnstile($config, $data[TURNSTILE_FIELD] ?? null, $ip)) {
    respond(['ok' => false, 'message' => 'Verification failed. Please try again.'], 400, $redirect);
}

$page = ($data['_page'] ?? '') ?: ($_SERVER['HTTP_REFERER'] ?? ($config['site_url'] ?? ''));
$labels = array_map(fn ($r) => $r['label'] ?? '', $form['fields'] ?? []);
$subject = preg_replace_callback('/\{(\w+)\}/', fn ($m) => $clean[$m[1]] ?? '', (string) ($form['subject'] ?? 'New form submission'));

$channels = [];
if (!empty($config['to_email']) && (!empty($config['smtp_host']) || !empty($config['use_php_mail']))) {
    $channels['email'] = fn () => send_email($config, $subject, $clean, $labels, $page);
}
if (!empty($config['webhook_url'])) {
    $channels['webhook'] = fn () => send_webhook($config, $key, $clean, $page);
}

if (!$channels) {
    error_log('[forms] No delivery configured. Fill in form-config.php.');
    respond(['ok' => false, 'message' => 'Sorry, something went wrong sending your message. Please call or email us instead.'], 502, $redirect);
}

// Succeeds if at least one channel delivers, so one outage doesn't lose the enquiry.
$delivered = 0;
foreach ($channels as $name => $send) {
    try {
        $send();
        $delivered++;
    } catch (Throwable $e) {
        error_log("[forms] {$name} delivery failed: " . $e->getMessage());
    }
}

if ($delivered === 0) {
    respond(['ok' => false, 'message' => 'Sorry, something went wrong sending your message. Please call or email us instead.'], 502, $redirect);
}

respond(['ok' => true, 'message' => SUCCESS_MESSAGE], 200, $redirect);

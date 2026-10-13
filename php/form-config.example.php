<?php
/**
 * Form settings for the PHP handler (static builds on PHP-only cPanel).
 *
 * Copy to ONE of these and fill in:
 *   1. /home/<cpanel-user>/form-config.php   (recommended: outside public_html, never web-accessible)
 *   2. public_html/api/form-config.php       (fallback: .htaccess blocks direct access)
 *
 * Equivalent to the SMTP_* / FORM_* / TURNSTILE_* variables in .env for Vercel and Node builds.
 */

return [
    'site_url' => 'https://www.example.com.au',

    // ---- Email ----
    // Comma-separated for multiple recipients. Leave empty to skip email.
    'to_email' => '',
    // Use an address on the site's own domain so it passes SPF/DMARC.
    'from_email' => 'no-reply@example.com.au',
    'from_name' => 'Website',

    // SMTP (recommended). cPanel mailbox: host mail.example.com.au, port 465, full email as user.
    'smtp_host' => '',
    'smtp_port' => 465,
    'smtp_user' => '',
    'smtp_pass' => '',
    // auto = SSL on 465, STARTTLS otherwise. Or 'ssl', 'tls', 'none'.
    'smtp_secure' => 'auto',

    // No SMTP? Set true to send through the server's local mail() instead.
    'use_php_mail' => false,

    // ---- Webhook (GoHighLevel / Zapier / Make / n8n) ----
    // Leave empty to skip. Email and webhook can both run; the submission succeeds if either delivers.
    'webhook_url' => '',
    'webhook_secret' => '',

    // ---- Cloudflare Turnstile (optional) ----
    // Set together with NEXT_PUBLIC_TURNSTILE_SITE_KEY at build time.
    'turnstile_secret' => '',
];

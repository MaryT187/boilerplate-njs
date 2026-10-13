<?php
// Local preview of a static build with PHP's built-in server (which ignores .htaccess).
// Mimics the Apache rewrites: clean URLs -> .html, 404.html fallback, PHP for /api/form.php.
// Usage: npm run preview:static
$root = $_SERVER['DOCUMENT_ROOT'];
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');

if (str_starts_with($path, '/api/') && $path !== '/api/form.php') {
    http_response_code(403);
    exit('Forbidden');
}
if ($path !== '/' && is_file($root . $path)) {
    return false;
}
foreach ([rtrim($path, '/') . '.html', rtrim($path, '/') . '/index.html'] as $candidate) {
    if (is_file($root . $candidate)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($root . $candidate);
        return true;
    }
}
http_response_code(404);
readfile($root . '/404.html');

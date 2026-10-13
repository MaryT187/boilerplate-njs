#!/usr/bin/env node
/**
 * Finishes a DEPLOY_TARGET=static build for PHP-only cPanel hosting.
 *
 *   npm run build:static  ->  out/   (upload the CONTENTS to public_html)
 *
 * Adds the Apache config and the PHP form handler, which reads the same forms.json as the Next.js route.
 */
import { appendFileSync, chmodSync, cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const out = join(root, "out");

if (!existsSync(join(out, "index.html"))) {
  console.error("No static export found. Run `npm run build:static` (it sets DEPLOY_TARGET=static).");
  process.exit(1);
}

cpSync(join(root, "php/.htaccess"), join(out, ".htaccess"));
cpSync(join(root, "php/api"), join(out, "api"), { recursive: true });
cpSync(join(root, "src/lib/forms/forms.json"), join(out, "api/forms.json"));

// Copies keep the source permissions, which can be owner-only (600/700) depending on how the repo was checked out.
// Apache on cPanel then can't read .htaccess or reach api/. Normalise to 644 files, 755 folders.
function makeReadable(path) {
  const isDir = statSync(path).isDirectory();
  chmodSync(path, isDir ? 0o755 : 0o644);
  if (isDir) for (const entry of readdirSync(path)) makeReadable(join(path, entry));
}
makeReadable(out);

// Staging build (robots.txt disallows everything): also send X-Robots-Tag so images and files stay out of search,
// matching the header next.config.ts sets on the server targets.
const staging = /^Disallow: \/$/m.test(readFileSync(join(out, "robots.txt"), "utf8"));
if (staging) {
  appendFileSync(
    join(out, ".htaccess"),
    "\n# Added by package-static.mjs: not a production build (NEXT_PUBLIC_SITE_ENV), so keep everything out of search.\n" +
      '<IfModule mod_headers.c>\n  Header always set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n',
  );
  console.log("Staging build: noindexed. Set NEXT_PUBLIC_SITE_ENV=production for the live site.");
}

rmSync(join(root, "dist/static.zip"), { force: true });
try {
  execSync("mkdir -p ../dist && zip -qry ../dist/static.zip .", { cwd: out });
  console.log("Created dist/static.zip");
} catch {
  console.log("zip not available; upload out/ directly.");
}

console.log(`
Ready: out/  (upload its contents to public_html, including the hidden .htaccess files)
Form setup: copy php/form-config.example.php to /home/<cpanel-user>/form-config.php and fill it in.
Requires PHP 8.1+ with curl (standard on cPanel).
`);

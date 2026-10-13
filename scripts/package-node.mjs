#!/usr/bin/env node
/**
 * Packages a DEPLOY_TARGET=node build for cPanel "Setup Node.js App" (Passenger), a VPS or Docker.
 *
 *   npm run build:node   ->  dist/node/      (upload as the Application root)
 *                            dist/node.zip   (same thing, for cPanel File Manager > Extract)
 *
 * Safe to run on macOS: the image optimiser's native binaries (sharp) are swapped for
 * Linux x64 ones so the bundle runs on the server without `npm install`.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const standalone = join(root, ".next/standalone");
const out = join(root, "dist/node");

// Server platform. Override for ARM servers or Alpine: SERVER_CPU=arm64 SERVER_LIBC=musl npm run build:node
const cpu = process.env.SERVER_CPU ?? "x64";
const libc = process.env.SERVER_LIBC ?? "glibc";

if (!existsSync(join(standalone, "server.js"))) {
  console.error("No standalone build found. Run `npm run build:node` (it sets DEPLOY_TARGET=node).");
  process.exit(1);
}

rmSync(join(root, "dist/node"), { recursive: true, force: true });
rmSync(join(root, "dist/node.zip"), { force: true });
mkdirSync(out, { recursive: true });

// 1. Standalone server + the assets it doesn't copy by itself.
cpSync(standalone, out, { recursive: true });
cpSync(join(root, "public"), join(out, "public"), { recursive: true });
cpSync(join(root, ".next/static"), join(out, ".next/static"), { recursive: true });

// 2. Optional server env file (secrets: keep it out of git). cPanel's Node.js App screen can set these instead.
if (existsSync(join(root, ".env.production"))) {
  cpSync(join(root, ".env.production"), join(out, ".env.production"));
  console.log("Included .env.production");
}

// 3. Replace sharp's native binaries with the server's platform.
const imgDir = join(out, "node_modules/@img");
const sharpPkg = join(root, "node_modules/sharp/package.json");
if (existsSync(imgDir) && existsSync(sharpPkg)) {
  const version = JSON.parse(readFileSync(sharpPkg, "utf8")).version;
  const tmp = mkdtempSync(join(tmpdir(), "sharp-"));
  console.log(`Fetching sharp ${version} for linux-${cpu} (${libc})...`);
  execSync(
    `npm install --no-save --no-package-lock --no-audit --no-fund --os=linux --cpu=${cpu} --libc=${libc} sharp@${version}`,
    { cwd: tmp, stdio: "inherit" },
  );
  for (const entry of readdirSync(imgDir)) {
    if (/^sharp-(libvips-)?(darwin|win32|linux)/.test(entry))
      rmSync(join(imgDir, entry), { recursive: true, force: true });
  }
  for (const entry of readdirSync(join(tmp, "node_modules/@img"))) {
    cpSync(join(tmp, "node_modules/@img", entry), join(imgDir, entry), { recursive: true });
  }
  rmSync(tmp, { recursive: true, force: true });
}

// 4. Zip for upload.
try {
  execSync("zip -qry ../node.zip .", { cwd: out });
  console.log("Created dist/node.zip");
} catch {
  console.log("zip not available; upload dist/node/ directly.");
}

console.log(`
Ready: dist/node/
cPanel > Setup Node.js App:
  Node.js version     20.9 or newer (22 recommended)
  Application mode    Production
  Application root    the folder you upload dist/node/ into (outside public_html)
  Startup file        server.js
  Environment         SMTP_*, FORM_*, TURNSTILE_SECRET_KEY (NEXT_PUBLIC_* are baked in at build)
Then "Restart". No npm install needed on the server.
`);

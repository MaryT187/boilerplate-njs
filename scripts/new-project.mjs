#!/usr/bin/env node
/**
 * Starts a new client project from this boilerplate.
 *
 *   npm run new                         asks for the project name and hosting
 *   npm run new -- "MySite" vercel      same, without the questions
 *
 * Options (after the name and hosting):
 *   --dir <path>      where to create it (default: next to this boilerplate, e.g. ../mysite)
 *   --skip-install    don't run npm install
 *
 * Copies the boilerplate (without node_modules, builds, .git or local env files), sets the project name,
 * removes everything the chosen hosting doesn't use, trims the README to match and writes .env.local.
 * The boilerplate itself is never changed.
 */
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");

const HOSTING = {
  vercel: {
    label: "Vercel",
    aliases: ["1", "vercel"],
    remove: ["php", "scripts/package-node.mjs", "scripts/package-static.mjs"],
    scripts: ["build:vercel", "build:node", "build:static", "preview:static"],
  },
  node: {
    label: "cPanel Node.js App (or any Node server)",
    aliases: ["2", "node", "nodejs", "cpanel-node"],
    remove: ["php", "scripts/package-static.mjs"],
    scripts: ["build:vercel", "build:static", "preview:static"],
  },
  static: {
    label: "cPanel PHP only (static HTML + PHP forms)",
    aliases: ["3", "php", "static", "cpanel", "cpanel-php"],
    remove: ["scripts/package-node.mjs"],
    scripts: ["build:vercel", "build:node"],
  },
};

// Never copied into a new project.
const SKIP = new Set([
  "node_modules",
  ".next",
  "out",
  "dist",
  ".git",
  "next-env.d.ts",
  "form-config.php",
  "scripts/new-project.mjs",
]);
const skip = (rel) =>
  SKIP.has(rel) ||
  /(^|\/)\.DS_Store$/.test(rel) ||
  rel.endsWith(".tsbuildinfo") ||
  (/^\.env/.test(rel) && rel !== ".env.example");

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function slugify(name) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findHosting(answer) {
  const a = answer.trim().toLowerCase();
  return Object.keys(HOSTING).find((key) => HOSTING[key].aliases.includes(a));
}

function edit(file, fn) {
  const path = join(dest, file);
  writeFileSync(path, fn(readFileSync(path, "utf8")));
}

// ---- Answers ----------------------------------------------------------------------------------

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--dir");

let [name, hostingAnswer] = positional;

if (!name || !hostingAnswer) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  while (!name?.trim()) name = await rl.question("Project name: ");
  if (!hostingAnswer || !findHosting(hostingAnswer)) {
    console.log("\nHosting:");
    for (const [key, h] of Object.entries(HOSTING)) console.log(`  ${h.aliases[0]}) ${key.padEnd(7)} ${h.label}`);
    while (!findHosting(hostingAnswer ?? "")) hostingAnswer = await rl.question("Choose 1-3 or a name: ");
  }
  rl.close();
}

name = name.trim();
const hosting = findHosting(hostingAnswer);
if (!hosting) fail(`Unknown hosting "${hostingAnswer}". Use vercel, node or php.`);
const slug = slugify(name);
if (!slug) fail(`"${name}" has no letters or numbers to make a folder name from.`);

const dest = resolve(option("--dir") ?? join(root, "..", slug));
if (existsSync(dest) && readdirSync(dest).length > 0) fail(`${dest} already exists and isn't empty.`);

// ---- Copy -------------------------------------------------------------------------------------

console.log(`\nCreating ${name} (${HOSTING[hosting].label}) in ${dest}`);

cpSync(root, dest, {
  recursive: true,
  filter: (src) => {
    const rel = relative(root, src);
    return rel === "" || !skip(rel);
  },
});

// ---- Remove what this hosting doesn't use ------------------------------------------------------

for (const path of HOSTING[hosting].remove) rmSync(join(dest, path), { recursive: true, force: true });
if (existsSync(join(dest, "scripts")) && readdirSync(join(dest, "scripts")).length === 0) {
  rmSync(join(dest, "scripts"), { recursive: true });
}

edit("package.json", (s) => {
  const pkg = JSON.parse(s);
  pkg.name = slug;
  for (const script of [...HOSTING[hosting].scripts, "new"]) delete pkg.scripts[script];
  return JSON.stringify(pkg, null, 2) + "\n";
});

// ---- Project name ------------------------------------------------------------------------------

edit("src/lib/site.ts", (s) => {
  if (!s.includes('name: "Client Name",')) fail('Couldn\'t find name: "Client Name" in src/lib/site.ts.');
  return s.replace('name: "Client Name",', `name: ${JSON.stringify(name)},`);
});

// ---- README: keep the sections for this hosting ------------------------------------------------
// <!-- boilerplate --> ... <!-- /boilerplate -->         only in the boilerplate's own README
// <!-- hosting:node,static --> ... <!-- /hosting -->    kept only for the listed hosting

edit("README.md", (s) =>
  s
    .replace(/^# .*\n/, `# ${name}\n`)
    .replace(/<!-- boilerplate -->\n[\s\S]*?<!-- \/boilerplate -->\n/g, "")
    .replace(/<!-- project\n([\s\S]*?)-->\n/g, (_, text) =>
      text.replaceAll("{hosting}", HOSTING[hosting].label).replaceAll("{name}", name),
    )
    .replace(/<!-- hosting:([\w,]+) -->\n([\s\S]*?)<!-- \/hosting -->\n/g, (_, list, body) =>
      list.split(",").includes(hosting) ? body : "",
    )
    .replace(/\n{3,}/g, "\n\n"),
);

// ---- Local env ---------------------------------------------------------------------------------

writeFileSync(join(dest, ".env.local"), readFileSync(join(dest, ".env.example"), "utf8"));

// ---- Install -----------------------------------------------------------------------------------

if (!flag("--skip-install")) {
  console.log("\nInstalling packages...");
  try {
    execSync("npm install --no-audit --no-fund", { cwd: dest, stdio: "inherit" });
  } catch {
    console.log("npm install failed; run it yourself in the new folder.");
  }
}

console.log(`
Done: ${name} is ready in ${dest}

Next:
  cd ${relative(process.cwd(), dest) || "."}
  npm run dev                 http://localhost:3000

Then work through "New client checklist" in ${basename(dest)}/README.md
(business details in src/lib/site.ts, brand colours in src/app/globals.css, logo, nav, content).
`);

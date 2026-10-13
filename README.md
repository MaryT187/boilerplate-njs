# Next.js Boilerplate

<!-- project
Client site built from the team's Next.js boilerplate: Next.js 16 (App Router, TypeScript), React 19, Tailwind CSS v4, SEO defaults and a form submission API. Hosting: **{hosting}** (see [Deploying](#deploying)).
-->
<!-- boilerplate -->

Starting point for client sites: Next.js 16 (App Router, TypeScript), React 19, Tailwind CSS v4, SEO defaults and a form submission API. Host-agnostic: the same codebase deploys to Vercel, cPanel's Node.js App, or PHP-only cPanel as static HTML.

## Starting a new project

You need Node.js 20.9+ (22 recommended) and git.

**1. Download the boilerplate** into the folder where your sites live, e.g. `~/Herd`. Pick one:

- **Download ZIP (simplest, no git link at all).** On GitHub: **Code → Download ZIP**, unzip it into `~/Herd`. Nothing you do in it can reach the boilerplate repository. Download a fresh ZIP each time you start a project, so you always get the latest version.
- **Clone (if you want `git pull` for updates).** Clone, then switch off pushing from this copy, so nobody can push changes to the boilerplate by accident:

  ```bash
  cd ~/Herd
  git clone https://github.com/MaryT187/boilerplate-njs.git
  cd boilerplate-njs
  git remote set-url --push origin no-push
  ```

  To get the latest version later: `git pull` in `~/Herd/boilerplate-njs`. Pushing from it fails with an error, by design.

Either way, the boilerplate is only a template: you never edit or commit in it. Step 2 copies it into a new folder **without** the boilerplate's git history, so the new project can't push to the boilerplate either.

**2. Run the setup** from the boilerplate folder (`boilerplate-njs-main` if you downloaded the ZIP):

```bash
cd ~/Herd/boilerplate-njs
npm run new
```

It asks for the **project name** and the **hosting** (`vercel`, `node` or `php`; see the table below), then creates the project next to the boilerplate (`MySite` becomes `~/Herd/mysite`) and installs its packages. No `npm install` is needed in the boilerplate first. You can also answer up front:

```bash
npm run new -- "MySite" vercel
```

**3. Start the new project:**

```bash
cd ~/Herd/mysite
npm run dev
```

Open http://localhost:3000.

**4. Put it in its own git repository.** The new project doesn't carry the boilerplate's git history. Create an empty repository on GitHub for it, then:

```bash
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<account>/<repo>.git
git push -u origin main
```

**5. Make it the client's site.** Work through the [New client checklist](#new-client-checklist): business details, brand colours, logo, nav, content. Then follow [Deploying](#deploying) in the new project's README.

### Hosting options

| Hosting  | Use for                                         | Form handler       | Image optimisation      |
| -------- | ----------------------------------------------- | ------------------ | ----------------------- |
| `vercel` | Vercel                                          | Next.js route      | Yes                     |
| `node`   | cPanel "Setup Node.js App", a VPS, Docker       | Next.js route      | Yes                     |
| `php`    | cPanel without Node.js: static HTML + PHP forms | `php/api/form.php` | No: upload sized images |

The new project gets the name in `package.json`, `src/lib/site.ts` and its README, a `.env.local`, and only what its hosting needs: Vercel and Node projects have no `php/` folder, and each keeps only its own build scripts and README sections. Nothing here is changed, so the boilerplate stays reusable. Options: `--dir <path>` to create it somewhere else, `--skip-install` to skip `npm install`.

The rest of this README is what each new project gets (trimmed to its hosting).
<!-- /boilerplate -->

## Requirements

- Node.js 22 (see `.nvmrc`; 20.9 is the minimum) and npm.

<!-- hosting:static -->

- PHP 8.1+ with curl, only for previewing static builds locally (`npm run preview:static`). Laravel Herd provides it.

<!-- /hosting -->

## Getting started

```bash
nvm use                  # Node 22
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

Forms work locally without any keys: with no SMTP or webhook configured, submissions are printed in the terminal instead of being delivered.

## Scripts

| Command          | What it does                                                       |
| ---------------- | ------------------------------------------------------------------ |
| `npm run dev`    | Development server on http://localhost:3000 (Turbopack)            |
| `npm run build`  | Production build for the default (Vercel) target                   |
| `npm start`      | Serves that build, for testing production locally                  |
| `npm run check`  | ESLint + TypeScript (`next typegen && tsc`). Run before every push |
| `npm run format` | Prettier over the repo, including Tailwind class sorting           |

The deploy build commands are under [Deploying](#deploying). There is no test suite yet; `check` plus a test enquiry is the current bar.

## How it's put together

```
src/app/
  layout.tsx                 <html>, fonts, Header/Footer, Organization + WebSite JSON-LD
  page.tsx                   Home: composes its sections, nothing else
  _components/               The home page's own sections (HeroSection, FeaturesSection, HowSection)
  <route>/page.tsx           One folder per page; metadata + the sections it shows
  <route>/_components/       That page's sections, e.g. contact/_components/ContactSection.tsx
  thank-you/page.tsx         No-JS form redirect target, noindexed
  api/forms/[form]/route.dynamic.ts  Form endpoint (see Forms)
  error.tsx global-error.tsx not-found.tsx
  sitemap.ts robots.ts manifest.ts opengraph-image.tsx
  globals.css                Tailwind v4 theme tokens, base styles, .prose-content
src/components/
  partials/                  Site chrome on every page: Header, MobileNav, NavLink (aria-current), Footer
  sections/                  Sections shared between pages: Hero, FeatureGrid, MediaText, CtaBanner, FaqsSection
  ui/                        Primitives: Container, Section, Button, Img, SvgInline, Pending
  forms/                     ContactForm (client component), Field (TextField, TextArea, Select)
  seo/                       JsonLd
src/content/
  faqs.ts                    FAQ questions, grouped. Copy reused across pages lives here, not in components
src/lib/
  site.ts                    Business details: name, logo, contact, address, socials, schema type
  nav.ts                     Navigation items, header CTA, isActive()
  routes.ts                  Every public page, for sitemap.xml. Add new pages here
  seo.ts                     buildMetadata() and the JSON-LD builders
  utils.ts                   cn(), filled(), absoluteUrl()
  forms/                     forms.json (form definitions), registry (zod from JSON), spam, deliver, types
src/types/
  css.d.ts                   Allows CSS custom properties in inline styles: style={{ "--delay": "120ms" }}
public/icons/                SVG icons for <SvgInline> (check, mail, map-pin, phone)
```

Hosting-specific files (`php/`, `scripts/`) are listed under [Deploying](#deploying).

Everything is a Server Component except `ContactForm`, `MobileNav`, `NavLink` and the error boundaries. Imports use the `@/` alias for `src/`.

### Where things go

- **A new page**: `src/app/<route>/page.tsx` exports `metadata` (via `buildMetadata()`) and a default `Page()` that only composes sections. Copy specific to that page goes in `src/app/<route>/_components/<Name>Section.tsx` (the `_` keeps the folder out of routing). Add the route to `src/lib/routes.ts`, and to `nav` in `src/lib/nav.ts` if it belongs in the menu.
- **A section used on more than one page**: `src/components/sections/`, taking plain props so it works with hard-coded copy or CMS data. Promote a page's `_components` section here once a second page needs it.
- **Copy reused across pages** (FAQs, testimonials, service lists): `src/content/`, typed, so pages pick from it and it can later be swapped for CMS data.
- **Business details** (phone, address, socials): `src/lib/site.ts`. Every page reads them from there.

### Empty fields render nothing

Every component checks values with `filled()` from `src/lib/utils.ts`. A blank phone, address, social link, image, eyebrow, CTA or paragraph is simply not rendered (no fallback copy, no empty wrapper). JSON-LD only includes filled fields too. Keep that rule when adding components so CMS data stays honest.

### Content still to come from the client

Wrap anything the client hasn't supplied yet (prices, team photos, product ranges) in `<Pending>` from `src/components/ui/Pending.tsx`. It is **hidden unless `NEXT_PUBLIC_SHOW_PENDING=true`**, so the site can go live without placeholder boxes showing, while staging (or your machine) shows what's missing.

- Find everything still pending: `grep -rn "<Pending>" src`
- When the answer arrives: fill in the content and remove the `<Pending>` wrapper.

## New client checklist

1. **`src/lib/site.ts`**: name, logo, tagline, description, locale, contact details, address, hours, socials, schema type.
2. **`src/lib/nav.ts`** and **`src/lib/routes.ts`**: menu items, header CTA, sitemap routes.
3. **`src/app/globals.css`**: brand tokens in `@theme` (colours, fonts, extra breakpoints).
4. **`src/app/layout.tsx`**: swap the Google font (add a second with `variable: "--font-heading"` for headings). Check `<html lang>` (`en-AU`) matches `site.locale`.
5. **Hard-coded brand colours** that don't read the CSS tokens: `theme_color`/`background_color` in `src/app/manifest.ts`, `viewport.themeColor` in `layout.tsx`, and the gradient in `src/app/opengraph-image.tsx`.
6. **Assets**: replace `src/app/favicon.ico`; add `/public/logo.svg`, set `site.logo` and `logoWidth`/`logoHeight` (SVGs are served as-is; `next/image` skips optimisation for `.svg`). Add icons to `/public/icons/`.
7. **Content**: replace the demo sections in `src/app/_components/` and the questions in `src/content/faqs.ts`; pass `services` to `<ContactForm>` in `contact/_components/ContactSection.tsx` if the client wants the service dropdown.
8. **Env** (`.env.local` for dev, host settings for production). See [Environment variables](#environment-variables).
9. **Remote images**: if images come from a CMS/CDN, add its host to `images.remotePatterns` in `next.config.ts`.

## Components

Shared sections take plain props:

- **`<Section>`**: vertical rhythm, optional eyebrow/title/intro header, `tone` (`white`, `surface`, `brand`), `align`, container `size`.
- **`<Hero>`**: optional background image (with overlay), eyebrow, text, bullet points, primary and secondary CTA.
- **`<FeatureGrid>`**: 2, 3 or 4 columns of cards with optional icon and link.
- **`<MediaText>`**: image beside copy, `imageSide` left/right; full width without an image. Takes `paragraphs` or `html`. `html` is rendered as-is, so only pass trusted or sanitised CMS HTML.
- **`<FaqsSection>`**: native `<details>` accordion (works without JS) plus FAQPage JSON-LD. Pass `schema={false}` if the same questions appear twice on a page.
- **`<CtaBanner>`**: brand-coloured band with a CTA plus a call button when the site phone is set (`showPhone={false}` to hide).
- **`<Button>`**: renders a `Link` when `href` is set (plain `<a>` for `http`, `mailto:`, `tel:`), otherwise a `<button>`. Variants `primary`, `secondary`, `outline`, `ghost`; sizes `sm`, `md`, `lg`. `buttonClasses()` gives the same styles to other elements.

### Images and SVGs

- `<Img>` wraps `next/image`: empty `src` renders nothing, sensible `sizes` default, `eager` for the LCP image (Next 16 deprecates `priority`). Use `fill` inside a sized, `relative` parent for covers.
- `<SvgInline src="/icons/phone.svg" className="size-5" />` reads the file from `/public` on the server and inlines it, so it inherits `currentColor`. It strips XML prologs, comments, metadata, scripts and inline event handlers. Server components only. Decorative by default; pass `title` for an accessible name. `next.config.ts` traces `public/icons/**` into server bundles, so keep inline icons in that folder.

## SEO

- Per page: `export const metadata: Metadata = buildMetadata({ title, description, path })`, or return it from `generateMetadata()` for CMS pages. Sets canonical, Open Graph and Twitter consistently. Pass `noindex: true` for pages like `/thank-you`.
- Root layout sets `metadataBase`, the `%s | Site` title template and Organization/WebSite JSON-LD (only filled fields are output). Use `breadcrumbJsonLd()` on inner pages (see `contact/page.tsx`).
- **Staging is never indexed.** Until `NEXT_PUBLIC_SITE_ENV=production`, `robots.txt` disallows everything, every page is `noindex, nofollow`, and an `X-Robots-Tag: noindex, nofollow` header covers images and files (`next.config.ts`, or `.htaccess` on PHP hosting).
- `sitemap.ts` lists `src/lib/routes.ts`; append CMS slugs where marked.
- `opengraph-image.tsx` generates a default 1200x630 share image. Override per route or pass `image` to `buildMetadata()`.
- `robots.ts`, `sitemap.ts`, `manifest.ts` and `opengraph-image.tsx` are `force-static`, so they work in static exports.

## Environment variables

Copy `.env.example` to `.env.local` for local work; set the same names in the host for each environment.

| Variable                                     | Needed for                   | Notes                                                                 |
| -------------------------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                       | Canonicals, sitemap, JSON-LD | Production origin, no trailing slash                                  |
| `NEXT_PUBLIC_SITE_ENV`                       | Indexing                     | `production` on the live site **only**. Anything else blocks indexing |
| `NEXT_PUBLIC_SHOW_PENDING`                   | Staging review               | `true` shows `<Pending>` content. Never set it on production          |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`             | Forms (optional)             | Shows the Turnstile widget. Pair with `TURNSTILE_SECRET_KEY`          |
| `SMTP_*`, `FORM_FROM_EMAIL`, `FORM_TO_EMAIL` | Forms                        | Empty `SMTP_HOST` skips email. Port 465 uses implicit TLS             |
| `FORM_WEBHOOK_URL`, `FORM_WEBHOOK_SECRET`    | Forms (optional)             | Posts each enquiry as JSON; secret sent as `Authorization: Bearer`    |
| `TURNSTILE_SECRET_KEY`                       | Forms (optional)             | Verifies Turnstile tokens. Unset = check skipped                      |
| `DEPLOY_TARGET`                              | Build                        | `vercel` (default), `node` or `static`. Set by the build scripts      |

<!-- hosting:static -->

On PHP hosting the server values (`SMTP_*`, `FORM_*`, `TURNSTILE_SECRET_KEY`) go in `form-config.php` instead (see [Deploying](#deploying)); `.env.local` still drives `npm run dev`.
<!-- /hosting -->

`NEXT_PUBLIC_*` values are baked in at build time: rebuild/redeploy after changing them.

<!-- hosting:node,static -->

**Building for production on your machine:** Next.js loads `.env.local` _before_ `.env.production`, so the dev values from Getting started (`localhost`, `development`) win and get baked into the build, leaving the live site noindexed with localhost canonicals. Put production values in **`.env.production.local`** (it beats `.env.local` and is gitignored), or prefix the command:

```bash
NEXT_PUBLIC_SITE_URL=https://www.client.com.au NEXT_PUBLIC_SITE_ENV=production npm run build:node   # or build:static
```

<!-- /hosting -->

## Forms

Forms are defined once in `src/lib/forms/forms.json` (fields, labels, rules, messages, email subject with `{field}` placeholders, no-JS redirect).

<!-- hosting:vercel,node -->

Submissions go to `POST /api/forms/<key>`, handled by `src/app/api/forms/[form]/route.dynamic.ts` (zod, nodemailer).
<!-- /hosting -->
<!-- hosting:static -->

On the live site, submissions go to `POST /api/form.php?form=<key>`, handled by `php/api/form.php` (PHPMailer). In `npm run dev` they go to the Next.js route `src/app/api/forms/[form]/route.dynamic.ts` (zod, nodemailer). Both read `forms.json`, so validation is identical locally and live. `formEndpoint()` in `ContactForm.tsx` picks the right one.
<!-- /hosting -->

Field rules: `label`, `type` (`text`, `email`, `tel`, `textarea`, `select`, `checkbox`), `required`, `min`, `max`, `pattern` (regex source, no slashes) and `message`. `tel` fields get a default phone pattern (`PHONE_PATTERN` in `registry.ts`).
<!-- hosting:static -->

`PHONE_PATTERN` is duplicated in `php/api/form.php`, so change both.
<!-- /hosting -->

Pipeline: rate limit (5 per 10 min per IP) → validation (field errors returned as JSON) → bot checks → Turnstile (optional) → delivery.

- **Bot checks**: honeypot field `company_website` and a minimum fill time (`_ts`, set on mount, 3 s minimum, 6 h maximum). Bots get a fake success response.
- **Turnstile**: set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at build time plus the secret (see [Environment variables](#environment-variables)).
- **Delivery**: SMTP and/or webhook (GoHighLevel, Zapier, Make, n8n). Both can run; the submission succeeds if either delivers. Emails set `Reply-To` to the submitted `email` field.
- **No-JS fallback**: plain POSTs redirect to `/thank-you` on success, or get a simple error page listing the problems.
- **Rate limit**: every POST counts, including ones that fail validation. It is per server (in memory on Node, temp files on PHP), so on Vercel it is best effort; swap for Upstash/Redis if a site gets hammered.
- In production, a submission with no delivery channel configured returns an error to the visitor. Look for `[forms]` lines in the server logs.

Response shape (`src/lib/forms/types.ts`):

```ts
{ ok: true, message } | { ok: false, message, errors?: { [field]: string } }
```

### Adding a form

1. Add an entry to `forms.json`. The key becomes the endpoint (`/api/forms/<key>`).
2. Copy `ContactForm.tsx` as a starting point. Its fields are written out in JSX, so the input `name`s must match the keys in `forms.json`. Keep the honeypot input, the `_ts` hidden input and the Turnstile block, and post to `formEndpoint("<key>")`, which picks the right endpoint for the build target.
3. Test it with `npm run dev`.

<!-- hosting:static -->

4. Test the PHP handler too: `npm run build:static && npm run preview:static`.

<!-- /hosting -->

### Testing forms locally

- **`npm run dev`**: with no delivery configured, submissions are logged to the terminal. Fill in `SMTP_*` in `.env.local` to send real email.

<!-- hosting:static -->

- **`npm run preview:static`**: the PHP handler has no dev fallback and returns an error until it finds a `form-config.php`. Locally it looks in the project root, so copy `php/form-config.example.php` to `./form-config.php` (gitignored: it holds SMTP passwords).

<!-- /hosting -->

## Deploying

<!-- boilerplate -->

`DEPLOY_TARGET` switches the build (set by the scripts below; see `next.config.ts`). New projects keep only their own section.
<!-- /boilerplate -->
<!-- hosting:vercel -->

### Vercel

Import the repo in Vercel. No build settings needed: it runs `npm run build`. Add the env vars from `.env.example` in Project Settings, with `NEXT_PUBLIC_SITE_ENV=production` on the Production environment only, so preview deployments stay noindexed. While the site is still on staging, leave it unset everywhere.

Form secrets (`SMTP_*`, `FORM_*`, `TURNSTILE_SECRET_KEY`) go in the same Project Settings. To test production locally: `npm run build && npm start`.
<!-- /hosting -->
<!-- hosting:node -->

### cPanel with "Setup Node.js App"

```
scripts/package-node.mjs     Packages the standalone server into dist/node/ + dist/node.zip
```

1. `npm run build:node` (works on a Mac: the script swaps sharp's macOS binaries for Linux x64. Use `SERVER_CPU=arm64` or `SERVER_LIBC=musl` for other servers). It needs internet access to fetch those binaries. Output: `dist/node/` + `dist/node.zip` (~18 MB).
2. Upload `dist/node.zip` to a folder **outside** `public_html` (e.g. `~/apps/client-site`) and extract it.
3. Setup Node.js App: Node 20.9+ (22 recommended), mode Production, application root = that folder, startup file `server.js`, domain/URL = the site.
4. Add the server env vars (`SMTP_*`, `FORM_*`, `TURNSTILE_SECRET_KEY`) in the same screen, or keep them in `.env.production` in the project root before building (the script copies it into the bundle). Restart.

Do not run `npm install` or `next build` on the server: the bundle already contains its `node_modules`, and shared hosting usually runs out of memory building Next.js. Because the bundle has Linux binaries, it won't serve optimised images if run on a Mac; use `npm run build && npm start` to test locally.
<!-- /hosting -->
<!-- hosting:static -->

### cPanel, PHP only

```
php/
  .htaccess                  Apache rewrites, security headers, caching
  api/form.php               PHP form handler (same rules as the Next.js route)
  api/.htaccess              Blocks everything in /api except form.php
  api/lib/PHPMailer/         Vendored PHPMailer (SMTP / mail())
  form-config.example.php    PHP form settings template
  dev-router.php             Local preview router for `npm run preview:static`
scripts/
  package-static.mjs         Adds php/ to out/, fixes permissions, noindexes staging builds
```

1. `npm run build:static`. Output: `out/` + `dist/static.zip`. It prints a warning if the build isn't `production` (and noindexes it).
2. Upload the **contents** of `out/` (or `dist/static.zip`) to `public_html`, including the hidden `.htaccess` files. The script sets permissions to 644/755, so Apache can read them.
3. Copy `php/form-config.example.php` to `/home/<cpanel-user>/form-config.php` (outside `public_html`) and fill it in. cPanel mailbox SMTP: host `mail.<domain>`, port 465, full email address as the username. No SMTP? Set `use_php_mail` to send with the server's `mail()`. Use a From address on the site's own domain so it passes SPF/DMARC.
4. Uncomment the HTTPS redirect in `.htaccess` once SSL is active.

Requires PHP 8.1+ with curl (standard on cPanel). Test locally with `npm run preview:static` (PHP's built-in server on http://localhost:8080 plus `php/dev-router.php`, which mimics the `.htaccess` rewrites).

There is no image optimisation on PHP hosting: images are served as uploaded, so size and compress them first.

Static builds can't use anything that needs a server at request time: middleware/`proxy.ts`, ISR, Server Actions, cookies, or dynamic routes without `generateStaticParams()`. Server-only route handlers must use the `.dynamic.ts` extension so static builds skip them.
<!-- /hosting -->

### Before going live

- [ ] `npm run check` passes
- [ ] `NEXT_PUBLIC_SITE_URL` is the live origin and `NEXT_PUBLIC_SITE_ENV=production` on the production build only
- [ ] `NEXT_PUBLIC_SHOW_PENDING` is **not** set on production, and `grep -rn "<Pending>" src` shows nothing the client still owes
- [ ] Demo copy gone: `src/app/_components/`, `src/content/faqs.ts`, `site.name` is not "Client Name"
- [ ] Favicon, logo, brand colours (including `manifest.ts`, `opengraph-image.tsx`) updated
- [ ] A test enquiry arrives by every configured channel (email, webhook)
- [ ] HTTPS working; `/sitemap.xml` and `/robots.txt` on the live domain list live URLs, and no `X-Robots-Tag` header

<!-- hosting:static -->

- [ ] HTTPS redirect uncommented in `.htaccess`

<!-- /hosting -->

## Working on it

- Branch from `main` and open a pull request.
- Run `npm run check` before pushing, and send a test enquiry after touching forms.
- Pages compose sections; copy lives in `_components` or `src/content`; business details in `src/lib/site.ts`. New pages also go in `src/lib/routes.ts`.
- Next.js 16 differs from older docs and tutorials: the matching docs ship in `node_modules/next/dist/docs/`.

## Troubleshooting

- **"Next.js ignored package-lock.json in /Users/…"** during builds: a stray lockfile in a parent folder (e.g. your home directory). Harmless; delete it if nothing needs it.
- **Live site is noindexed or canonicals point at localhost**: the build picked up dev values. See [Environment variables](#environment-variables).
- **Form says "something went wrong"**: no delivery channel is configured or every channel failed. Check the logs for `[forms]` lines.

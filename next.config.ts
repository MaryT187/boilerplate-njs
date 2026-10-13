import type { NextConfig } from "next";
import { isProduction } from "./src/lib/site";

/**
 * One codebase, three hosts. Pick with DEPLOY_TARGET (see package.json scripts):
 *
 *   vercel (default)  Plain Next.js. Vercel needs no config.
 *   node              cPanel "Setup Node.js App" / VPS / Docker. Standalone server.js.
 *   static            PHP-only cPanel. Static HTML in out/, forms handled by php/form.php.
 */
export type DeployTarget = "vercel" | "node" | "static";

const target = (process.env.DEPLOY_TARGET ?? "vercel") as DeployTarget;
if (!["vercel", "node", "static"].includes(target)) {
  throw new Error(`DEPLOY_TARGET must be vercel, node or static (got "${target}")`);
}
const isStatic = target === "static";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// Until NEXT_PUBLIC_SITE_ENV=production, nothing gets indexed: robots.txt disallows everything (src/app/robots.ts),
// every page carries noindex (src/lib/seo.ts) and this header covers the rest (images, PDFs, API responses).
// Static builds get the same header in .htaccess from scripts/package-static.mjs.
const noindexHeaders = isProduction ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Server-only files (the form API route) use the ".dynamic.ts" extension, so static builds skip them.
  pageExtensions: isStatic ? ["tsx", "ts"] : ["tsx", "ts", "dynamic.ts"],

  ...(target === "node" && { output: "standalone" }),
  ...(isStatic && { output: "export" }),

  // Exposed to the browser so the form posts to the right endpoint.
  env: { NEXT_PUBLIC_DEPLOY_TARGET: target },

  images: {
    // Static hosting has no image optimiser: images are served as uploaded, so size them before adding.
    unoptimized: isStatic,
    formats: ["image/avif", "image/webp"],
    // Add CMS/CDN hosts here when images come from elsewhere.
    remotePatterns: [],
  },

  // <SvgInline> reads /public/icons at render time. Make sure serverless/standalone bundles include them.
  outputFileTracingIncludes: { "/*": ["./public/icons/**/*"] },

  // Static export can't set headers; php/.htaccess sets the same ones on Apache.
  ...(!isStatic && {
    async headers() {
      return [{ source: "/:path*", headers: [...securityHeaders, ...noindexHeaders] }];
    },
  }),
};

export default nextConfig;

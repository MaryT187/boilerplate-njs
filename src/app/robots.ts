import type { MetadataRoute } from "next";
import { isProduction, site } from "@/lib/site";

// Generated at build time on every target (required for static export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

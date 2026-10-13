import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { routes } from "@/lib/routes";

// Generated at build time on every target (required for static export).
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  // CMS/dynamic routes: fetch slugs and append, e.g.
  // const posts = await getPosts();
  // const postRoutes = posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.updatedAt }));

  return [...staticRoutes];
}

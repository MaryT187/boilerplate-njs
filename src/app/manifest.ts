import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Generated at build time on every target (required for static export).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}

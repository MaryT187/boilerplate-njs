import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { filled } from "@/lib/utils";

// Generated at build time on every target (required for static export).
export const dynamic = "force-static";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share image. Pages can add their own opengraph-image.tsx or pass `image` to buildMetadata(). */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 80,
        background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
        color: "white",
      }}
    >
      <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>{site.name}</div>
      {filled(site.tagline) && <div style={{ fontSize: 36, marginTop: 20, opacity: 0.85 }}>{site.tagline}</div>}
    </div>,
    size,
  );
}

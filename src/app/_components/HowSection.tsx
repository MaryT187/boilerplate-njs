import { MediaText } from "@/components/sections/MediaText";

export function HowSection() {
  return (
    <MediaText
      eyebrow="How it works"
      title="Configure once in src/lib"
      paragraphs={[
        "Business name, contact details, address, socials and schema type live in site.ts; navigation in nav.ts; sitemap routes in routes.ts.",
        "Anything left blank simply doesn't render, so the header, footer and structured data stay accurate to what the client has actually supplied.",
      ]}
      cta={{ label: "Send a test enquiry", href: "/contact" }}
    />
  );
}

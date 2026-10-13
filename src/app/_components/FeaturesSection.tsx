import { FeatureGrid } from "@/components/sections/FeatureGrid";

export function FeaturesSection() {
  return (
    <FeatureGrid
      id="features"
      eyebrow="What's included"
      title="Sections you can drop into any page"
      intro="Each section takes plain props, so the same component works with hard-coded copy or CMS data."
      tone="surface"
      items={[
        { title: "Hero", text: "Optional background image, eyebrow, points and two CTAs.", icon: "/icons/check.svg" },
        {
          title: "Feature grid",
          text: "Two, three or four columns that stack cleanly on mobile.",
          icon: "/icons/check.svg",
        },
        {
          title: "Media and text",
          text: "Image beside copy, flips sides, collapses to full width without an image.",
          icon: "/icons/check.svg",
        },
        {
          title: "FAQs",
          text: "Native accordion with FAQPage schema. Questions live in src/content.",
          icon: "/icons/check.svg",
        },
        {
          title: "Contact form",
          text: "Validated on both sides, delivered by SMTP and/or webhook.",
          icon: "/icons/check.svg",
          href: "/contact",
        },
        {
          title: "SEO helpers",
          text: "buildMetadata(), JSON-LD, sitemap.xml, robots.txt and an OG image.",
          icon: "/icons/check.svg",
        },
      ]}
    />
  );
}

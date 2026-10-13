import { Hero } from "@/components/sections/Hero";

export function HeroSection() {
  return (
    <Hero
      eyebrow="Boilerplate"
      title="A fast, responsive starting point for every client site"
      text="Next.js App Router, Tailwind CSS v4, SEO defaults and a working form API, ready to brand."
      primary={{ label: "Contact us", href: "/contact" }}
      secondary={{ label: "View sections", href: "#features" }}
      points={[
        "Mobile first layout",
        "Metadata, sitemap and schema",
        "Spam protected forms",
        "Empty fields render nothing",
      ]}
    />
  );
}

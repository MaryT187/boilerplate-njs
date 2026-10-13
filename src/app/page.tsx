import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { generalFaqs } from "@/content/faqs";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqsSection } from "@/components/sections/FaqsSection";
import { HeroSection } from "./_components/HeroSection";
import { FeaturesSection } from "./_components/FeaturesSection";
import { HowSection } from "./_components/HowSection";

// Demo home. The page only composes sections: copy for this page lives in ./_components, shared sections in
// src/components/sections, reusable copy (FAQs) in src/content.
export const metadata: Metadata = buildMetadata({ path: "/" });

export default function Page() {
  return (
    <>
      <HeroSection />

      <FeaturesSection />

      <HowSection />

      <FaqsSection eyebrow="FAQs" title="Questions, answered" items={generalFaqs} tone="surface" />

      <CtaBanner
        title="Ready to start the next build?"
        text="Clone, brand the tokens in globals.css, fill in src/lib/site.ts and go."
        cta={{ label: "Get in touch", href: "/contact" }}
      />
    </>
  );
}

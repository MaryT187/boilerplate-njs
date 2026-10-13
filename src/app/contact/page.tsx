import type { Metadata } from "next";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { generalFaqs } from "@/content/faqs";
import { FaqsSection } from "@/components/sections/FaqsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactSection } from "./_components/ContactSection";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
  path: "/contact",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <ContactSection />

      <FaqsSection eyebrow="FAQs" title="Before you get in touch" items={generalFaqs} />
    </>
  );
}

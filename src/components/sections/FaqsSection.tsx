import type { Faq } from "@/content/faqs";
import { faqPageJsonLd } from "@/lib/seo";
import { filled } from "@/lib/utils";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = Omit<React.ComponentProps<typeof Section>, "children"> & {
  items: Faq[];
  /** Output FAQPage JSON-LD (default true). Turn off if the same questions appear twice on one page. */
  schema?: boolean;
};

/** Accordion of questions using native <details>, so it works without JavaScript. Questions live in src/content. */
export function FaqsSection({ items, schema = true, id = "faqs", size = "sm", ...section }: Props) {
  const list = items.filter((faq) => filled(faq.question) && filled(faq.answer));
  if (list.length === 0) return null;

  return (
    <Section id={id} size={size} {...section}>
      {schema && <JsonLd data={faqPageJsonLd(list)} />}
      <div className="divide-y divide-line rounded-xl border border-line bg-white">
        {list.map((faq) => (
          <details key={faq.question} className="group px-5 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">
              {faq.question}
              <svg
                viewBox="0 0 24 24"
                className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <p className="pb-5 whitespace-pre-line text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

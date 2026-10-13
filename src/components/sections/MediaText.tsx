import { cn, filled } from "@/lib/utils";
import { Section } from "@/components/ui/Section";
import { Img } from "@/components/ui/Img";
import { Button } from "@/components/ui/Button";

type Props = {
  eyebrow?: string;
  title?: string;
  /** Plain paragraphs. For CMS HTML, pass `html` instead. */
  paragraphs?: string[];
  html?: string;
  image?: string;
  imageAlt?: string;
  imageSide?: "left" | "right";
  cta?: { label?: string; href?: string };
  tone?: React.ComponentProps<typeof Section>["tone"];
};

/** Image + copy, stacks on mobile. With no image the copy takes the full width. */
export function MediaText({
  eyebrow,
  title,
  paragraphs,
  html,
  image,
  imageAlt,
  imageSide = "right",
  cta,
  tone,
}: Props) {
  const hasImage = filled(image);
  const hasCopy = filled(title) || filled(paragraphs) || filled(html);
  if (!hasImage && !hasCopy) return null;

  return (
    <Section tone={tone}>
      <div className={cn("grid items-center gap-10 lg:gap-16", hasImage && "lg:grid-cols-2")}>
        {hasImage && (
          <div
            className={cn(
              "relative aspect-4/3 overflow-hidden rounded-2xl",
              imageSide === "left" ? "lg:order-first" : "lg:order-last",
            )}
          >
            <Img src={image} alt={imageAlt ?? ""} fill sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
        )}
        <div>
          {filled(eyebrow) && (
            <p className="mb-3 text-sm font-semibold tracking-wider text-brand uppercase">{eyebrow}</p>
          )}
          {filled(title) && <h2 className="text-3xl sm:text-4xl">{title}</h2>}
          {filled(html) ? (
            <div className="prose-content mt-5" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            filled(paragraphs) && (
              <div className="prose-content mt-5">
                {paragraphs!.filter(filled).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            )
          )}
          {cta && filled(cta.label) && filled(cta.href) && (
            <Button href={cta.href} className="mt-8">
              {cta.label}
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}

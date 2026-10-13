import { cn, filled } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";

type Link = { label?: string; href?: string };

type Props = {
  eyebrow?: string;
  title: string;
  text?: string;
  primary?: Link;
  secondary?: Link;
  /** Background image path. Empty renders a plain brand background. */
  image?: string;
  imageAlt?: string;
  points?: string[];
};

const isLink = (l?: Link): l is Required<Link> => !!l && filled(l.label) && filled(l.href);

export function Hero({ eyebrow, title, text, primary, secondary, image, imageAlt, points }: Props) {
  const hasImage = filled(image);

  return (
    <section className={cn("relative isolate overflow-hidden", hasImage ? "bg-ink text-white" : "bg-surface")}>
      {hasImage && (
        <>
          <Img src={image} alt={imageAlt ?? ""} fill eager className="-z-20" />
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink/90 via-ink/70 to-ink/30" aria-hidden="true" />
        </>
      )}
      <Container className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          {filled(eyebrow) && (
            <p
              className={cn(
                "mb-4 text-sm font-semibold tracking-wider uppercase",
                hasImage ? "text-accent" : "text-brand",
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
          {filled(text) && (
            <p className={cn("mt-5 text-lg sm:text-xl", hasImage ? "text-white/85" : "text-muted")}>{text}</p>
          )}

          {filled(points) && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {points!.filter(filled).map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          )}

          {(isLink(primary) || isLink(secondary)) && (
            <div className="mt-8 flex flex-col gap-3 xs:flex-row">
              {isLink(primary) && (
                <Button href={primary.href} size="lg">
                  {primary.label}
                </Button>
              )}
              {isLink(secondary) && (
                <Button href={secondary.href} size="lg" variant="outline">
                  {secondary.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

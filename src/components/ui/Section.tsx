import { cn, filled } from "@/lib/utils";
import { Container } from "./Container";

type Props = {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  tone?: "white" | "surface" | "brand";
  size?: React.ComponentProps<typeof Container>["size"];
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
};

const tones = {
  white: "bg-white",
  surface: "bg-surface",
  brand: "bg-brand text-brand-fg",
};

/** Standard vertical rhythm + optional heading block. Empty heading fields render nothing. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  tone = "white",
  size = "lg",
  align = "left",
  className,
  children,
}: Props) {
  const hasHeader = filled(eyebrow) || filled(title) || filled(intro);
  const muted = tone === "brand" ? "text-brand-fg/80" : "text-muted";

  return (
    <section id={id} className={cn("py-14 sm:py-20 lg:py-24", tones[tone], className)}>
      <Container size={size}>
        {hasHeader && (
          <header className={cn("mb-10 max-w-3xl sm:mb-14", align === "center" && "mx-auto text-center")}>
            {filled(eyebrow) && (
              <p
                className={cn(
                  "mb-3 text-sm font-semibold tracking-wider uppercase",
                  tone === "brand" ? "text-accent" : "text-brand",
                )}
              >
                {eyebrow}
              </p>
            )}
            {filled(title) && <h2 className="text-3xl sm:text-4xl">{title}</h2>}
            {filled(intro) && <p className={cn("mt-4 text-base sm:text-lg", muted)}>{intro}</p>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}

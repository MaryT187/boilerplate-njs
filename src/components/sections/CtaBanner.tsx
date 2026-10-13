import { site } from "@/lib/site";
import { filled } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  text?: string;
  cta?: { label?: string; href?: string };
  /** Show the site phone number as a second button (only when it is filled in site config). */
  showPhone?: boolean;
};

export function CtaBanner({ title, text, cta, showPhone = true }: Props) {
  const { phone, phoneHref } = site.contact;
  const phoneLink = showPhone && filled(phone) && filled(phoneHref);
  const ctaLink = cta && filled(cta.label) && filled(cta.href);

  return (
    <section className="bg-brand text-brand-fg">
      <Container className="flex flex-col gap-6 py-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl">{title}</h2>
          {filled(text) && <p className="mt-3 text-brand-fg/85 sm:text-lg">{text}</p>}
        </div>
        {(ctaLink || phoneLink) && (
          <div className="flex shrink-0 flex-col gap-3 xs:flex-row">
            {ctaLink && (
              <Button href={cta!.href!} variant="secondary" size="lg">
                {cta!.label}
              </Button>
            )}
            {phoneLink && (
              <Button href={`tel:${phoneHref}`} variant="outline" size="lg">
                Call {phone}
              </Button>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

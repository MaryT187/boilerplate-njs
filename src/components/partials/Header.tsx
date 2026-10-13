import Link from "next/link";
import { site } from "@/lib/site";
import { cta, nav } from "@/lib/nav";
import { filled } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Img } from "@/components/ui/Img";
import { Button } from "@/components/ui/Button";
import { SvgInline } from "@/components/ui/SvgInline";
import { NavLink } from "./NavLink";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { contact } = site;
  const phone =
    filled(contact.phone) && filled(contact.phoneHref)
      ? { label: contact.phone, href: `tel:${contact.phoneHref}` }
      : undefined;
  const headerCta = filled(cta.label) && filled(cta.href) ? cta : undefined;

  return (
    <header className="sticky top-0 z-50 h-(--header-h) border-b border-line bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${site.name} home`}>
          {filled(site.logo) ? (
            <Img
              src={site.logo}
              alt={site.name}
              width={site.logoWidth}
              height={site.logoHeight}
              eager
              className="h-8 w-auto sm:h-10"
            />
          ) : (
            <span className="font-display text-lg font-bold sm:text-xl">{site.name}</span>
          )}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} className="rounded-lg px-3 py-2 font-medium hover:bg-surface">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {phone && (
            <a
              href={phone.href}
              className="inline-flex items-center gap-2 font-semibold whitespace-nowrap hover:text-brand"
            >
              <SvgInline src="/icons/phone.svg" className="size-5" />
              {phone.label}
            </a>
          )}
          {headerCta && <Button href={headerCta.href}>{headerCta.label}</Button>}
        </div>

        <MobileNav items={nav} cta={headerCta} phone={phone} />
      </Container>
    </header>
  );
}

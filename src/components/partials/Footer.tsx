import Link from "next/link";
import { site } from "@/lib/site";
import { nav } from "@/lib/nav";
import { filled } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { SvgInline } from "@/components/ui/SvgInline";

const socialLabels: Record<keyof typeof site.social, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export function Footer() {
  const { contact, social } = site;
  const a = contact.address;
  const addressLines = [a.street, [a.locality, a.region, a.postcode].filter(filled).join(" ")].filter(filled);
  const socials = (Object.keys(social) as Array<keyof typeof social>).filter((k) => filled(social[k]));
  const hasContact = filled(contact.phone) || filled(contact.email) || addressLines.length > 0 || filled(contact.hours);

  return (
    <footer className="mt-auto bg-ink text-white/80">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 sm:py-16 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-xl font-bold text-white">{site.name}</p>
          {filled(site.description) && <p className="mt-3 max-w-md">{site.description}</p>}
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-4">
              {socials.map((key) => (
                <li key={key}>
                  <a href={social[key]} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {socialLabels[key]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer">
          <p className="mb-3 font-semibold text-white">Pages</p>
          <ul className="space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {hasContact && (
          <div>
            <p className="mb-3 font-semibold text-white">Contact</p>
            <ul className="space-y-3">
              {filled(contact.phone) && (
                <li className="flex gap-2">
                  <SvgInline src="/icons/phone.svg" className="mt-0.5 size-5 shrink-0" />
                  {filled(contact.phoneHref) ? (
                    <a href={`tel:${contact.phoneHref}`} className="hover:text-white">
                      {contact.phone}
                    </a>
                  ) : (
                    <span>{contact.phone}</span>
                  )}
                </li>
              )}
              {filled(contact.email) && (
                <li className="flex gap-2">
                  <SvgInline src="/icons/mail.svg" className="mt-0.5 size-5 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-white">
                    {contact.email}
                  </a>
                </li>
              )}
              {addressLines.length > 0 && (
                <li className="flex gap-2">
                  <SvgInline src="/icons/map-pin.svg" className="mt-0.5 size-5 shrink-0" />
                  <address className="not-italic">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
              )}
              {filled(contact.hours) && <li>{contact.hours}</li>}
            </ul>
          </div>
        )}
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-sm sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}

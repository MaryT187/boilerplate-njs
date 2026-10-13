import { site } from "@/lib/site";
import { filled } from "@/lib/utils";
import { Section } from "@/components/ui/Section";
import { SvgInline } from "@/components/ui/SvgInline";
import { ContactForm } from "@/components/forms/ContactForm";

/** Contact form beside the phone, email, address and hours from site.ts. Unfilled details are left out. */
export function ContactSection() {
  const { contact } = site;
  const a = contact.address;
  const address = [a.street, [a.locality, a.region, a.postcode].filter(filled).join(" ")].filter(filled).join(", ");

  const details = [
    filled(contact.phone) && {
      icon: "/icons/phone.svg",
      label: "Phone",
      value: contact.phone,
      href: filled(contact.phoneHref) ? `tel:${contact.phoneHref}` : undefined,
    },
    filled(contact.email) && {
      icon: "/icons/mail.svg",
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    filled(address) && { icon: "/icons/map-pin.svg", label: "Address", value: address },
  ].filter(Boolean) as Array<{ icon: string; label: string; value: string; href?: string }>;

  return (
    <Section title="Contact us" intro="Send us a message and we'll get back to you." tone="surface">
      <div className={details.length > 0 ? "grid gap-10 lg:grid-cols-3 lg:gap-12" : ""}>
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-8 lg:col-span-2">
          <ContactForm services={[]} />
        </div>

        {details.length > 0 && (
          <aside className="space-y-6">
            {details.map((d) => (
              <div key={d.label} className="flex gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <SvgInline src={d.icon} className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-muted">{d.label}</p>
                  {d.href ? (
                    <a href={d.href} className="font-medium break-words hover:text-brand">
                      {d.value}
                    </a>
                  ) : (
                    <p className="font-medium">{d.value}</p>
                  )}
                </div>
              </div>
            ))}
            {filled(contact.hours) && <p className="text-muted">{contact.hours}</p>}
          </aside>
        )}
      </div>
    </Section>
  );
}

import type { Metadata } from "next";
import { isProduction, site } from "./site";
import { filled } from "./utils";

type PageSeo = {
  /** Page title. Root layout applies the "%s | Site Name" template. */
  title?: string;
  description?: string;
  /** Route path, e.g. "/services/plumbing". Sets the canonical URL. */
  path: string;
  /** Absolute URL or /public path. Omit to use the generated opengraph-image. */
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
};

/**
 * Per-page metadata with canonical, Open Graph and Twitter set consistently.
 *   export const metadata = buildMetadata({ title: "Contact", description: "...", path: "/contact" });
 * or return it from generateMetadata() for CMS pages.
 */
export function buildMetadata({ title, description, path, image, noindex, type = "website" }: PageSeo): Metadata {
  const desc = filled(description) ? description : undefined;
  const images = filled(image) ? [{ url: image }] : undefined;

  return {
    ...(filled(title) && { title }),
    ...(desc && { description: desc }),
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      locale: site.locale,
      ...(filled(title) && { title }),
      ...(desc && { description: desc }),
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      ...(filled(title) && { title }),
      ...(desc && { description: desc }),
      ...(images && { images }),
    },
    ...((noindex || !isProduction) && { robots: { index: false, follow: false } }),
  };
}

/** schema.org Organization/LocalBusiness built only from filled site fields. */
export function organizationJsonLd() {
  const { contact, social } = site;
  const a = contact.address;
  const hasAddress = [a.street, a.locality, a.region, a.postcode].some(filled);
  const sameAs = Object.values(social).filter(filled);

  return {
    "@context": "https://schema.org",
    "@type": site.schemaType,
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    ...(filled(site.description) && { description: site.description }),
    ...(filled(site.logo) && { logo: `${site.url}${site.logo}`, image: `${site.url}${site.logo}` }),
    ...(filled(contact.phoneHref) && { telephone: contact.phoneHref }),
    ...(filled(contact.email) && { email: contact.email }),
    ...(hasAddress && {
      address: {
        "@type": "PostalAddress",
        ...(filled(a.street) && { streetAddress: a.street }),
        ...(filled(a.locality) && { addressLocality: a.locality }),
        ...(filled(a.region) && { addressRegion: a.region }),
        ...(filled(a.postcode) && { postalCode: a.postcode }),
        ...(filled(a.country) && { addressCountry: a.country }),
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    publisher: { "@id": `${site.url}/#organization` },
  };
}

export function faqPageJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

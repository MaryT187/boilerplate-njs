/**
 * Single source of truth for per-client details. Navigation is in nav.ts, sitemap routes in routes.ts.
 * Leave a value as an empty string (or empty array) and anything that
 * depends on it renders nothing. No fallbacks, no stand-in content.
 */

export const site = {
  name: "Client Name",
  /** Path in /public, e.g. "/logo.svg". Empty shows the site name as text. */
  logo: "",
  logoWidth: 160,
  logoHeight: 40,
  /** Used for <title> template and OG image. */
  tagline: "",
  description: "",
  /** Canonical origin, no trailing slash. Set NEXT_PUBLIC_SITE_URL per environment. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_AU",

  contact: {
    phone: "",
    /** Digits only with country code, used for tel: links. e.g. +61290000000 */
    phoneHref: "",
    email: "",
    address: {
      street: "",
      locality: "",
      region: "",
      postcode: "",
      country: "AU",
    },
    hours: "",
  },

  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },

  /** schema.org type for the JSON-LD block, e.g. LocalBusiness, Dentist, Plumber, MedicalClinic. */
  schemaType: "LocalBusiness",
} as const;

/** "production" | "staging" | "development". Anything but production is noindexed. */
export const siteEnv = process.env.NEXT_PUBLIC_SITE_ENV ?? "development";
export const isProduction = siteEnv === "production";

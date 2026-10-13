import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { isProduction, site } from "@/lib/site";
import { filled } from "@/lib/utils";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { Header } from "@/components/partials/Header";
import { Footer } from "@/components/partials/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

// Swap per client. Add a second font with variable "--font-heading" for display type.
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: filled(site.tagline) ? `${site.name} | ${site.tagline}` : site.name,
    template: `%s | ${site.name}`,
  },
  ...(filled(site.description) && { description: site.description }),
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.name, locale: site.locale, url: "/" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  // Staging and local builds are never indexed.
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={body.variable}>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

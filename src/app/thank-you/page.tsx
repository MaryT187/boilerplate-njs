import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

// Redirect target for forms submitted without JavaScript. Also handy as a conversion page for analytics.
export const metadata: Metadata = buildMetadata({ title: "Thank you", path: "/thank-you", noindex: true });

export default function Page() {
  return (
    <Container size="sm" className="py-24 text-center sm:py-32">
      <h1 className="text-4xl sm:text-5xl">Thank you</h1>
      <p className="mt-4 text-lg text-muted">We have received your message and will be in touch soon.</p>
      <Button href="/" size="lg" className="mt-8">
        Back to home
      </Button>
    </Container>
  );
}

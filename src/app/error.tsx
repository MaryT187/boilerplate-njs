"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container size="sm" className="py-24 text-center sm:py-32">
      <h1 className="text-4xl sm:text-5xl">Something went wrong</h1>
      <p className="mt-4 text-lg text-muted">Please try again, or head back to the home page.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 xs:flex-row">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
        <Button href="/" size="lg" variant="outline">
          Back to home
        </Button>
      </div>
    </Container>
  );
}

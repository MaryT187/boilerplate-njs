import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container size="sm" className="py-24 text-center sm:py-32">
      <p className="text-sm font-semibold tracking-wider text-brand uppercase">404</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Page not found</h1>
      <p className="mt-4 text-lg text-muted">The page you are looking for has moved or no longer exists.</p>
      <Button href="/" size="lg" className="mt-8">
        Back to home
      </Button>
    </Container>
  );
}

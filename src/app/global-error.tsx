"use client";

// Replaces the root layout when it fails, so it must render its own <html> and <body>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "6rem 1rem" }}>
        <h1>Something went wrong</h1>
        <button type="button" onClick={reset} style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem" }}>
          Try again
        </button>
      </body>
    </html>
  );
}

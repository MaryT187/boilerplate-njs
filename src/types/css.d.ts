import "react";

// Allows CSS custom properties in inline styles, e.g. style={{ "--delay": "120ms" }}.
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}

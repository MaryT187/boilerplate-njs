import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg hover:bg-brand-dark",
  secondary: "bg-accent text-ink hover:brightness-95",
  outline: "border border-current hover:bg-black/5",
  ghost: "hover:bg-black/5",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-5 text-base",
  lg: "min-h-13 px-7 text-lg",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: React.ReactNode };
type AsLink = Common & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">;
type AsButton = Common & { href?: undefined } & Omit<React.ComponentProps<"button">, "className">;

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

/** Renders a Link when `href` is set, otherwise a <button>. */
export function Button(props: AsLink | AsButton) {
  const { variant, size, className, children, ...rest } = props;
  const classes = buttonClasses(variant, size, className);

  if (rest.href !== undefined) {
    const isExternal = /^(https?:|mailto:|tel:)/.test(rest.href);
    if (isExternal) {
      const { href, ...anchor } = rest as AsLink;
      return (
        <a href={href} className={classes} {...(anchor as React.ComponentProps<"a">)}>
          {children}
        </a>
      );
    }
    return (
      <Link className={classes} {...(rest as AsLink)}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...button } = rest as AsButton;
  return (
    <button type={type} className={classes} {...button}>
      {children}
    </button>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Link> & { href: string; activeClassName?: string };

/** Link that sets aria-current="page" and an active class on the current route. */
export function NavLink({ href, className, activeClassName = "text-brand", ...props }: Props) {
  const pathname = usePathname();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(className, active && activeClassName)}
      {...props}
    />
  );
}

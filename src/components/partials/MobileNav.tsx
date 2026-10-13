"use client";

import { useEffect, useId, useState } from "react";
import type { NavItem } from "@/lib/nav";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { NavLink } from "./NavLink";

type Props = {
  items: readonly NavItem[];
  cta?: { label: string; href: string };
  phone?: { label: string; href: string };
};

export function MobileNav({ items, cta, phone }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.matchMedia("(min-width: 64rem)").matches && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-lg hover:bg-black/5"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 top-(--header-h) bottom-0 z-40 overflow-y-auto border-t border-line bg-white"
      >
        <nav aria-label="Mobile" className="px-4 py-6 sm:px-6">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  onClick={close}
                  className="block rounded-lg px-3 py-3 text-lg font-medium hover:bg-surface"
                  activeClassName="text-brand bg-surface"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {(cta || phone) && (
            <div className="mt-6 grid gap-3 border-t border-line pt-6">
              {phone && (
                <a href={phone.href} className={cn(buttonClasses("outline", "lg"), "w-full")}>
                  Call {phone.label}
                </a>
              )}
              {cta && (
                <NavLink
                  href={cta.href}
                  onClick={close}
                  className={cn(buttonClasses("primary", "lg"), "w-full")}
                  activeClassName=""
                >
                  {cta.label}
                </NavLink>
              )}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

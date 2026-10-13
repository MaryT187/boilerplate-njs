/** Site navigation. Used by the header, mobile menu and footer. */

export type NavItem = { label: string; href: string };

export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact" },
];

/** Primary header CTA. Empty label hides it. */
export const cta = { label: "Get in touch", href: "/contact" };

/** True when `href` is the page being shown or one of its children. "/" only matches the home page. */
export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

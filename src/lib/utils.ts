/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** True when a CMS/config value actually has content. Use it to decide whether to render. */
export function filled<T>(value: T | null | undefined): value is T {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/", origin: string) {
  return new URL(path, origin + "/").toString();
}

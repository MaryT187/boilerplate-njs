import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { filled } from "@/lib/utils";

const cache = new Map<string, string>();

async function load(src: string) {
  const cached = cache.get(src);
  if (cached) return cached;

  const file = path.join(process.cwd(), "public", path.normalize(src).replace(/^(\.\.(\/|\\|$))+/, ""));
  const raw = await readFile(file, "utf8");

  const clean = raw
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    // Editor/provenance metadata (Illustrator, Figma, C2PA) can add kilobytes per icon.
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, "")
    .replace(/\sxmlns:(?!xlink)\w+="[^"]*"/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .trim();

  cache.set(src, clean);
  return clean;
}

type Props = {
  /** Path inside /public, e.g. "/icons/phone.svg". */
  src?: string | null;
  className?: string;
  /** Accessible name. Omit for decorative icons (they get aria-hidden). */
  title?: string;
  /** Strip width/height so the SVG sizes from CSS (default true). */
  fluid?: boolean;
};

/**
 * Inlines an SVG from /public at render time (the svg_inline() equivalent),
 * so it inherits currentColor and can be styled with Tailwind.
 * Server component only. For <img>-style SVGs, use <Img src="/x.svg" unoptimized />.
 */
export async function SvgInline({ src, className, title, fluid = true }: Props) {
  if (!filled(src)) return null;

  let svg = await load(src);

  const attrs = [
    className ? `class="${className}"` : "",
    title ? `role="img" aria-label="${title.replace(/"/g, "&quot;")}"` : `aria-hidden="true" focusable="false"`,
  ]
    .filter(Boolean)
    .join(" ");

  svg = svg.replace(/<svg\b([^>]*)>/i, (_m, existing: string) => {
    let a = existing.replace(/\sclass="[^"]*"/i, "");
    if (fluid) a = a.replace(/\s(width|height)="[^"]*"/gi, "");
    return `<svg${a} ${attrs}>`;
  });

  return <span className="contents" dangerouslySetInnerHTML={{ __html: svg }} />;
}

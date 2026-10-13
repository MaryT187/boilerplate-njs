import Image, { type ImageProps } from "next/image";
import { cn, filled } from "@/lib/utils";

type Props = Omit<ImageProps, "src" | "alt" | "priority" | "preload"> & {
  src?: ImageProps["src"] | null;
  alt?: string | null;
  /** Above-the-fold / LCP image: loads eagerly with high fetch priority. */
  eager?: boolean;
};

/**
 * next/image with project defaults (the imgx() equivalent).
 * - Empty src renders nothing, so unfilled CMS image fields leave no gap or placeholder.
 * - Default `sizes` assumes full-width on mobile, half on desktop. Override per use.
 * - Use `fill` inside a positioned, sized parent for cover images.
 */
export function Img({ src, alt, eager, sizes, className, ...props }: Props) {
  if (!src || (typeof src === "string" && !filled(src))) return null;

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      sizes={sizes ?? (props.fill ? "100vw" : "(min-width: 1024px) 50vw, 100vw")}
      loading={eager ? "eager" : props.loading}
      fetchPriority={eager ? "high" : props.fetchPriority}
      className={cn(props.fill && "object-cover", className)}
      {...props}
    />
  );
}

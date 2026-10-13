import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"div"> & {
  size?: "sm" | "md" | "lg" | "full";
};

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  full: "max-w-none",
};

export function Container({ size = "lg", className, ...props }: Props) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)} {...props} />;
}

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-sm bg-neutral-200/80", className)}
      aria-hidden
      {...props}
    />
  );
}

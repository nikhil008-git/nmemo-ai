import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function Spinner({
  className,
  size = 16,
  label = "Loading",
}: {
  className?: string;
  size?: number;
  label?: string;
}) {
  return (
    <Loader2
      size={size}
      strokeWidth={2}
      className={cn("animate-spin text-muted-foreground", className)}
      role="status"
      aria-label={label}
    />
  );
}

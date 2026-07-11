import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ size = 24, className, priority = false }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="nmemo"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority={priority}
    />
  );
}

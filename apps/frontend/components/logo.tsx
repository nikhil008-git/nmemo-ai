import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  className?: string;
  /** Kept for call-site compatibility; SVG needs no priority hint. */
  priority?: boolean;
};

/** Sharp vector mark: black tile, white squircle, capsule bar. */
export function Logo({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="nmemo"
      role="img"
    >
      <rect width="100" height="100" rx="22" fill="#000000" />
      <rect x="11" y="11" width="78" height="78" rx="20" fill="#FFFFFF" />
      <rect x="30" y="64" width="40" height="9" rx="4.5" fill="#000000" />
    </svg>
  );
}

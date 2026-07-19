import Link from "next/link";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const variantClass = {
  primary: "btn-cta-primary",
  secondary: "btn-cta-secondary",
  outline: "btn-cta-outline",
} as const;

export type CtaButtonVariant = keyof typeof variantClass;
export type CtaButtonSize = "default" | "compact";

type CtaButtonBase = {
  variant?: CtaButtonVariant;
  size?: CtaButtonSize;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
};

type CtaButtonAsLink = CtaButtonBase & {
  href: string;
  type?: never;
  onClick?: never;
};

type CtaButtonAsButton = CtaButtonBase & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export type CtaButtonProps = CtaButtonAsLink | CtaButtonAsButton;

function ctaClasses({
  variant = "primary",
  size = "default",
  fullWidth,
  className,
}: Pick<CtaButtonProps, "variant" | "size" | "fullWidth" | "className">) {
  return cn(
    variantClass[variant],
    size === "compact" && "btn-cta-compact",
    fullWidth && "w-full",
    className,
  );
}

export function CtaButton({
  variant = "primary",
  size = "default",
  fullWidth,
  className,
  disabled,
  loading,
  children,
  ...props
}: CtaButtonProps) {
  const classes = ctaClasses({ variant, size, fullWidth, className });
  const isDisabled = disabled || loading;
  const content = (
    <>
      {loading ? (
        <Loader2
          size={size === "compact" ? 14 : 16}
          className="animate-spin"
          aria-hidden
        />
      ) : null}
      {children}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={cn(
          classes,
          "inline-flex items-center justify-center gap-1.5",
          isDisabled && "pointer-events-none opacity-40",
        )}
        aria-disabled={isDisabled}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={isDisabled}
      onClick={props.onClick}
      className={cn(classes, "inline-flex items-center justify-center gap-1.5")}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}

export function CtaButtonRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("cta-button-row", className)}>{children}</div>;
}

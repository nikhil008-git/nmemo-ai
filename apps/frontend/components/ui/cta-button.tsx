import Link from "next/link";

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
  children,
  ...props
}: CtaButtonProps) {
  const classes = ctaClasses({ variant, size, fullWidth, className });

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={cn(classes, disabled && "pointer-events-none opacity-40")}
        aria-disabled={disabled}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={disabled}
      onClick={props.onClick}
      className={classes}
    >
      {children}
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

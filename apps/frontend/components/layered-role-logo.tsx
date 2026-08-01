type LayeredRoleLogoProps = {
  className?: string;
};

/** Canonical nmemo layered-role mark. Geometry is defined by the repo skill. */
export function LayeredRoleLogo({ className }: LayeredRoleLogoProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="4"
        y="3.5"
        width="10"
        height="2.5"
        rx="1"
        fill="currentColor"
        opacity="0.9"
      />
      <rect
        x="4"
        y="7.75"
        width="10"
        height="2.5"
        rx="1"
        fill="currentColor"
        opacity="0.55"
      />
      <rect
        x="4"
        y="12"
        width="10"
        height="2.5"
        rx="1"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

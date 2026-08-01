/** A persistent, low-key reminder that nmemo is still being refined. */
export function BetaBanner() {
  return (
    <div className="flex min-h-7 items-center justify-center border-b border-border bg-foreground px-4 py-1.5 text-center text-[11px] font-semibold text-background sm:text-[12px]">
      nmemo is in beta. We&apos;re actively refining the product.
    </div>
  );
}

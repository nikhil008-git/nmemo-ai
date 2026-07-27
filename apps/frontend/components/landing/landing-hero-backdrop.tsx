import { cn } from "@/lib/utils";

/** Painterly grain — keeps the gradients from banding and reads as canvas texture. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Ridges read as hills because each dome is anchored below the bottom edge. */
const RIDGE_FAR = [
  "radial-gradient(26rem 9rem at 14% 100%, rgba(146,62,14,0.9) 0%, rgba(146,62,14,0.9) 62%, transparent 63%)",
  "radial-gradient(34rem 11rem at 48% 102%, rgba(154,66,14,0.9) 0%, rgba(154,66,14,0.9) 62%, transparent 63%)",
  "radial-gradient(28rem 8rem at 86% 100%, rgba(140,58,12,0.9) 0%, rgba(140,58,12,0.9) 62%, transparent 63%)",
].join(",");

const RIDGE_NEAR = [
  "radial-gradient(30rem 7rem at 26% 104%, rgba(78,28,6,0.96) 0%, rgba(78,28,6,0.96) 64%, transparent 65%)",
  "radial-gradient(38rem 8rem at 72% 104%, rgba(66,24,6,0.96) 0%, rgba(66,24,6,0.96) 64%, transparent 65%)",
].join(",");

/**
 * Warm landscape backdrop for the hero — cream sky up top so the headline
 * stays readable, burning down through a hard horizon to deep ridged ground.
 * Everything is CSS, so it stays crisp at any width and ships no image weight.
 */
export function HeroNatureBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {/* Sky — light cream at the top so the panel reads open, ramping hard
          into deep ground so the bottom carries the weight. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #fffdf9 0%, #fff6e6 14%, #ffe7bf 30%, #ffcd88 48%, #fca94f 63%, #f57f21 76%, #dd5c0e 88%, #b03c0a 100%)",
        }}
      />

      {/* Low sun */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(34rem 20rem at 78% 48%, rgba(255,252,235,0.95) 0%, rgba(255,214,130,0.7) 34%, rgba(255,160,64,0.3) 60%, transparent 78%)",
        }}
      />

      {/* Horizon — the bright cut that gives the sky a floor */}
      <div
        className="absolute inset-x-0 top-[63%] h-[14%] blur-2xl"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,196,110,0.75) 42%, rgba(255,142,48,0.6) 58%, transparent 100%)",
        }}
      />

      {/* Ground haze under the horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(196,74,10,0.55) 45%, rgba(150,50,8,0.85) 100%)",
        }}
      />

      {/* Ridges */}
      <div
        className="absolute inset-x-0 bottom-0 h-[26%] blur-[6px]"
        style={{ background: RIDGE_FAR }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[16%] blur-[3px]"
        style={{ background: RIDGE_NEAR }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 80% at 50% 30%, transparent 42%, rgba(96,36,6,0.4) 100%)",
        }}
      />

      {/* Canvas grain */}
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
      />
    </div>
  );
}

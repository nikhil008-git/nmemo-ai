/** Shared stage backgrounds — landing journey, feature cards, app shell. */

export const stageBackgrounds = {
  /** 01 / Home — brand orange */
  orange: `
    radial-gradient(ellipse 90% 70% at 12% 20%, rgba(255, 190, 120, 0.95) 0%, transparent 55%),
    radial-gradient(ellipse 70% 55% at 88% 18%, rgba(255, 150, 80, 0.8) 0%, transparent 50%),
    radial-gradient(ellipse 85% 55% at 45% 100%, rgba(249, 115, 22, 0.65) 0%, transparent 55%),
    linear-gradient(165deg, #fff7ed 0%, #ffedd5 42%, #fdba74 100%)
  `,
  /** 02 / mid — cool soft slate */
  slate: `
    radial-gradient(ellipse 80% 55% at 80% 20%, rgba(226, 232, 240, 0.95) 0%, transparent 55%),
    radial-gradient(ellipse 70% 50% at 15% 85%, rgba(203, 213, 225, 0.75) 0%, transparent 55%),
    linear-gradient(160deg, #f8fafc 0%, #e2e8f0 55%, #cbd5e1 100%)
  `,
  /** 03 / cool neutral */
  neutral: `
    radial-gradient(ellipse 75% 55% at 70% 25%, rgba(250, 250, 250, 0.95) 0%, transparent 55%),
    radial-gradient(ellipse 65% 50% at 20% 80%, rgba(229, 229, 229, 0.8) 0%, transparent 55%),
    linear-gradient(165deg, #fafafa 0%, #f0f0f0 50%, #e5e5e5 100%)
  `,
} as const;

export type StageKey = keyof typeof stageBackgrounds;

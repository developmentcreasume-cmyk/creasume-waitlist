/* ============================================================
   Shared framer-motion variants
   Kept in a plain module (no components) so timings/easings stay
   consistent across sections and Fast Refresh stays happy.
   ============================================================ */

// Fade + rise into place (500ms, ease-out) — hero text, section headings, timeline steps.
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// Parent that reveals children one-by-one (150ms stagger) — card grids.
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

// "Pop up" reveal (350ms, ease-out) — Made for the Next Generation cards.
export const popUp = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

// Bouncy pop-in — pricing cards (spec §9). Starts small + invisible, overshoots
// past full size before settling (450ms, cubic-bezier(0.34,1.56,0.64,1)).
export const popIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] } },
}

// Parent for the pricing grid — 120ms stagger, left→right (spec §9).
export const popInParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

// Outline / glow draw-in (600ms, ease-out) — hero pill + Creasume × Instagram badge.
export const outlineDraw = {
  hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  show: {
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

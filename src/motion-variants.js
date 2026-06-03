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

// Outline / glow draw-in (600ms, ease-out) — hero pill + Creasume × Instagram badge.
export const outlineDraw = {
  hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  show: {
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

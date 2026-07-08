import { motion } from 'framer-motion'

// A gentle "scroll down for more" hint pinned to the SIDE of the viewport. It
// bounces so it stays noticeable and is ALWAYS visible (permanent) — it never
// disappears on scroll and doesn't need to be re-triggered on scroll-up. Shared
// by the landing + waitlist pages.
//
// `side` = 'right' (default) | 'left'.
export default function ScrollCue({ label = 'Scroll', side = 'right' }) {
  const pos = side === 'left' ? 'left-3 sm:left-5' : 'right-3 sm:right-5'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className={`fixed ${pos} top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 pointer-events-none select-none`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Vertical "SCROLL" label reads down the side */}
      <span
        className="text-white/50 text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase"
        style={{ writingMode: 'vertical-rl' }}
      >
        {label}
      </span>

      {/* Mouse outline with an animated wheel dot */}
      <div className="w-6 h-10 rounded-full border-2 border-white/35 flex justify-center pt-2">
        <motion.span
          className="block w-1 h-2 rounded-full bg-white/70"
          animate={{ y: [0, 9, 0], opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Bouncing chevron for an unmistakable "keep going" cue */}
      <motion.svg
        width="18" height="11" viewBox="0 0 20 12" fill="none"
        className="text-white/45"
        animate={{ y: [0, 4, 0], opacity: [0.9, 0.4, 0.9] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
      >
        <path d="M2 2l8 8 8-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </motion.div>
  )
}

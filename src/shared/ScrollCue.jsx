import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// A gentle "scroll down for more" hint pinned to the SIDE of the viewport. It
// stays visible while there's still page below, and only fades out once the
// visitor reaches the bottom/footer (where there's nothing left to scroll).
// Shared by the landing + waitlist pages.
//
// `side` = 'right' (default) | 'left'.
export default function ScrollCue({ label = 'Scroll', side = 'right' }) {
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    // Hide once we're near the very bottom (the footer). Works with Lenis
    // (scrolls the real document) and native touch scrolling alike.
    const onScroll = () => {
      const scrolledBottom = window.scrollY + window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      // Within ~0.7 viewport of the end → the footer is in view, so hide.
      setAtBottom(docHeight - scrolledBottom < window.innerHeight * 0.7)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const pos = side === 'left' ? 'left-3 sm:left-5' : 'right-3 sm:right-5'

  return (
    <AnimatePresence>
      {!atBottom && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.45, delay: 0.6 }}
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
      )}
    </AnimatePresence>
  )
}

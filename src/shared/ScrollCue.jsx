import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// A gentle "scroll down for more" hint pinned to the bottom-centre of the first
// viewport. It bounces so it's noticeable, and fades away the moment the visitor
// starts scrolling (so it never gets in the way). Shared by the landing + waitlist
// heroes, where people otherwise don't realise how much more is below.
export default function ScrollCue({ label = 'Scroll' }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Hide once they've scrolled a little — works with Lenis (scrolls the real
    // document) and native touch scrolling alike.
    const onScroll = () => setHidden(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="fixed left-1/2 -translate-x-1/2 bottom-5 sm:bottom-6 z-40 flex flex-col items-center gap-2 pointer-events-none select-none"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <span className="text-white/55 text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase">
            {label}
          </span>

          {/* Mouse outline with an animated wheel dot */}
          <div className="w-[26px] h-[42px] rounded-full border-2 border-white/35 flex justify-center pt-2">
            <motion.span
              className="block w-1 h-2 rounded-full bg-white/70"
              animate={{ y: [0, 9, 0], opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Bouncing chevron for an extra, unmistakable "keep going" cue */}
          <motion.svg
            width="20" height="12" viewBox="0 0 20 12" fill="none"
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

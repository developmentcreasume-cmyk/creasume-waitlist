import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// A gentle scroll hint pinned to the SIDE of the viewport. It stays visible
// while there's page below and only hides at the footer. The arrow reflects the
// scroll DIRECTION — pointing down at the top / while scrolling down, and up
// while scrolling up — so it never shows a "down" arrow when you're going up.
// Shared by the landing + waitlist pages. `side` = 'right' (default) | 'left'.
export default function ScrollCue({ label = 'Scroll', side = 'right' }) {
  const [atBottom, setAtBottom] = useState(false)
  const [dir, setDir] = useState('down') // 'down' | 'up'
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y - lastY.current > 4) setDir('down')
      else if (lastY.current - y > 4) setDir('up')
      lastY.current = y

      // Hide near the very bottom (the footer) — nothing left to scroll.
      const scrolledBottom = y + window.innerHeight
      const docHeight = document.documentElement.scrollHeight
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

  const up = dir === 'up'
  const pos = side === 'left' ? 'left-3 sm:left-5' : 'right-3 sm:right-5'
  // Chevron pointing down (▽) or up (△).
  const chevron = up ? 'M2 10l8 -8 8 8' : 'M2 2l8 8 8-8'

  return (
    <AnimatePresence>
      {!atBottom && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.45, delay: 0.6 }}
          className={`fixed ${pos} top-1/2 -translate-y-1/2 z-40 flex ${up ? 'flex-col-reverse' : 'flex-col'} items-center gap-3 pointer-events-none select-none`}
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {/* Vertical "SCROLL" label reads down the side */}
          <span
            className="text-white/50 text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            {label}
          </span>

          {/* Mouse outline with an animated wheel dot (animates toward the dir) */}
          <div className="w-6 h-10 rounded-full border-2 border-white/35 flex justify-center pt-2">
            <motion.span
              className="block w-1 h-2 rounded-full bg-white/70"
              animate={{ y: up ? [0, -9, 0] : [0, 9, 0], opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Bouncing chevron matching the scroll direction */}
          <motion.svg
            width="18" height="11" viewBox="0 0 20 12" fill="none"
            className="text-white/45"
            animate={{ y: up ? [0, -4, 0] : [0, 4, 0], opacity: [0.9, 0.4, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          >
            <path d={chevron} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

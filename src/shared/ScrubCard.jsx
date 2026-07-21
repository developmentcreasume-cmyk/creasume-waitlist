import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// A perk card that scrubs from its stacked position (stackedX/Y, in % of its own
// size) to its grid position (0,0) based on the section's scroll progress, over
// the window [start, start+length]. Because it's tied to scroll, it moves forward
// as you scroll down and reverses as you scroll up.
//
// On mobile the grid collapses to a single column, so the stacked unstack reads
// oddly. There each card instead slides in from alternating sides (left, right,
// left, …) as it scrolls into view, driven by its `index`.
export function ScrubCard({ progress, start, length = 0.30, stackedX, stackedY, zIndex, perk, titleClass, index = 0, isMobile = false }) {
  // Window width = how much scroll the unstack takes. start → end is when it
  // animates; it's fully placed by `end` (tuned to finish as the heading exits).
  const end = start + length
  const x = useTransform(progress, [start, end], [`${stackedX}%`, '0%'])
  const y = useTransform(progress, [start, end], [`${stackedY}%`, '0%'])
  const scale = useTransform(progress, [start, end], [0.92, 1])

  // Mobile: scrub each card in from an alternating side (even = left, odd =
  // right) as it travels through the lower half of the viewport. Because it's
  // tied to the card's own scroll progress it tracks the scroll position and
  // reverses smoothly on scroll up — it's not a one-shot trigger.
  const cardRef = useRef(null)
  const { scrollYProgress: cardProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  })
  const mobileX = useTransform(cardProgress, [0, 1], [index % 2 === 0 ? -90 : 90, 0])
  const mobileOpacity = useTransform(cardProgress, [0, 0.6], [0, 1])

  return (
    // Outer element carries the scroll-scrubbed transform (x/y/scale on desktop,
    // x/opacity on mobile) and drives the rest/hover variant state. The hover
    // "zoom" lives on the inner card so it composes on top of the scroll scale
    // instead of overwriting it.
    <motion.div
      ref={cardRef}
      initial="rest"
      animate="rest"
      whileHover={isMobile ? undefined : 'hover'}
      variants={{ rest: {}, hover: {} }}
      style={{
        // Mobile uses the per-card scrub (mobileX/opacity); desktop uses the
        // shared stacked unstack (x/y/scale).
        ...(isMobile ? { x: mobileX, opacity: mobileOpacity } : { x, y, scale }),
        zIndex,
      }}
    >
      <motion.div
        className="rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
        variants={{
          // No glowing border/bloom — just a subtle zoom on hover.
          rest: { scale: 1 },
          hover: { scale: 1.05 },
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          height: '260px',
          background:
            'linear-gradient(#000000, #000000) padding-box, linear-gradient(0deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%) border-box',
          border: '1px solid transparent',
        }}
      >
        <img
          src="/image/shape.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ opacity: 0.5 }}
        />

        <div className="mb-6 relative z-10">{perk.icon}</div>
        <h3
          className={titleClass}
          style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontWeight: 500, fontSize: '20px' }}
        >
          {perk.title}
        </h3>
      </motion.div>
    </motion.div>
  )
}

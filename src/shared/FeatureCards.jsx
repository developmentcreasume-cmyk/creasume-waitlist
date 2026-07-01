import { useState } from 'react'
import { motion } from 'framer-motion'

// "Built for Emerging Creators" feature cards. Data lives at module scope so the
// icon/title/desc JSX isn't re-created on every render.
const FEATURE_CARDS = [
  {
    icon: <img src="/Icon%20MK%201.png" alt="Smart Media Kits" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
    title: (<>Smart Media<br />Kits</>),
    desc: 'Auto-generated, brand-ready kits that showcase your reach exactly the way brands want to see it.',
  },
  {
    icon: <img src="/Icon%20ID%201.png" alt="Creator Profiles" style={{ width: '52px', height: '47.63px', objectFit: 'contain' }} />,
    title: (<>Creator<br />Profiles</>),
    desc: 'One verified identity page that replaces scattered links with a single credible presence.',
  },
  {
    icon: <img src="/Vector%20(2).png" alt="Brand Inquiries" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
    title: (<>Brand<br />Inquiries</>),
    desc: 'Structured collaboration requests no DM chaos, no back and forth with brands.',
  },
  {
    icon: <img src="/Vector%20(3).png" alt="Stronger Positioning" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
    title: (<>Stronger<br />Positioning</>),
    desc: 'Get discovered. Stand out in front of brands actively looking for creators like you.',
  },
]

// Self-contained so tapping a card only re-renders this grid — keeping the
// open/close state out of the host page (whose full re-render on every tap was
// what made the mobile expand feel laggy).
export function FeatureCards({ isMobile }) {
  const [openCard, setOpenCard] = useState(null)
  // Desktop reveals the description on hover; mobile still taps to open.
  const [hoverCard, setHoverCard] = useState(null)
  return (
    <div
      className="rounded-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:h-[428px]"
      style={{
        width: '858.21px',
        maxWidth: '100%',
        background:
          'linear-gradient(180deg, rgba(16, 31, 70, 0.5) 0%, rgba(0, 9, 32, 0.72) 100%)',
        border: '1px solid rgba(54, 55, 122, 0.4)',
      }}
    >
      {FEATURE_CARDS.map((card, idx) => {
        // Open on hover (desktop) or on tap (mobile, where hover never fires).
        const isOpen = openCard === idx || (!isMobile && hoverCard === idx)
        return (
        <motion.div
          key={idx}
          className="relative px-8 pt-6 lg:pt-14 pb-8 flex flex-col rounded-2xl overflow-hidden cursor-pointer"
          style={{ transformOrigin: 'center' }}
          initial="rest"
          whileHover={isMobile ? undefined : 'hover'}
          animate="rest"
          variants={{ rest: {}, hover: {} }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onHoverStart={() => setHoverCard(idx)}
          onHoverEnd={() => setHoverCard((c) => (c === idx ? null : c))}
          onClick={() => setOpenCard(openCard === idx ? null : idx)}
        >
          {/* Straight white divider between cards */}
          {idx !== 0 && (
            <span className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-white/40 pointer-events-none" />
          )}

          {/* Brighten overlay that fills in on hover (card opening out) */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(33,22,185,0.22) 0%, rgba(13,8,115,0.10) 100%)' }}
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
          <motion.div
            className="relative z-10 flex flex-col h-full"
            variants={{ rest: { scale: 1, y: 0 }, hover: { scale: 1.04, y: -6 } }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Large faded index number at the top */}
            <span
              className="font-bold leading-none select-none pointer-events-none"
              style={{
                fontSize: '64px',
                color: 'rgba(255,255,255,0.06)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {String(idx + 1).padStart(2, '0')}
            </span>

            {/* Accent line + icon + title anchored to the bottom */}
            <div className="mt-auto">
              <div
                className="mb-6 rounded-full"
                style={{
                  width: '40px',
                  height: '3px',
                  background: '#E432A5',
                }}
              />
              {/* Mobile-only expand arrow on the left; icon + title on the
                  right (right-aligned), vertically centered against it.
                  On lg+ the arrow is gone and the content goes back to left. */}
              <div className="flex items-center justify-between gap-3">
                {/* Mobile-only expand arrow — taps open the description text.
                    Hidden on lg+ where the layout has room to show on hover/click. */}
                <button
                  type="button"
                  aria-label={isOpen ? 'Hide details' : 'Show details'}
                  aria-expanded={isOpen}
                  className="lg:hidden shrink-0 -translate-y-8.5 flex items-center justify-center w-9 h-9 rounded-full border border-white/25 text-white/80"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="lg:w-full -translate-y-20.5 lg:translate-y-0">
                  <div className="mb-6 flex justify-end lg:justify-start">{card.icon}</div>
                  <h3
                    className="text-white leading-tight text-right lg:text-left ml-auto lg:ml-0"
                    style={{
                      width: '165.46px',
                      fontWeight: 500,
                      fontSize: '24.27px',
                    }}
                  >
                    {card.title}
                  </h3>
                </div>
              </div>

              {/* Description reveal — framer-motion animates height + opacity so
                  the panel slides open and closed smoothly instead of snapping. */}
              <motion.div
                className="overflow-hidden -translate-y-12 lg:translate-y-0"
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.p
                  className="text-white/75 pt-4 text-lg md:text-base"
                  style={{
                    lineHeight: '140%',
                    fontFamily: "'Gelion', 'Outfit', sans-serif",
                  }}
                  initial={false}
                  animate={{
                    opacity: isOpen ? 1 : 0,
                    y: isOpen ? 0 : 12,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: 'easeOut',
                    delay: isOpen ? 0.1 : 0,
                  }}
                >
                  {card.desc}
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        )
      })}
    </div>
  )
}

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from 'framer-motion'
import { FONT, MONO } from './influenceData.js'
import { useInfluence } from './InfluenceDataContext.jsx'

// One marquee row of "TOP POSTS • INFLUENCE •" text. Driven by the section's
// scroll progress: scrolling down slides it one way, scrolling up the other.
function MarqueeRow({ text, reverse = false, hollow = false, progress, className = '' }) {
  const seq = Array.from({ length: 8 })
  const x = useTransform(progress, [0, 1], reverse ? ['-18%', '0%'] : ['0%', '-18%'])
  // Hollow = fill matches the page background (so the glyph body disappears) with
  // an 8-direction text-shadow outline. This renders a clean merged outline,
  // unlike -webkit-text-stroke which traces the font's internal contours.
  const OUTLINE = 'rgba(255,255,255,0.2)'
  const HOLLOW_SHADOW = `1px 0 0 ${OUTLINE}, -1px 0 0 ${OUTLINE}, 0 1px 0 ${OUTLINE}, 0 -1px 0 ${OUTLINE}, 1px 1px 0 ${OUTLINE}, -1px -1px 0 ${OUTLINE}, 1px -1px 0 ${OUTLINE}, -1px 1px 0 ${OUTLINE}`
  const textStyle = hollow
    ? { color: '#000000', textShadow: HOLLOW_SHADOW }
    : { color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: 'clamp(58px, 11vw, 150px)' }
  // Dot matches the row: hollow (outlined) for INFLUENCE, solid same-colour for TOP POSTS.
  const dotStyle = hollow
    ? { color: '#000000', textShadow: HOLLOW_SHADOW }
    : { color: 'rgba(255,255,255,0.75)', textShadow: 'none' }
  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className={`flex whitespace-nowrap ${className}`}
        style={{ x, width: 'max-content' }}
      >
        {seq.concat(seq).map((_, i) => (
          <span
            key={i}
            className="uppercase font-extrabold px-6"
            style={{ fontFamily: FONT, fontSize: 'clamp(48px, 9vw, 120px)', lineHeight: 1, ...textStyle }}
          >
            {text} <span style={dotStyle}>•</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default function TopPosts() {
  const { TOP_POSTS: POSTS, FEATURED } = useInfluence()
  const sectionRef = useRef(null)
  // Pinned section (like the home page's SensesSection): the panel is sticky
  // while you scroll the tall section, and scroll progress drives which featured
  // card is active. `scrollYProgress` (start start → end end) runs only while the
  // panel is pinned; a separate marqueeProgress drifts the background text from
  // the moment the section enters the viewport.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: marqueeProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  // Card boundaries along the pinned scroll — one even slice per post.
  const THRESHOLDS = POSTS.slice(1).map((_, i) => (i + 1) / POSTS.length)
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    let idx = 0
    while (idx < THRESHOLDS.length && p >= THRESHOLDS[idx]) idx++
    setActive(idx)
  })

  const post = POSTS[active]

  return (
    <section ref={sectionRef} className="relative z-10 mb-20 md:mb-32" style={{ height: `${POSTS.length * 140}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Background marquee band — drifts horizontally as the section scrolls */}
        <div className="absolute inset-0 flex flex-col justify-center gap-10 md:gap-16 select-none pointer-events-none">
          <MarqueeRow text="TOP POSTS" progress={marqueeProgress} />
          <MarqueeRow text="INFLUENCE" reverse hollow progress={marqueeProgress} />
          <MarqueeRow text="INFLUENCE" hollow progress={marqueeProgress} />
          <MarqueeRow text="TOP POSTS" reverse progress={marqueeProgress} />
        </div>

        {/* Featured card — one wide glass card; the post image lives on the right
            and crossfades from one post to the next as you scroll. */}
        <div className="relative z-10 w-full flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto relative rounded-[28px] flex items-center justify-between gap-6 px-8 md:px-12 overflow-hidden"
            style={{
              width: 'min(900px, 88vw)',
              height: 'min(400px, 56vh)',
              marginLeft: 'clamp(0px, 38vw, 600px)',
              background:
                'linear-gradient(150deg, rgba(20,21,30,0.92) 0%, rgba(8,9,16,0.9) 100%) padding-box, ' +
                'linear-gradient(120deg, rgba(255,255,255,0.5) 0%, rgba(120,210,185,0.45) 38%, rgba(90,120,220,0.5) 70%, rgba(150,120,255,0.6) 100%) border-box',
              border: '1.5px solid transparent',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Left: one hero metric + a row of supporting stats (dummy numbers) */}
            <div className="flex flex-col justify-center gap-7">
              <div>
                <div className="text-white font-bold leading-none" style={{ fontFamily: FONT, fontSize: 'clamp(40px, 5vw, 64px)' }}>{FEATURED.totalViews}</div>
                <div className="text-white/70 font-light text-sm tracking-widest uppercase mt-2" style={{ fontFamily: MONO }}>Total Views</div>
              </div>
              <div className="flex gap-5 md:gap-7">
                {[
                  { label: 'Likes', value: post.likes },
                  { label: 'Reach', value: FEATURED.reach },
                  { label: 'Engage', value: FEATURED.engage },
                  { label: 'Interact', value: FEATURED.interact },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-white font-bold leading-none" style={{ fontFamily: FONT, fontSize: 'clamp(16px, 1.6vw, 22px)' }}>{value}</div>
                    <div className="text-white/70 font-light text-xs tracking-widest uppercase mt-1" style={{ fontFamily: MONO }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: the post photo only (no overlay), crossfading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.96 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="relative rounded-2xl overflow-hidden shrink-0"
                style={{ height: '78%', aspectRatio: '4/5', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              >
                <img src={post.photo} alt="Featured post" className="w-full h-full object-cover" />
              </motion.div>
            </AnimatePresence>

            {/* Progress dashes — which post is active */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {POSTS.map((_, i) => (
                <span
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ width: i === active ? 32 : 18, backgroundColor: i === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from 'framer-motion'
import { FONT, MONO, PHOTOS } from './influenceData.js'

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

const POSTS = [
  { photo: PHOTOS[0], caption: 'A day in my creative routine', likes: '128K', type: 'REEL' },
  { photo: PHOTOS[1], caption: 'Festive looks for the season', likes: '96K', type: 'POST' },
  { photo: PHOTOS[5], caption: 'Mindful morning rituals ☀️', likes: '84K', type: 'REEL' },
]

export default function TopPosts() {
  const sectionRef = useRef(null)
  // Pinned section (like the home page's SensesSection): the panel is sticky
  // while you scroll the tall section, and scroll progress drives which featured
  // card is active. `scrollYProgress` (start start → end end) runs only while the
  // panel is pinned; a separate marqueeProgress drifts the background text from
  // the moment the section enters the viewport.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: marqueeProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })

  // Card boundaries along the pinned scroll — one card per even slice.
  const THRESHOLDS = [0.34, 0.67]
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
            className="pointer-events-auto relative rounded-[28px] flex items-center justify-end px-8 md:px-12 overflow-hidden"
            style={{
              width: 'min(900px, 88vw)',
              height: 'min(400px, 56vh)',
              marginLeft: 'clamp(0px, 46vw, 740px)',
              background:
                'linear-gradient(150deg, rgba(20,21,30,0.92) 0%, rgba(8,9,16,0.9) 100%) padding-box, ' +
                'linear-gradient(120deg, rgba(255,255,255,0.5) 0%, rgba(120,210,185,0.45) 38%, rgba(90,120,220,0.5) 70%, rgba(150,120,255,0.6) 100%) border-box',
              border: '1.5px solid transparent',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            }}
          >
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
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.8) 100%)' }} />
                <span className="absolute left-3 top-3 inline-block text-[10px] tracking-widest px-2 py-0.5 rounded text-white" style={{ fontFamily: MONO, border: '1px solid rgba(167,139,232,0.5)', background: 'rgba(0,0,0,0.35)' }}>
                  {post.type}
                </span>
                <div className="absolute left-3 bottom-3 right-3">
                  <p className="text-white font-semibold text-base leading-snug mb-1" style={{ fontFamily: FONT }}>{post.caption}</p>
                  <p className="text-white/70 text-xs inline-flex items-center gap-1" style={{ fontFamily: MONO }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" /></svg>
                    {post.likes} likes
                  </p>
                </div>
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

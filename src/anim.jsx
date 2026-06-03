import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, animate, useReducedMotion } from 'framer-motion'

/* ============================================================
   <CountUp /> — number counter that runs once on scroll-in.
   Counts 0 → value over ~1.4s ease-out. Renders prefix/suffix
   around the animated integer (e.g. "$" + 250 + " Billion").
   ============================================================ */
export function CountUp({ value, prefix = '', suffix = '', duration = 1.4, className, style }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(mv, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, value, duration, reduce, mv])

  // Reduced-motion users (or before the value animates) read the final number directly.
  const shown = reduce ? value : display

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {shown}
      {suffix}
    </span>
  )
}

/* ============================================================
   <Typewriter /> — characters appear one-by-one on scroll-in.
   ~35ms per character (spec: 30–40ms), with an optional
   startDelay so the four stats stagger across each other.
   ============================================================ */
// `charStyle` is applied to each character span — pass a gradient + background-clip
// here (not on the parent) since clipped text doesn't paint through child spans.
// Each word is kept in a `nowrap` group so the title only ever breaks between words,
// never mid-word (otherwise per-char inline-blocks let the line break anywhere).
export function Typewriter({ text, perChar = 0.035, startDelay = 0, className, style, charStyle }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <span ref={ref} className={className} style={style}>
        {charStyle ? <span style={charStyle}>{text}</span> : text}
      </span>
    )
  }

  const words = String(text).split(' ')

  return (
    <span ref={ref} className={className} style={style} aria-label={text}>
      {words.map((word, wi) => {
        // global char offset for this word = total chars in preceding words
        const offset = words.slice(0, wi).reduce((sum, w) => sum + w.length, 0)
        return (
          <Fragment key={wi}>
            {wi > 0 && ' '}
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {word.split('').map((ch, ci) => {
                const delay = startDelay + (offset + ci) * perChar
                return (
                  <motion.span
                    key={ci}
                    aria-hidden="true"
                    style={{ display: 'inline-block', ...charStyle }}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.01, delay }}
                  >
                    {ch}
                  </motion.span>
                )
              })}
            </span>
          </Fragment>
        )
      })}
    </span>
  )
}

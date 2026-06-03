import { useEffect, useRef, useState } from 'react'
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
export function Typewriter({ text, perChar = 0.035, startDelay = 0, className, style, charStyle }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const chars = String(text).split('')

  if (reduce) {
    return (
      <span ref={ref} className={className} style={style}>
        {charStyle ? <span style={charStyle}>{text}</span> : text}
      </span>
    )
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={style}
      aria-label={text}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: perChar, delayChildren: startDelay } },
      }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{ display: 'inline-block', whiteSpace: 'pre', ...charStyle }}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.01 } } }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.span>
  )
}

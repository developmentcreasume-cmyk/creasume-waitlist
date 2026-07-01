import { motion } from 'framer-motion'

// One odometer-style digit: a vertical 0–9 strip that slides so the active digit
// sits in the (overflow-clipped) window. Changing `digit` animates the roll up.
function RollingDigit({ digit }) {
  return (
    <span className="relative inline-block overflow-hidden h-[1em] leading-none align-top">
      {/* keep the column width correct without showing a static glyph */}
      <span className="invisible">0</span>
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        animate={{ y: `-${digit}em` }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-[1em] leading-none flex items-center justify-center">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

// A number whose digits each roll up independently when the value changes.
export function RollingNumber({ value }) {
  return (
    <span className="inline-flex tabular-nums leading-none">
      {String(value).split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <RollingDigit key={i} digit={Number(ch)} />
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  )
}

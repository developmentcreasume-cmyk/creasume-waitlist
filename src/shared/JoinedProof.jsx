import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RollingNumber } from './RollingNumber.jsx'

// Social-proof widget: a "joined already" counter that ticks up every 2.5s with
// an avatar stack that slides a fresh face in on each tick. Kept as its own
// component so its interval re-renders ONLY this small subtree — when this state
// lived in App, every tick re-rendered the entire page, which showed up as a
// periodic hitch while scrolling on mobile.
const AVATAR_POOL = ['1 (2).jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'].map(
  (f) => `/${encodeURIComponent(f)}`,
)

export function JoinedProof() {
  const [joinedCount, setJoinedCount] = useState(140)
  // The avatar stack shows the 4 most-recent "joiners". Each tick pushes a fresh
  // face onto the right (cycling the image pool) and drops the leftmost, so a new
  // photo slides in for every +1. `key` is unique & monotonic so AnimatePresence
  // treats every push as a genuinely new element to animate in.
  const [avatars, setAvatars] = useState(() =>
    AVATAR_POOL.slice(0, 4).map((src, key) => ({ key, src })),
  )
  useEffect(() => {
    const id = setInterval(() => {
      setJoinedCount((n) => n + 1)
      setAvatars((prev) => {
        const nextKey = prev[prev.length - 1].key + 1
        const src = AVATAR_POOL[nextKey % AVATAR_POOL.length]
        return [...prev.slice(1), { key: nextKey, src }]
      })
    }, 2500) // one new join every 2.5s
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-center gap-3 mt-6 relative z-10">
      <div className="flex -space-x-3">
        <AnimatePresence initial={false} mode="popLayout">
          {avatars.map((a) => (
            <motion.img
              key={a.key}
              layout
              src={a.src}
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.4, x: 24 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.4, x: -24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-12 h-12 rounded-full border-2 border-[#15151a] object-cover"
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full bg-white pl-1 pr-4 py-1">
        <span className="flex items-center justify-center rounded-full bg-black text-white font-bold text-sm h-9 px-3 tabular-nums">
          <RollingNumber value={joinedCount} />
        </span>
        <span className="text-black text-sm font-medium">Joined already</span>
      </div>
    </div>
  )
}

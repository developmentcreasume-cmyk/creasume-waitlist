import { useState, useEffect } from 'react'

// Tracks whether the viewport is below the `md` breakpoint, so layout-sensitive
// sections (the perk-card unstack, the feature-card tap/hover swap) can pick a
// mobile-friendly behaviour. Shared by the waitlist page and the landing page.
export function useIsMobile(query = '(max-width: 767px)') {
  // Read the match synchronously on first render. If we started `false` and
  // flipped in an effect, the cards would already be mounted at rest and
  // framer-motion's `initial` (the off-screen start) would never apply.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return isMobile
}

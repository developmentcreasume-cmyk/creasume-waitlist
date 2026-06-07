import { useState, useEffect } from 'react'

// Lightweight hash-based router. Hash routes start with `#/` (e.g.
// `#/privacy-policy`); plain anchors like `#vision` are in-page section links
// and resolve to the home route. Hash routing keeps deep links working on any
// static host without server-side SPA rewrites.

export function getRoute() {
  const hash = window.location.hash
  return hash.startsWith('#/') ? hash.slice(1) : '/'
}

export function useRoute() {
  const [route, setRoute] = useState(getRoute)
  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

// Navigate to a legal route and jump to the top of the page.
export function goTo(route) {
  window.location.hash = route
  window.scrollTo({ top: 0 })
}

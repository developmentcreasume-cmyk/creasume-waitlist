import { useState, useEffect } from 'react'

// Lightweight router. Clean path routes (e.g. `/influence`) take precedence and
// rely on SPA fallback being configured on the host (see public/_redirects and
// vercel.json). Everything else falls back to hash routing (`#/privacy-policy`,
// `#/terms`); plain anchors like `#vision` are in-page section links and resolve
// to the home route.

export function getRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') // strip trailing slash
  if (path && path !== '/') return path
  const hash = window.location.hash
  return hash.startsWith('#/') ? hash.slice(1) : '/'
}

export function useRoute() {
  const [route, setRoute] = useState(getRoute)
  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])
  return route
}

// Navigate to a hash route (legal pages) and jump to the top of the page.
export function goTo(route) {
  window.location.hash = route
  window.scrollTo({ top: 0 })
}

// Navigate to a clean path route (e.g. /influence) via the History API, without
// a full page reload, then jump to the top.
export function goToPath(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0 })
}

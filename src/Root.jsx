import { useEffect } from 'react'
import Lenis from 'lenis'
import App from './App.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsConditions from './pages/TermsConditions.jsx'
import InfluenceCard from './pages/InfluenceCard.jsx'
import InfluenceDashboard from './components/influence-dashboard/InfluenceDashboard.jsx'
import InfluenceInquiries from './components/influence-dashboard/InfluenceInquiries.jsx'
import InfluenceInquiryDetail from './components/influence-dashboard/InfluenceInquiryDetail.jsx'
import AuthSuccess from './components/influence-dashboard/AuthSuccess.jsx'
import { useRoute } from './router.js'

// Site-wide Lenis smooth scrolling. Lenis scrolls the real document, so
// framer-motion's useScroll (the perk-card scrubs, etc.) keeps tracking
// normally. In-page anchor clicks (#home, #vision, …) are routed through
// Lenis so they glide instead of jumping; legal hash routes (#/privacy-policy)
// are left to the router.
function useLenis() {
  useEffect(() => {
    // Skip Lenis on touch devices. Its JS-driven rAF scroll hijack replaces the
    // phone's native momentum scrolling and keeps the main thread busy every
    // frame, which is a major source of mobile scroll/tap lag. Native scrolling
    // is smoother there; framer-motion's useScroll tracks the real document
    // either way. In-page anchors fall back to native smooth scroll below.
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)

    let lenis = null
    let frame
    if (!isTouch) {
      lenis = new Lenis()
      // Exposed so animations (e.g. the paper-plane flight) can drive the real
      // scroll position in sync instead of fighting Lenis with window.scrollTo.
      window.__lenis = lenis

      const raf = (time) => {
        lenis.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    }

    const onAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (!link) return
      const href = link.getAttribute('href')
      // Leave router hash routes (e.g. #/privacy-policy) and bare "#" alone.
      if (href === '#' || href.startsWith('#/')) return
      const target = document.querySelector(href)
      if (!target) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(target)
      else target.scrollIntoView({ behavior: 'smooth' })
    }
    document.addEventListener('click', onAnchorClick)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      document.removeEventListener('click', onAnchorClick)
      if (lenis) {
        if (window.__lenis === lenis) window.__lenis = null
        lenis.destroy()
      }
    }
  }, [])
}

// Top-level route switch. Hash routes select the legal pages; everything else
// renders the single-page home experience.
function Root() {
  useLenis()
  const route = useRoute()

  // Clean `/waitlist` URL: render the home page and glide to the waitlist
  // section (no `#` in the address bar). Wait a frame so the section is laid
  // out, then use Lenis if present, else native smooth scroll.
  useEffect(() => {
    if (route !== '/waitlist') return
    const id = requestAnimationFrame(() => {
      const el = document.getElementById('waitlist')
      if (!el) return
      if (window.__lenis) window.__lenis.scrollTo(el)
      else el.scrollIntoView({ behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [route])

  // Legacy `/influence/<username>` links are retired — rewrite them in place to
  // the clean `/<username>` so old links auto-correct instead of opening here.
  const legacyInfluence = route.startsWith('/influence/')
  useEffect(() => {
    if (!legacyInfluence) return
    const clean = route.replace(/^\/influence/, '') || '/'
    window.history.replaceState({}, '', clean)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [legacyInfluence, route])
  // Hold a blank frame while the rewrite above swaps the route, so the broken
  // `/influence/...` card never flashes.
  if (legacyInfluence) return <div className="min-h-screen bg-black" />

  if (route === '/privacy-policy') return <PrivacyPolicy />
  if (route === '/terms') return <TermsConditions />

  // Instagram login redirect target — stores the token, then forwards to the
  // creator's dashboard. Query string lives in window.location.search.
  if (route === '/auth-success') return <AuthSuccess />

  // Creator dashboard at /<username>/dashboard[/…]. Matched BEFORE the bare
  // `/<username>` card fallback below so the dashboard wins over the public card.
  const dash = route.match(/^\/([^/]+)\/dashboard(?:\/(.*))?$/)
  if (dash) {
    const username = decodeURIComponent(dash[1])
    const sub = dash[2] || ''
    if (sub.startsWith('inquiries/')) {
      return <InfluenceInquiryDetail username={username} id={sub.slice('inquiries/'.length)} />
    }
    if (sub === 'inquiries') return <InfluenceInquiries username={username} />
    return <InfluenceDashboard username={username} />
  }
  // `/waitlist` is the home page anchored to the waitlist section (scroll
  // handled by the effect above) — kept clean so the URL has no `#`.
  if (route === '/waitlist') return <App />
  // Home at '/'. ANY other clean path is a creator handle → media kit
  // (e.g. `/finding.rhythm`). The username is read in influenceApi.
  if (route !== '/') return <InfluenceCard />
  return <App />
}

export default Root

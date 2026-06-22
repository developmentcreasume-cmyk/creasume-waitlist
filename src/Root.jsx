import { useEffect } from 'react'
import Lenis from 'lenis'
import App from './App.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsConditions from './pages/TermsConditions.jsx'
import InfluenceCard from './pages/InfluenceCard.jsx'
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
  if (route === '/privacy-policy') return <PrivacyPolicy />
  if (route === '/terms') return <TermsConditions />
  // `/influence` (env default creator) and `/influence/<username>` (any creator
  // by clean URL) both render the media kit; the username is read in influenceApi.
  if (route === '/influence' || route.startsWith('/influence/')) return <InfluenceCard />
  return <App />
}

export default Root

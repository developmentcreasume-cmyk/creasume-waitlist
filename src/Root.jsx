import { useEffect } from 'react'
import Lenis from 'lenis'
import App from './App.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsConditions from './pages/TermsConditions.jsx'
import InfluenceCard from './pages/InfluenceCard.jsx'
import InfluenceDashboard from './components/influence-dashboard/InfluenceDashboard.jsx'
import InfluenceInquiries from './components/influence-dashboard/InfluenceInquiries.jsx'
import InfluenceInquiryDetail from './components/influence-dashboard/InfluenceInquiryDetail.jsx'
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
  if (route.startsWith('/dashboard/inquiries/')) {
    return <InfluenceInquiryDetail id={route.slice('/dashboard/inquiries/'.length)} />
  }
  if (route === '/dashboard/inquiries') return <InfluenceInquiries />
  if (route === '/dashboard') return <InfluenceDashboard />
  // Home at '/'. ANY other clean path is a creator handle → media kit
  // (e.g. `/finding.rhythm`). The username is read in influenceApi. Legacy
  // `/influence/<username>` links still resolve (handled in resolveUsername).
  if (route !== '/') return <InfluenceCard />
  return <App />
}

export default Root

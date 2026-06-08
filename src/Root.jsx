import { useEffect } from 'react'
import Lenis from 'lenis'
import App from './App.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import TermsConditions from './pages/TermsConditions.jsx'
import { useRoute } from './router.js'

// Site-wide Lenis smooth scrolling. Lenis scrolls the real document, so
// framer-motion's useScroll (the perk-card scrubs, etc.) keeps tracking
// normally. In-page anchor clicks (#home, #vision, …) are routed through
// Lenis so they glide instead of jumping; legal hash routes (#/privacy-policy)
// are left to the router.
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis()

    let frame
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    const onAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (!link) return
      const href = link.getAttribute('href')
      // Leave router hash routes (e.g. #/privacy-policy) and bare "#" alone.
      if (href === '#' || href.startsWith('#/')) return
      const target = document.querySelector(href)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target)
    }
    document.addEventListener('click', onAnchorClick)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('click', onAnchorClick)
      lenis.destroy()
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
  return <App />
}

export default Root

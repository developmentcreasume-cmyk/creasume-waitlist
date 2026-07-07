// Waitlist-page header (used on / and /waitlist). A flat black bar: plain logo
// on the left, and the in-page links (Home / Waitlist / Vision) grouped in a
// rounded pill on the right with the active link as a blue pill. Distinct from
// the shared SiteNav (floating glass) used on the marketing pages.
import { useState } from 'react'

const FONT = "'Outfit', sans-serif"
const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'waitlist', label: 'Waitlist' },
  { id: 'vision', label: 'Vision' },
]

export default function WaitlistNav() {
  const [active, setActive] = useState('home')

  // Glide to the section (Lenis owns the scroll; fall back to native).
  const go = (id) => (e) => {
    e.preventDefault()
    setActive(id)
    if (id === 'home') {
      const lenis = window.__lenis
      if (lenis) lenis.scrollTo(0, { duration: 1 })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(id)
    if (!el) return
    const lenis = window.__lenis
    if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav id="home" className="relative z-50 w-full px-3 sm:px-8 md:px-14 py-4 sm:py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo (plain, no pill) — nudged left */}
        <a href="#home" onClick={go('home')} className="shrink-0 -ml-1 sm:-ml-4 md:-ml-6">
          <img src="/creasumelogo.svg" alt="Creasume" className="h-7 sm:h-10 md:h-12 w-auto" />
        </a>

        {/* Links grouped in a dark-navy pill; active = outlined navy pill */}
        <div
          className="flex items-center gap-0.5 sm:gap-2 rounded-full p-1 sm:p-1.5 shrink-0"
          style={{ background: '#06061a', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {LINKS.map((l) => {
            const on = active === l.id
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={go(l.id)}
                className="px-3 sm:px-7 py-1.5 sm:py-2.5 rounded-full text-[13px] sm:text-[18px] font-semibold whitespace-nowrap transition-colors"
                style={{
                  fontFamily: FONT,
                  color: '#fff',
                  background: on ? 'rgba(14,14,38,0.9)' : 'transparent',
                  border: on ? '1px solid rgba(255,255,255,0.32)' : '1px solid transparent',
                }}
              >
                {l.label}
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

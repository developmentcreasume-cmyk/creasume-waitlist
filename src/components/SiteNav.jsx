// Shared site header — a wide frosted-glass pill nav. Content is configurable so
// each page can pass its own links/CTA while keeping one glass style:
//   • `active`      — id of the link to highlight (dark pill).
//   • `links`       — [{ id, label, href }]. Defaults to the marketing pages set.
//   • `cta`         — { label, href } for the primary button.
//   • `login`       — show a plain "Login" link before the CTA (default true).
//   • `ctaVariant`  — 'white' (default) | 'gradient' pink→purple CTA.
// Page links navigate via the SPA router (see navClick); in-page anchors
// (#home, #vision) glide to the matching section. On desktop everything sits in
// one row; on phones the links wrap onto their own full-width row below the
// logo/CTA so every link stays visible (no hamburger).

import { useState } from 'react'
import { goToPath } from '../router.js'

const FONT = "'Outfit', sans-serif"

const DEFAULT_NAV = [
  { id: 'how-it-works', label: 'How it works', href: '/how-it-works' },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
  { id: 'contact', label: 'Contact', href: '/contact' },
]
const DEFAULT_CTA = { label: 'Sign Up', href: '/signup' }
const LOGIN_HREF = '/login'

// Intercept a click on an internal clean-path link and navigate through the SPA
// router (History API) instead of a hash. This works from ANY page — including
// clean-path routes like /pricing, where a plain `#/…` hash link is ignored by
// the router (getRoute prefers the pathname). Non-path hrefs (real anchors) pass
// through untouched. `after` runs first (e.g. to close the mobile menu).
function navClick(href, after) {
  return (e) => {
    if (after) after()
    let path = null
    if (href && href.startsWith('#/')) path = href.slice(1) || '/'
    else if (href && href.startsWith('/')) path = href
    if (!path) return
    e.preventDefault()
    goToPath(path)
  }
}

// The whole-bar frosted-glass surface lives in the `.nav-glass` CSS class
// (index.css) so it can be applied only at lg+ — on phones the bar is bare.

// Dark inset pill for the logo and the active link.
const DARK_CHIP = {
  background: 'rgba(0,0,0,0.85)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
}

// Solid dark panel for the mobile dropdown menu (crisp over scrolling content).
const GLASS_MENU = {
  background: 'rgba(12,14,22,0.96)',
  backdropFilter: 'blur(22px) saturate(150%)',
  WebkitBackdropFilter: 'blur(22px) saturate(150%)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
}

export default function SiteNav({ active, links = DEFAULT_NAV, cta = DEFAULT_CTA, login = true, ctaVariant = 'white' }) {
  const [open, setOpen] = useState(false)

  // The CTA is a solid white pill by default (marketing pages) or a pink→purple
  // gradient when a page opts in with ctaVariant="gradient".
  const ctaStyle =
    ctaVariant === 'gradient'
      ? { color: '#fff', background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)' }
      : { color: '#0B0B27', background: '#fff' }

  return (
    <nav id="home" className="relative z-50 px-4 sm:px-8 md:px-12 lg:px-20 py-6">
      <div className="relative w-full max-w-full lg:max-w-6xl mx-auto">
        <div className="nav-glass flex items-center justify-between lg:justify-between gap-3 sm:gap-6 lg:gap-8 px-0 sm:px-0 lg:px-8 py-0 lg:py-3 rounded-full">
          {/* Logo in its own dark inset pill → back to the landing home. */}
          <a href="/landing" onClick={navClick('/landing')} className="flex items-center rounded-full pl-3 pr-4 sm:pr-5 lg:pr-6 h-10 sm:h-11 lg:h-13 shrink-0" style={DARK_CHIP}>
            <img src="/creasumelogo.svg" alt="Creasume" className="h-6 sm:h-8 lg:h-9 w-auto" />
          </a>

          {/* Desktop links (inline) */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((tab) => {
              const isActive = active === tab.id
              return (
                <a
                  key={tab.id}
                  href={tab.href}
                  onClick={navClick(tab.href)}
                  className="px-5 h-13 flex items-center rounded-full font-medium whitespace-nowrap transition-colors hover:text-white"
                  style={{
                    fontFamily: FONT,
                    fontSize: '18px',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                    ...(isActive ? DARK_CHIP : {}),
                  }}
                >
                  {tab.label}
                </a>
              )
            })}
          </div>

          {/* Desktop login + CTA */}
          <div className="hidden lg:flex items-center gap-2 lg:ml-1">
            {login && (
              <a
                href={LOGIN_HREF}
                onClick={navClick(LOGIN_HREF)}
                className="px-6 h-13 flex items-center rounded-full font-medium text-white hover:brightness-125 transition"
                style={{ fontFamily: FONT, fontSize: '18px', ...DARK_CHIP }}
              >
                Login
              </a>
            )}
            {cta && (
              <a
                href={cta.href}
                onClick={navClick(cta.href)}
                className="px-6 h-13 flex items-center rounded-full font-semibold whitespace-nowrap transition-transform hover:scale-[1.03]"
                style={{ fontFamily: FONT, fontSize: '17px', ...ctaStyle }}
              >
                {cta.label}
              </a>
            )}
          </div>

          {/* Mobile hamburger — collapses the whole nav into a dropdown menu */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-white shrink-0"
            style={DARK_CHIP}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {open ? (
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown menu — all links + login + CTA */}
        {open && (
          <div className="lg:hidden absolute right-0 top-full mt-2 w-64 max-w-[86vw] rounded-2xl p-2 flex flex-col z-50" style={GLASS_MENU}>
            {links.map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                onClick={navClick(tab.href, () => setOpen(false))}
                className="px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-colors"
                style={{
                  fontFamily: FONT,
                  fontSize: '16px',
                  color: active === tab.id ? '#fff' : 'rgba(255,255,255,0.85)',
                  background: active === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                {tab.label}
              </a>
            ))}
            {login && (
              <a
                href={LOGIN_HREF}
                onClick={navClick(LOGIN_HREF, () => setOpen(false))}
                className="px-4 py-3 rounded-xl font-medium whitespace-nowrap text-white/90"
                style={{ fontFamily: FONT, fontSize: '16px' }}
              >
                Login
              </a>
            )}
            {cta && (
              <a
                href={cta.href}
                onClick={navClick(cta.href, () => setOpen(false))}
                className="mt-1 px-4 py-3 rounded-xl font-semibold text-center whitespace-nowrap"
                style={{ fontFamily: FONT, fontSize: '15px', ...ctaStyle }}
              >
                {cta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

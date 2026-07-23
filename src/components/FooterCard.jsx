// Alternate footer — a rounded 3-column card (Creasume / Company / Follow us)
// with a blue→pink gradient border. Used on How it Works, Contact and Pricing.
//
// IMPORTANT: this footer lives on CLEAN-PATH pages (/how-it-works, /contact,
// /pricing). The router (router.js) prefers the pathname and IGNORES hash routes
// like `#/terms` whenever the path isn't "/", so those links did nothing here.
// Everything therefore navigates through the History API (goToPath), exactly
// like SiteNav does. In-page section links first go to /landing, then scroll to
// the section once it has mounted (LandingPage reads the hash on load).

import { goToPath } from '../router.js'

const FONT = "'Outfit', sans-serif"

// Smooth-scroll to a section on the landing page. If we're already on /landing,
// just scroll; otherwise navigate there carrying the target id in the hash —
// LandingPage's mount effect does the scroll once the section exists.
function goToLandingSection(id) {
  const onLanding = window.location.pathname.replace(/\/+$/, '') === '/landing'
  if (onLanding) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.history.pushState({}, '', `/landing#${id}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
    window.scrollTo({ top: 0 })
  }
}

// Each link is [label, kind, target]:
//   'route'   → goToPath(target) (clean-path SPA route)
//   'section' → scroll to a landing-page section id
const CREASUME = [
  ['Home', 'section', 'home'],
  ['Work', 'route', '/how-it-works'],
  ['Service', 'section', 'vision'],
  ['Insights', 'section', 'insights'],
  ['Plans', 'route', '/pricing'],
  ['Testimonial', 'section', 'testimonial'],
  ['Achievements', 'section', 'achievements'],
]
const COMPANY = [
  ['Terms and Conditions', 'route', '/terms'],
  // No dedicated refund page yet — Terms §5 (Payments, Subscriptions & Refunds)
  // is the canonical refund text, so this points there.
  ['Refund Policy', 'route', '/terms'],
]
// Only Instagram exists today; LinkedIn / X are kept as inert labels until those
// accounts exist (so the layout doesn't jump), rather than dead links.
const SOCIAL = [
  ['Instagram', 'https://instagram.com/creasume/'],
  ['LinkedIn', ''],
  ['X', ''],
]

function onNavClick(kind, target) {
  return (e) => {
    e.preventDefault()
    if (kind === 'route') goToPath(target)
    else goToLandingSection(target)
  }
}

// href is only for hover/right-click affordance; onNavClick drives the SPA nav.
function hrefFor(kind, target) {
  return kind === 'route' ? target : `/landing#${target}`
}

function NavColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-bold text-lg mb-5" style={{ fontFamily: FONT }}>{title}</h4>
      <ul className="space-y-3">
        {links.map(([label, kind, target]) => (
          <li key={label}>
            <a
              href={hrefFor(kind, target)}
              onClick={onNavClick(kind, target)}
              className="text-white text-[15px] no-underline hover:underline underline-offset-4 decoration-1 decoration-white cursor-pointer"
              style={{ fontFamily: FONT }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialColumn() {
  return (
    <div>
      <h4 className="font-bold text-lg mb-5" style={{ fontFamily: FONT }}>Follow us</h4>
      <ul className="space-y-3">
        {SOCIAL.map(([label, url]) => (
          <li key={label}>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-white text-[15px] no-underline hover:underline underline-offset-4 decoration-1 decoration-white cursor-pointer"
                style={{ fontFamily: FONT }}
              >
                {label}
              </a>
            ) : (
              // No account yet — shown but not clickable (title explains why).
              <span
                className="text-white/45 text-[15px] cursor-default select-none"
                style={{ fontFamily: FONT }}
                title="Coming soon"
              >
                {label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FooterCard() {
  return (
    <footer className="relative z-10 mt-auto px-6 sm:px-10 md:px-20 lg:px-28 pt-28 md:pt-40 pb-12">
      <div
        className="mx-auto w-full max-w-[1040px] min-h-[320px] flex flex-col justify-between rounded-3xl px-7 sm:px-10 md:px-14 py-10 md:py-14"
        style={{
          // Solid dark-navy fill (padding-box) + #2E267E→#EC3434 gradient border.
          // The fill is a flat gradient so it's valid as a non-final bg layer.
          background:
            'linear-gradient(#000000, #000000) padding-box, ' +
            'linear-gradient(135deg, rgba(46,38,126,0.35) 0%, rgba(236,52,52,0.35) 100%) border-box',
          border: '1px solid transparent',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-6 md:pl-24">
          <NavColumn title="Creasume" links={CREASUME} />
          <NavColumn title="Company" links={COMPANY} />
          <SocialColumn />
        </div>
        <div className="mt-10 pt-5 border-t border-white/12 flex items-center justify-between gap-4">
          <span className="text-white text-[13px]" style={{ fontFamily: FONT }}>© 2026 Creasume. All rights reserved.</span>
          <a
            href="/contact"
            onClick={(e) => { e.preventDefault(); goToPath('/contact') }}
            className="text-white hover:text-white text-[13px] transition-colors cursor-pointer"
            style={{ fontFamily: FONT }}
          >
            contact
          </a>
        </div>
      </div>
    </footer>
  )
}

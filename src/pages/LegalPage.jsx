import { useState, useEffect } from 'react'
import Footer from '../components/Footer.jsx'

// Nav links point back to the home route sections. Because the legal pages live
// on hash routes (e.g. `#/privacy-policy`), a plain `#vision` link resets the
// route to home and scrolls to that section (see router.js).
const NAV = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'vision', label: 'Vision', href: '#vision' },
  { id: 'how-it-works', label: 'How it Works', href: '#/how-it-works' },
  { id: 'waitlist', label: 'Join the Waitlist', href: '#waitlist' },
]

// Shared shell for the Privacy Policy and Terms pages: starfield background,
// the site nav, a page title + intro, the rendered legal sections, and the
// shared footer. `sections` is an array of { heading, paragraphs?, bullets? }.
function LegalPage({ title, intro, sections }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // The page is reached from the footer, so the window keeps its previous
  // scroll position. Jump to the top whenever the page opens (and when
  // switching between Privacy and Terms).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [title])

  return (
    <div className="relative min-h-screen overflow-x-clip bg-black text-white">
      {/* Starfield */}
      <div className="starfield" />

      {/* ============ NAVIGATION ============ */}
      <nav className="relative z-50 flex items-center justify-between px-8 sm:px-12 md:px-20 lg:px-28 py-6">
        <a href="#home" className="flex items-center gap-2">
          <img src="/creasumelogo.png" alt="Creasume" className="h-12 md:h-14 w-auto" />
        </a>
        <div
          className="hidden md:flex items-center justify-between gap-1 px-2 rounded-full bg-[#020423] backdrop-blur-sm ml-auto"
          style={{ height: '52px' }}
        >
          {NAV.map((tab) => (
            <a
              key={tab.id}
              href={tab.href}
              className="flex items-center justify-center h-[42px] rounded-full font-medium transition-colors duration-150 ease-in-out text-[#9EA5E2] hover:text-white px-3"
              style={{ fontSize: '20px', fontWeight: 500 }}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-[#020423] text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden absolute left-6 right-6 top-full mt-2 rounded-2xl bg-[#020423] border border-[#36377A]/50 p-2 z-50 flex flex-col">
            {NAV.map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-medium transition-colors duration-150 text-[#9EA5E2] hover:text-white"
                style={{ fontSize: '18px', fontWeight: 500 }}
              >
                {tab.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ============ CONTENT ============ */}
      <main className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-8 md:pt-14 pb-20 md:pb-28 max-w-5xl mx-auto">
        <h1
          className="mb-7"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: 'clamp(40px, 7vw, 64px)',
            lineHeight: '105%',
          }}
        >
          {title}
        </h1>

        {intro && (
          <p
            className="text-white/85 mb-10 leading-relaxed"
            style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontSize: 'clamp(17px, 2vw, 20px)' }}
          >
            {intro}
          </p>
        )}

        <div className="space-y-7">
          {sections.map((section, idx) => (
            <section key={idx}>
              <h2
                className="mb-2 text-white font-bold"
                style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontSize: 'clamp(18px, 2.2vw, 21px)' }}
              >
                {section.heading}
              </h2>
              {section.paragraphs?.map((para, pIdx) => (
                <p
                  key={pIdx}
                  className="text-white/85 leading-relaxed mb-2"
                  style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontSize: 'clamp(16px, 1.9vw, 19px)' }}
                >
                  {para}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2 mt-1">
                  {section.bullets.map((bullet, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-white/85 leading-relaxed flex gap-3"
                      style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontSize: 'clamp(16px, 1.9vw, 19px)' }}
                    >
                      <span className="text-white/85 select-none">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LegalPage

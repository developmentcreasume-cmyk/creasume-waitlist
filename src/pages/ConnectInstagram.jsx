import { useEffect, useState } from 'react'
import { connectInstagramUrl } from '../services/dashboardApi.js'

// "No Instagram Account Connected" screen shown after sign-in (and from the
// dashboard when a creator hasn't linked Instagram yet). "Connect Now" starts
// the real OAuth, linking Instagram to the signed-in account (→ dashboard).

const FONT = "'Outfit', sans-serif"

// Colour Instagram glyph (IG gradient) for the hero.
function InstagramGlyph({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ciIg" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F58529" />
          <stop offset="0.35" stopColor="#DD2A7B" />
          <stop offset="0.7" stopColor="#8134AF" />
          <stop offset="1" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#ciIg)" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="url(#ciIg)" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.4" fill="url(#ciIg)" />
    </svg>
  )
}

export default function ConnectInstagram() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // A blocked connect (Instagram already linked to another account, or a Facebook
  // that manages a different Instagram) redirects here with a reason param.
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const ig = p.get('ig')
    const fb = p.get('fb')
    const igUser = p.get('ig_user') || p.get('ig') || ''
    let msg = ''
    if (ig === 'taken' || fb === 'taken') {
      msg = `That Instagram${igUser ? ` (@${igUser})` : ''} is already connected to another Creasume account. An Instagram account can only be linked to one account — connect a different one.`
    } else if (fb === 'mismatch') {
      msg = 'That Facebook manages a different Instagram than the one on your account. Connect the Facebook Page linked to your own Instagram.'
    }
    if (msg) {
      setNotice(msg)
      ;['ig', 'fb', 'ig_user'].forEach((k) => p.delete(k))
      const qs = p.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
    }
  }, [])

  // Link Instagram to the account the creator just signed into (carries their
  // JWT). Falls back to plain Instagram login if somehow not signed in.
  const connect = () => { window.location.href = connectInstagramUrl() }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-clip bg-[#0a0c1f] text-white px-4 py-8">
      <div className="starfield" />

      {/* Bigger black card; the inner content keeps its own size and stays
          centered so it doesn't stretch or shift — just more black around it. */}
      <div
        className="relative z-10 w-full max-w-6xl min-h-[640px] rounded-3xl px-6 sm:px-10 py-12 flex items-center justify-center"
        style={{ background: '#000', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
      >
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 md:gap-10 items-center">

          {/* ===== Connect hero (RIGHT on desktop, top on mobile) ===== */}
          <div className="md:order-2 text-center">
            {notice && (
              <div
                className="mb-6 rounded-xl px-4 py-3 text-left text-[13.5px] leading-snug text-white"
                style={{ fontFamily: FONT, background: 'rgba(244,96,122,0.12)', border: '1px solid rgba(244,96,122,0.4)' }}
              >
                {notice}
              </div>
            )}
            <div className="flex justify-center mb-6">
              <InstagramGlyph size={44} />
            </div>
            <h1 className="font-bold text-3xl sm:text-[34px] leading-tight mb-3" style={{ fontFamily: FONT }}>
              No Instagram Account Connected
            </h1>
            <p className="text-white/55 text-[14px] leading-relaxed max-w-sm mx-auto mb-8" style={{ fontFamily: FONT }}>
              Connect your Instagram account to see your real-time analytics and professional portfolio.
            </p>
            <button
              type="button"
              onClick={connect}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-semibold text-white text-[15px] transition-transform hover:scale-[1.02]"
              style={{
                fontFamily: FONT,
                background: 'linear-gradient(90deg, #8B5CF6 0%, #C13584 55%, #F58529 100%)',
                boxShadow: '0 12px 30px rgba(193,53,132,0.35)',
              }}
            >
              Connect Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>

          {/* ===== Walkthrough video (LEFT on desktop, below on mobile) ===== */}
          <div className="md:order-1 text-left">
            <p className="text-[13px] font-semibold mb-2.5 flex items-center gap-1.5 text-white/55" style={{ fontFamily: FONT }}>
              <span aria-hidden="true">▶</span> How connecting works
            </p>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-[420px] rounded-2xl block"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <source src="/connect-demo.mp4" type="video/mp4" />
              <source src="/connect-demo.webm" type="video/webm" />
            </video>
          </div>

        </div>
      </div>
    </div>
  )
}

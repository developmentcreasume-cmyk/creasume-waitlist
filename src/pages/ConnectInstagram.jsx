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
                background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
              }}
            >
              Connect Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>

            {/* "Your data is safe" box */}
            <div
              className="mt-6 mx-auto max-w-sm rounded-xl px-4 py-3 text-left"
              style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <p className="font-semibold text-[14px] mb-1.5 flex items-center gap-2 text-white" style={{ fontFamily: FONT }}>
                <span aria-hidden="true">🔒</span> Your data is <span style={{ color: '#4ADE80' }}>safe.</span>
              </p>
              <ul className="space-y-1 text-[12.5px] text-white/70" style={{ fontFamily: FONT }}>
                <li>– We only request what's needed.</li>
                <li>– Your data is never shared.</li>
              </ul>
            </div>

            {/* Public-account / earnings note — below the data-safe box */}
            <p className="mt-5 text-white/45 text-[12.5px] leading-snug max-w-xs mx-auto" style={{ fontFamily: FONT }}>
              Switch to a Public Account and unlock earnings once you reach 1,000 followers.
            </p>
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
              className="w-full max-w-[300px] mx-auto rounded-2xl block"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <source src="/connect-demo.mp4" type="video/mp4" />
              <source src="/connect-demo.webm" type="video/webm" />
            </video>

            {/* BELOW the demo card — secure log-in powered by Meta */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-white/45 text-[12.5px]" style={{ fontFamily: FONT }}>
              <span aria-hidden="true">🔒</span> Secure log-in powered by
              <span className="inline-flex items-center gap-1 font-semibold text-white/75">
                <svg viewBox="0 0 287.56 191" className="h-[13px] w-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs>
                    <linearGradient id="ciMetaG1" x1="62.34" y1="101.45" x2="260.34" y2="91.45" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#0064e1" /><stop offset="0.4" stopColor="#0064e1" /><stop offset="0.83" stopColor="#0073ee" /><stop offset="1" stopColor="#0082fb" />
                    </linearGradient>
                    <linearGradient id="ciMetaG2" x1="41.42" y1="53" x2="41.42" y2="126" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#0082fb" /><stop offset="1" stopColor="#0064e0" />
                    </linearGradient>
                  </defs>
                  <path fill="#0081fb" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z" />
                  <path fill="url(#ciMetaG2)" d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z" />
                  <path fill="url(#ciMetaG1)" d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3Z" />
                </svg>
                Meta
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

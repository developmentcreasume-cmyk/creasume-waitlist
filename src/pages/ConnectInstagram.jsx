import { useEffect } from 'react'
import { loginUrl } from '../services/dashboardApi.js'

// Shown right after signup (and any time a creator has no Instagram linked): an
// empty-state card prompting them to connect Instagram. "Connect Now" starts the
// real Instagram/Meta OAuth flow (→ /auth-success → their dashboard).

const FONT = "'Outfit', sans-serif"

function InstagramGlyph() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ciIg" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FEDA75" /><stop offset="0.25" stopColor="#FA7E1E" />
          <stop offset="0.5" stopColor="#D62976" /><stop offset="0.75" stopColor="#962FBF" /><stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ciIg)" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="url(#ciIg)" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.4" fill="url(#ciIg)" />
    </svg>
  )
}

export default function ConnectInstagram() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const connect = () => { window.location.href = loginUrl() }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-clip bg-black text-white px-4 sm:px-6 py-8 md:py-12">
      <div className="starfield" />

      <div
        className="relative z-10 w-full max-w-5xl rounded-[24px] flex flex-col items-center justify-center text-center px-6 sm:px-10 py-20 md:py-28"
        style={{
          minHeight: '460px',
          background: 'radial-gradient(120% 90% at 50% 40%, #14141c 0%, #0a0a10 60%, #050508 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}
      >
        <div className="mb-6">
          <InstagramGlyph />
        </div>

        <h1 className="font-bold mb-4" style={{ fontFamily: FONT, fontSize: 'clamp(26px, 4.5vw, 40px)' }}>
          No Instagram Account Connected
        </h1>
        <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed" style={{ fontFamily: FONT, fontSize: 'clamp(13px, 1.8vw, 16px)' }}>
          Connect your Instagram account to see your real-time analytics and professional portfolio.
        </p>

        <button
          type="button"
          onClick={connect}
          className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 font-semibold text-white transition-transform hover:scale-[1.03]"
          style={{ fontFamily: FONT, fontSize: 15, background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)', boxShadow: '0 12px 30px rgba(168,85,247,0.35)' }}
        >
          Connect Now
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

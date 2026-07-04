import { useEffect } from 'react'
import { loginUrl } from '../services/dashboardApi.js'
import ConnectDemo from './ConnectDemo.jsx'

// Branded "Connect Instagram" intro shown before the Meta login + allow-access
// screens. "Continue with Instagram" starts the real OAuth (→ /auth-success →
// dashboard). Reassures the creator their data is safe / view-only via Meta.

const FONT = "'Outfit', sans-serif"

// Scalloped verified seal (same geometry as the profile badge).
const SEAL_PATH = (() => {
  const N = 24, cx = 12, cy = 12, rOuter = 12, rInner = 10.4
  let d = ''
  for (let i = 0; i < N * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const a = (Math.PI / N) * i - Math.PI / 2
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)} `
  }
  return `${d}Z`
})()

function InstagramGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="#fff" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="#fff" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.3" fill="#fff" />
    </svg>
  )
}

function MetaGlyph() {
  return (
    <svg viewBox="0 0 287.56 191" className="h-3.5 w-auto inline-block align-middle" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="ciMeta1" x1="62.34" y1="101.45" x2="260.34" y2="91.45" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0064e1" /><stop offset="0.4" stopColor="#0064e1" /><stop offset="0.83" stopColor="#0073ee" /><stop offset="1" stopColor="#0082fb" />
        </linearGradient>
        <linearGradient id="ciMeta2" x1="41.42" y1="53" x2="41.42" y2="126" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0082fb" /><stop offset="1" stopColor="#0064e0" />
        </linearGradient>
      </defs>
      <path fill="#0081fb" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z" />
      <path fill="url(#ciMeta2)" d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z" />
      <path fill="url(#ciMeta1)" d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3Z" />
    </svg>
  )
}

export default function ConnectInstagram() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const connect = () => { window.location.href = loginUrl() }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-clip bg-black text-white px-4 py-8">
      <div className="starfield" />

      {/* Light sheet-style card (matches the mockup) */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl px-6 sm:px-8 py-8"
        style={{ background: '#EDEDF1', color: '#1b1b20', boxShadow: '0 40px 100px rgba(0,0,0,0.55)' }}
      >
        <h1 className="font-bold text-3xl mb-2" style={{ fontFamily: FONT }}>Connect Instagram</h1>
        <p className="text-[15px] leading-relaxed mb-6" style={{ fontFamily: FONT, color: '#6b6b73' }}>
          Switch to a Public Account and unlock earnings once you reach 1,000 followers
        </p>

        {/* Inner card: verified seal + data-safe box */}
        <div className="rounded-2xl px-5 py-7 mb-5" style={{ background: '#E3E3E8', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex justify-center mb-7">
            <span className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={SEAL_PATH} fill="#22C55E" />
                <path d="m8 12 2.6 2.6L16.2 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>

          <div className="rounded-xl px-4 py-4" style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)' }}>
            <p className="font-bold text-[16px] mb-3 flex items-center gap-2" style={{ fontFamily: FONT }}>
              <span aria-hidden="true">🔒</span>
              Your data is <span style={{ color: '#16A34A' }}>safe.</span>
            </p>
            <ul className="space-y-1.5 text-[14px]" style={{ fontFamily: FONT, color: '#33333a' }}>
              <li>– We only request what's needed.</li>
              <li>– Your data is never shared.</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-[13px] mb-5 flex items-center justify-center gap-1.5" style={{ fontFamily: FONT, color: '#6b6b73' }}>
          <span aria-hidden="true">🔒</span>
          Secure log-in powered by <MetaGlyph />
          <span className="font-semibold" style={{ color: '#1b1b20' }}>Meta</span>
        </p>

        <button
          type="button"
          onClick={connect}
          className="w-full rounded-xl py-3.5 font-semibold text-white text-[15px] inline-flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.01]"
          style={{
            fontFamily: FONT,
            background: 'linear-gradient(90deg, #515BD4 0%, #8134AF 30%, #DD2A7B 60%, #F58529 100%)',
            boxShadow: '0 12px 30px rgba(221,42,123,0.35)',
          }}
        >
          <InstagramGlyph size={20} />
          Continue with Instagram
        </button>

        {/* Looping walkthrough of what happens after you tap the button. */}
        <div className="mt-6">
          <p className="text-[13px] font-semibold mb-2.5 flex items-center gap-1.5" style={{ fontFamily: FONT, color: '#6b6b73' }}>
            <span aria-hidden="true">▶</span> How connecting works
          </p>
          <ConnectDemo />
        </div>
      </div>
    </div>
  )
}

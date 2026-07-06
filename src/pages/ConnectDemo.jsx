import { useEffect, useState } from 'react'

// Auto-playing, looping walkthrough of the Instagram connect flow, shown near
// the "Continue with Instagram" button so creators can preview what happens:
//   login → submitting → permissions → Allow → "your data is safe".
// Pure CSS/React (no video file) — recreates the reference frames as slides.

const FONT = "'Outfit', sans-serif"
const STEP_MS = 2200

// Instagram script wordmark (cursive fallback — no font to load).
function IgWordmark({ size = 30 }) {
  return (
    <div
      className="text-center"
      style={{ fontFamily: "'Snell Roundhand', 'Segoe Script', 'Bradley Hand', cursive", color: '#111', fontSize: size, lineHeight: 1.1 }}
    >
      Instagram
    </div>
  )
}

// Meta permission-style on/off switch.
function Toggle({ on = true, dim = false }) {
  return (
    <span
      className="relative inline-flex shrink-0 rounded-full"
      style={{ width: 40, height: 23, background: on ? '#111' : '#c8c8d0', opacity: dim ? 0.55 : 1 }}
    >
      <span
        className="absolute rounded-full bg-white"
        style={{ width: 19, height: 19, top: 2, left: on ? 19 : 2, transition: 'left .3s ease' }}
      />
    </span>
  )
}

function Field({ label, children }) {
  return (
    <div className="rounded-md px-3 py-2 text-left" style={{ background: '#fff', border: '1px solid #d9d9e0' }}>
      {label && <div className="text-[11px] leading-none mb-1" style={{ fontFamily: FONT, color: '#8a8a93' }}>{label}</div>}
      <div className="text-[15px] leading-none" style={{ fontFamily: FONT, color: '#1b1b20' }}>{children}</div>
    </div>
  )
}

function PermRow({ label, on = true, dim = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <span className="text-[13px] leading-snug text-left" style={{ fontFamily: FONT, color: '#2b2b31' }}>{label}</span>
      <Toggle on={on} dim={dim} />
    </div>
  )
}

// Instagram glyph (IG gradient) for the intro slide.
function IgGlyph({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cdIg" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F58529" /><stop offset="0.35" stopColor="#DD2A7B" />
          <stop offset="0.7" stopColor="#8134AF" /><stop offset="1" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#cdIg)" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="url(#cdIg)" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.4" fill="url(#cdIg)" />
    </svg>
  )
}

// ---- The slides ----

// Intro: "Connect Instagram" — shown FIRST, above the login flow.
function SlideConnect() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-4 text-center">
      <IgGlyph size={44} />
      <div>
        <h3 className="font-bold text-[18px] leading-tight" style={{ fontFamily: FONT, color: '#1b1b20' }}>
          Connect Instagram
        </h3>
        <p className="mt-1.5 text-[13px] leading-snug max-w-[240px] mx-auto" style={{ fontFamily: FONT, color: '#6b6b73' }}>
          Switch to a Public Account and unlock earnings once you reach 1,000 followers.
        </p>
      </div>
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white"
        style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#a855f7 0%,#ec4899 100%)' }}
      >
        Continue with Instagram
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </span>
    </div>
  )
}

// Final: success tick + "data is safe" box BELOW it.
function SlideConnected() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-3 text-center">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#22C55E" />
        <path d="m7.5 12.2 2.9 2.9L16.6 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <h3 className="font-bold text-[17px] leading-tight" style={{ fontFamily: FONT, color: '#1b1b20' }}>
          Instagram Connected Successfully
        </h3>
        <p className="mt-1 text-[12.5px]" style={{ fontFamily: FONT, color: '#8a8a93' }}>
          Your influence card is ready.
        </p>
      </div>
      {/* data-is-safe box, shown below the tick */}
      <div className="rounded-xl px-4 py-3 w-full" style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)' }}>
        <p className="font-bold text-[14px] mb-1.5 flex items-center gap-2" style={{ fontFamily: FONT, color: '#1b1b20' }}>
          <span aria-hidden="true">🔒</span> Your data is <span style={{ color: '#16A34A' }}>safe.</span>
        </p>
        <ul className="space-y-1 text-[12.5px] text-left" style={{ fontFamily: FONT, color: '#33333a' }}>
          <li>– We only request what's needed.</li>
          <li>– Your data is never shared.</li>
        </ul>
      </div>
    </div>
  )
}

function SlideLogin({ submitting }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="py-1"><IgWordmark /></div>
      <Field label="Phone Number, username, or email">aryanbattish</Field>
      <Field>
        <span style={{ letterSpacing: 3 }}>{submitting ? '••••••' : '•'}</span>
        {!submitting && <span className="inline-block w-px h-[15px] align-middle ml-0.5 animate-pulse" style={{ background: '#1b1b20' }} />}
      </Field>
      <button
        type="button"
        className="w-full rounded-md py-2.5 text-[14px] font-semibold text-white inline-flex items-center justify-center"
        style={{ fontFamily: FONT, background: '#4f5bd5' }}
      >
        {submitting
          ? <span className="h-4 w-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff' }} />
          : 'Log in'}
      </button>
    </div>
  )
}

function SlidePermissions() {
  return (
    <div className="flex flex-col">
      <div className="py-1 mb-1.5"><IgWordmark size={26} /></div>
      <PermRow label="Allow access to messages" on />
      <PermRow label="View profile and access media (required)" on dim />
      <PermRow label="Access and manage messages" on />
      <PermRow label="Access and manage insights" on />
    </div>
  )
}

function SlideAllow() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col mb-4">
        <PermRow label="Allow access to messages" on />
        <PermRow label="Access and manage messages" on />
        <PermRow label="Access and manage insights" on />
      </div>
      <button type="button" className="w-full rounded-lg py-2.5 text-[14px] font-semibold text-white mb-2" style={{ fontFamily: FONT, background: '#4f5bd5' }}>Allow</button>
      <button type="button" className="w-full rounded-lg py-2.5 text-[14px] font-semibold" style={{ fontFamily: FONT, background: '#d9d9e0', color: '#3a3a42' }}>Cancel</button>
    </div>
  )
}

const SLIDES = [
  (k) => <SlideConnect key={k} />,
  (k) => <SlideLogin key={k} submitting={false} />,
  (k) => <SlideLogin key={k} submitting />,
  (k) => <SlidePermissions key={k} />,
  (k) => <SlideAllow key={k} />,
  (k) => <SlideConnected key={k} />,
]

export default function ConnectDemo() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % SLIDES.length), STEP_MS)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#E3E3E8', border: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Slide viewport — fixed height so it never jumps between steps. */}
      <div className="relative px-5 pt-5 pb-4" style={{ minHeight: 300 }}>
        {/* key forces a fresh fade-in each step, mimicking a video cut. */}
        <div key={step} style={{ animation: 'demoSlide .45s ease' }}>
          {SLIDES[step](step)}
        </div>
      </div>

      {/* Video-style step progress bar. */}
      <div className="px-5 pb-3">
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <span key={i} className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.12)' }}>
              <span
                className="block h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg,#515BD4,#DD2A7B)',
                  width: i < step ? '100%' : '0%',
                  animation: i === step ? `demoBar ${STEP_MS}ms linear forwards` : 'none',
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { loginUrl } from '../services/dashboardApi.js'
import { goToPath } from '../router.js'

// Standalone auth page (/login) — a centered two-panel card: a blue "Get Started"
// stepper panel on the left and the "Welcome" sign-in form on the right, over a
// faint CREASUME watermark. UI only for now (wire real auth to handleSubmit).

const FONT = "'Outfit', sans-serif"

const STEPS = [
  { n: 1, label: 'Sign Up your Account' },
  { n: 2, label: 'Log In your Account' },
  { n: 3, label: 'Create your Influence Card' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36.3 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}

export default function Login() {
  const [form, setForm] = useState({ name: '', email: '', password: '', remember: false })
  const [show, setShow] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Same component serves /login and /signup; the route decides the copy, fields
  // and highlighted step. The stepper marks step 1 for sign-up, step 2 for login.
  const isSignup = typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/signup'
  const activeStep = isSignup ? 1 : 2

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // The backend authenticates creators through Instagram/Meta OAuth (there's no
  // email/password or Google endpoint), so every sign-in action kicks off that
  // real flow. It returns to /auth-success and on to the creator's dashboard.
  const startLogin = () => { window.location.href = loginUrl() }

  // On the /signup route, submitting the form takes the new creator to the
  // "Connect Instagram" step (where the actual OAuth happens) instead of logging
  // in directly. On /login it authenticates straight away.
  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSignup) goToPath('/connect')
    else startLogin()
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-clip bg-black text-white px-4 sm:px-6 py-8 md:py-12">
      <div className="starfield" />

      <div
        className="relative z-10 w-full max-w-5xl rounded-[28px] overflow-hidden grid grid-cols-1 lg:grid-cols-2"
        style={{
          background: '#0A0A12',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          minHeight: '560px',
        }}
      >
        {/* ===== Left — blue stepper panel ===== */}
        <div
          className="relative hidden lg:flex flex-col justify-center px-10 xl:px-14 py-14 overflow-hidden"
          style={{
            background:
              'radial-gradient(120% 90% at 15% 12%, #2a3a8f 0%, #16205e 38%, #0a0f30 72%, #070a22 100%)',
          }}
        >
          <div className="relative z-10">
            <h2 className="font-semibold mb-3" style={{ fontFamily: FONT, fontSize: 'clamp(28px, 3vw, 40px)' }}>
              Get Started With Us
            </h2>
            <p className="text-white/70 mb-10 max-w-xs" style={{ fontFamily: FONT, fontSize: '15px' }}>
              Complete these easy steps to build your CREASUME
            </p>

            <div className="flex flex-col gap-3 max-w-[300px]">
              {STEPS.map((s) => {
                const isActive = s.n === activeStep
                return (
                <div
                  key={s.n}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                  style={{
                    background: isActive ? '#ffffff' : 'rgba(255,255,255,0.10)',
                    color: isActive ? '#0B0B27' : 'rgba(255,255,255,0.85)',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <span
                    className="grid place-items-center rounded-full font-bold shrink-0"
                    style={{
                      width: 26, height: 26, fontSize: 13,
                      background: isActive ? '#0B0B27' : 'rgba(255,255,255,0.2)',
                      color: '#fff',
                    }}
                  >
                    {s.n}
                  </span>
                  {s.label && (
                    <span className="font-semibold" style={{ fontFamily: FONT, fontSize: 15 }}>{s.label}</span>
                  )}
                </div>
                )
              })}
            </div>
          </div>

          {/* Faint CREASUME watermark */}
          <span
            className="pointer-events-none select-none absolute -bottom-3 left-12 right-0 font-bold whitespace-nowrap"
            style={{ fontFamily: FONT, fontSize: 'clamp(40px, 6vw, 78px)', color: 'rgba(255,255,255,0.06)' }}
          >
            CREASUME
          </span>
        </div>

        {/* ===== Right — sign-in form ===== */}
        <div className="relative flex flex-col justify-center px-6 sm:px-10 xl:px-16 py-12 md:py-14">
          <div className="w-full max-w-sm mx-auto">
            {/* Brand logo above the form */}
            <img src="/creasumelogo.svg" alt="Creasume" className="h-8 w-auto mx-auto mb-6" style={{ objectFit: 'contain' }} />
            <h1 className="text-center font-semibold mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(30px, 4vw, 40px)' }}>
              {isSignup ? 'Create Account' : 'Welcome'}
            </h1>
            <p className="text-center text-white/55 mb-8" style={{ fontFamily: FONT, fontSize: 14 }}>
              {isSignup ? 'Let’s get you started — create your CREASUME.' : 'Welcome back! Please enter your details.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {isSignup && (
                <div>
                  <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-lg px-4 py-3 text-[15px] text-white outline-none transition-colors focus:border-white/40 placeholder:text-white/35"
                    style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)' }}
                  />
                </div>
              )}
              <div>
                <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg px-4 py-3 text-[15px] text-white outline-none transition-colors focus:border-white/40 placeholder:text-white/35"
                  style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)' }}
                />
              </div>

              <div>
                <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Password</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg px-4 py-3 pr-11 text-[15px] text-white outline-none transition-colors focus:border-white/40 placeholder:text-white/35"
                    style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)' }}
                  />
                  <button
                    type="button"
                    aria-label={show ? 'Hide password' : 'Show password'}
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/80 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="2.5" />
                    </svg>
                  </button>
                </div>
              </div>

              {!isSignup && (
                <div className="flex items-center justify-between text-[13px]">
                  <label className="flex items-center gap-2 text-white/70 cursor-pointer select-none" style={{ fontFamily: FONT }}>
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={(e) => set('remember', e.target.checked)}
                      className="w-4 h-4 rounded accent-[#9B93E8]"
                    />
                    Remember for 30 days
                  </label>
                  <a href="#forgot" className="font-medium hover:underline" style={{ fontFamily: FONT, color: '#9B93E8' }}>Forgot Password</a>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg py-3 font-semibold text-[15px] transition-transform hover:scale-[1.01]"
                style={{ fontFamily: FONT, color: '#0B0B27', background: 'linear-gradient(180deg, #C9C4F0 0%, #A79FE6 100%)' }}
              >
                {isSignup ? 'Create account' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={startLogin}
                className="w-full rounded-lg py-3 font-semibold text-[15px] text-white inline-flex items-center justify-center gap-3 transition-colors hover:bg-white/5"
                style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.16)' }}
              >
                <GoogleIcon />
                {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
              </button>
            </form>

            <p className="text-center text-white/55 text-[13px] mt-7" style={{ fontFamily: FONT }}>
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <a href="/login" onClick={(e) => { e.preventDefault(); goToPath('/login') }} className="font-medium hover:underline" style={{ color: '#9B93E8' }}>Log in.</a>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <a href="/signup" onClick={(e) => { e.preventDefault(); goToPath('/signup') }} className="font-medium hover:underline" style={{ color: '#9B93E8' }}>Sign Up now.</a>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

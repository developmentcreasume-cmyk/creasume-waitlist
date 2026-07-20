import { useEffect, useState } from 'react'
import { registerAccount, loginAccount, loginWithGoogle, verifyPhoneWidget, captureReferralCode, clearReferralCode, getReferralCode, setReferralCode } from '../services/dashboardApi.js'
import { loadMsg91Widget, widgetSendOtp, widgetVerifyOtp, widgetRetryOtp } from '../services/msg91Widget.js'
import { goToPath } from '../router.js'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'

// Turn whatever the user typed into "country code + number, no +". Defaults to
// India (91) when they enter a bare 10-digit number.
const normalizePhoneInput = (raw) => {
  const digits = (raw || '').replace(/[^\d]/g, '')
  return digits.length === 10 ? `91${digits}` : digits
}

// Standalone auth page (/login) — a centered two-panel card: a blue "Get Started"
// stepper panel on the left and the "Welcome" sign-in form on the right, over a
// faint CREASUME watermark. UI only for now (wire real auth to handleSubmit).

const FONT = "'Outfit', sans-serif"

const STEPS = [
  { n: 1, label: 'Sign Up your Account' },
  { n: 2, label: 'Log In your Account' },
  { n: 3, label: 'Create your Influence Card' },
]

export default function Login() {
  const [form, setForm] = useState({ name: '', email: '', password: '', remember: false })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Phone OTP (MSG91 widget) as an alternative to email/password.
  const [method, setMethod] = useState('email') // 'email' | 'phone'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [resendIn, setResendIn] = useState(0) // seconds until "Resend" re-enables

  // Same component serves /login and /signup; the route decides the copy, fields
  // and highlighted step. The stepper marks step 1 for sign-up, step 2 for login.
  const isSignup = typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/signup'
  const activeStep = isSignup ? 1 : 2

  // Capture a ?ref=CODE referral link on arrival and remember it until signup.
  const [referred] = useState(() => { captureReferralCode(); return Boolean(getReferralCode()) })
  // The referral code shown in the signup field — prefilled from the link, but
  // editable so someone who was sent the code as text can type it in. Writing it
  // back through setReferralCode() means the existing signup calls pick it up.
  const [refCode, setRefCode] = useState(() => getReferralCode())
  const onRefCodeChange = (v) => { const u = v.toUpperCase(); setRefCode(u); setReferralCode(u) }

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Landed here from a completed password reset (/login?reset=1) — confirm it
  // worked, so the redirect doesn't look like the reset silently failed.
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('reset') === '1') {
      setNotice('Password updated — sign in with your new password.')
    }
  }, [])

  // Preload the MSG91 widget when the user switches to phone sign-in.
  useEffect(() => {
    if (method === 'phone') loadMsg91Widget().catch((e) => setErr(e.message))
  }, [method])

  // Countdown that gates the "Resend OTP" button after each send.
  useEffect(() => {
    if (resendIn <= 0) return
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendIn])

  // Both email and phone logins return the same { token, creator }. Route the
  // same way: to the dashboard when Instagram is linked, else to Connect.
  const routeAfterAuth = (data) => {
    // The referral code (if any) has now been consumed by the signup — drop it
    // so it can't attach to a different account signed up later on this browser.
    clearReferralCode()
    const c = data.creator || {}
    if (c.instagramConnected && c.publicId) goToPath(`/${c.publicId}/dashboard`)
    else goToPath('/connect')
  }

  // Phone step 1 — send the OTP via the widget.
  const handleSendOtp = async () => {
    if (busy) return
    const identifier = normalizePhoneInput(phone)
    if (identifier.length < 11) {
      setErr('Enter a valid phone number with country code.')
      return
    }
    setErr('')
    setBusy(true)
    try {
      await loadMsg91Widget()
      await widgetSendOtp(identifier)
      setOtpSent(true)
      setResendIn(30)
    } catch (e2) {
      setErr(e2.message || 'Could not send OTP.')
    } finally {
      setBusy(false)
    }
  }

  // Resend the OTP (default channel) and restart the cooldown.
  const handleResendOtp = async () => {
    if (busy || resendIn > 0) return
    setErr('')
    setBusy(true)
    try {
      await widgetRetryOtp(null)
      setResendIn(30)
    } catch (e2) {
      setErr(e2.message || 'Could not resend OTP.')
    } finally {
      setBusy(false)
    }
  }

  // Phone step 2 — verify the OTP, hand the access token to our backend, log in.
  const handleVerifyOtp = async () => {
    if (busy) return
    if (!otp.trim()) { setErr('Enter the OTP you received.'); return }
    setErr('')
    setBusy(true)
    try {
      const accessToken = await widgetVerifyOtp(otp.trim())
      const data = await verifyPhoneWidget(accessToken, form.name)
      routeAfterAuth(data)
    } catch (e2) {
      setErr(e2.message || 'OTP verification failed.')
    } finally {
      setBusy(false)
    }
  }

  // Sign up / sign in with email + password against the account-auth endpoints.
  // On success the JWT is stored; we then send the creator to the Connect
  // Instagram step (NOT straight into Instagram's OAuth login) so they choose to
  // link Instagram there.
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (busy) return

    // Phone method: the submit button drives the two-step OTP flow instead.
    if (method === 'phone') {
      if (otpSent) return handleVerifyOtp()
      return handleSendOtp()
    }

    setErr('')
    setBusy(true)
    try {
      if (isSignup) {
        // New account → go connect Instagram first.
        await registerAccount({ name: form.name, email: form.email, password: form.password })
        clearReferralCode()
        goToPath('/connect')
      } else {
        // Existing account → straight to their own dashboard if Instagram is
        // already linked, otherwise send them to connect it.
        const data = await loginAccount({ email: form.email, password: form.password, remember: form.remember })
        routeAfterAuth(data)
      }
    } catch (e2) {
      setErr(e2.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  // Google Sign-In. The button hands us a signed credential; the backend
  // verifies it and returns the same { token, creator } as email login, so we
  // route the same way: straight to the dashboard when Instagram is already
  // linked, otherwise to the Connect step. Works for both /login and /signup.
  const handleGoogle = async (credential) => {
    if (busy) return
    setErr('')
    setBusy(true)
    try {
      const data = await loginWithGoogle(credential)
      clearReferralCode()
      const c = data.creator || {}
      if (c.instagramConnected && c.publicId) goToPath(`/${c.publicId}/dashboard`)
      else goToPath('/connect')
    } catch (e2) {
      setErr(e2.message || 'Google sign-in failed. Please try again.')
    } finally {
      setBusy(false)
    }
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
            <h1 className="text-center font-semibold mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(30px, 4vw, 40px)' }}>
              {isSignup ? 'Create Account' : 'Welcome'}
            </h1>
            <p className="text-center text-white/55 mb-8" style={{ fontFamily: FONT, fontSize: 14 }}>
              {isSignup ? 'Let’s get you started — create your CREASUME.' : 'Welcome back! Please enter your details.'}
            </p>

            {referred && isSignup && (
              <div
                className="mb-6 rounded-xl px-4 py-3 flex items-center gap-2.5 text-[13px] font-medium"
                style={{ fontFamily: FONT, color: '#C9C4F0', background: 'rgba(155,147,232,0.10)', border: '1px solid rgba(155,147,232,0.30)' }}
              >
                <span aria-hidden>🎁</span>
                You were invited by a friend — sign up and you both get 50% off your plan.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {method === 'email' ? (
                <>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/75 hover:text-white transition-colors"
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
                      <a href="/forgot-password" onClick={(e) => { e.preventDefault(); goToPath('/forgot-password') }} className="font-medium hover:underline" style={{ fontFamily: FONT, color: '#9B93E8' }}>Forgot Password</a>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Phone number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); if (otpSent) setOtpSent(false) }}
                      placeholder="e.g. 9812345678"
                      disabled={otpSent}
                      className="w-full rounded-lg px-4 py-3 text-[15px] text-white outline-none transition-colors focus:border-white/40 placeholder:text-white/35 disabled:opacity-60"
                      style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)' }}
                    />
                    <p className="text-white/40 text-[12px] mt-1.5" style={{ fontFamily: FONT }}>
                      Indian numbers work as-is; for others include the country code.
                    </p>
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Enter OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit code"
                        autoFocus
                        className="w-full rounded-lg px-4 py-3 text-[15px] tracking-[0.3em] text-white outline-none transition-colors focus:border-white/40 placeholder:text-white/35 placeholder:tracking-normal"
                        style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)' }}
                      />
                      <div className="flex items-center justify-between mt-2 text-[12px]" style={{ fontFamily: FONT }}>
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtp(''); setResendIn(0) }}
                          className="font-medium hover:underline"
                          style={{ color: '#9B93E8' }}
                        >
                          Change number
                        </button>
                        {resendIn > 0 ? (
                          <span className="text-white/40">Resend OTP in {resendIn}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={busy}
                            className="font-medium hover:underline disabled:opacity-50"
                            style={{ color: '#9B93E8' }}
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isSignup && (
                <div>
                  <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>
                    Referral code <span className="text-white/40 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={refCode}
                    onChange={(e) => onRefCodeChange(e.target.value)}
                    placeholder="Have a friend's code? Enter it"
                    autoCapitalize="characters"
                    className="w-full rounded-lg px-4 py-3 text-[15px] tracking-wider text-white outline-none transition-colors focus:border-white/40 placeholder:text-white/35 placeholder:tracking-normal"
                    style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)' }}
                  />
                </div>
              )}

              {notice && !err && (
                <p className="text-[13px] font-medium -mt-1" style={{ fontFamily: FONT, color: '#4ADE80' }}>{notice}</p>
              )}

              {err && (
                <p className="text-[13px] font-medium -mt-1" style={{ fontFamily: FONT, color: '#FB7185' }}>{err}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg py-3 font-semibold text-[15px] transition-transform hover:scale-[1.01] disabled:opacity-60"
                style={{ fontFamily: FONT, color: '#0B0B27', background: 'linear-gradient(180deg, #C9C4F0 0%, #A79FE6 100%)' }}
              >
                {busy
                  ? 'Please wait…'
                  : method === 'phone'
                    ? (otpSent ? 'Verify & continue' : 'Send OTP')
                    : isSignup ? 'Create account' : 'Sign in'}
              </button>

            </form>

            {/* ===== or — continue with Google ===== */}
            <div className="flex items-center gap-3 my-6">
              <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <span className="text-white/40 text-[12px]" style={{ fontFamily: FONT }}>or</span>
              <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.12)' }} />
            </div>

            <GoogleSignInButton
              label={isSignup ? 'Sign up with Google' : 'Sign in with Google'}
              onCredential={handleGoogle}
              onError={setErr}
            />

            <button
              type="button"
              onClick={() => {
                setErr('')
                setOtpSent(false)
                setOtp('')
                setMethod((m) => (m === 'phone' ? 'email' : 'phone'))
              }}
              className="w-full mt-3 rounded-lg py-3 font-semibold text-[15px] transition-colors"
              style={{ fontFamily: FONT, color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              {method === 'phone' ? 'Continue with Email' : 'Continue with Phone'}
            </button>

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

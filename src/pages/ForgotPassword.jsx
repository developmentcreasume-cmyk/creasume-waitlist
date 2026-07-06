import { useEffect, useState } from 'react'
import { forgotPassword } from '../services/dashboardApi.js'
import { goToPath } from '../router.js'

// /forgot-password — enter your email to receive a reset link.
const FONT = "'Outfit', sans-serif"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputStyle = {
  fontFamily: FONT,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.14)',
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!EMAIL_RE.test(email.trim())) { setErr('Enter a valid email address.'); return }
    setBusy(true)
    try {
      await forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch {
      // The backend always succeeds; treat any network hiccup as sent too.
      setSent(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-clip bg-black text-white px-4 py-10">
      <div className="starfield" />
      <div
        className="relative z-10 w-full max-w-md rounded-[24px] px-6 sm:px-9 py-10"
        style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
      >
        {sent ? (
          <>
            <h1 className="text-center font-semibold text-3xl mb-3" style={{ fontFamily: FONT }}>Check your email</h1>
            <p className="text-center text-white/55 text-[14px] leading-relaxed mb-8" style={{ fontFamily: FONT }}>
              If an account exists for <span className="text-white">{email.trim().toLowerCase()}</span>, we&apos;ve sent a link to reset your password. It expires in 1 hour.
            </p>
            <a
              href="/login"
              onClick={(e) => { e.preventDefault(); goToPath('/login') }}
              className="block text-center w-full rounded-lg py-3 font-semibold text-[15px] no-underline"
              style={{ fontFamily: FONT, color: '#0B0B27', background: 'linear-gradient(180deg, #C9C4F0 0%, #A79FE6 100%)' }}
            >
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <h1 className="text-center font-semibold text-3xl mb-2" style={{ fontFamily: FONT }}>Forgot password?</h1>
            <p className="text-center text-white/55 text-[14px] mb-8" style={{ fontFamily: FONT }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={submit} className="flex flex-col gap-5">
              <div>
                <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg px-4 py-3 text-[15px] text-white outline-none transition-colors focus:border-white/40 placeholder:text-white/35"
                  style={inputStyle}
                />
              </div>
              {err && <p className="text-[13px] font-medium -mt-1" style={{ fontFamily: FONT, color: '#FB7185' }}>{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg py-3 font-semibold text-[15px] transition-transform hover:scale-[1.01] disabled:opacity-60"
                style={{ fontFamily: FONT, color: '#0B0B27', background: 'linear-gradient(180deg, #C9C4F0 0%, #A79FE6 100%)' }}
              >
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="text-center text-white/55 text-[13px] mt-7" style={{ fontFamily: FONT }}>
              Remembered it?{' '}
              <a href="/login" onClick={(e) => { e.preventDefault(); goToPath('/login') }} className="font-medium hover:underline" style={{ color: '#9B93E8' }}>Sign in.</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

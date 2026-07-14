import { useEffect, useState } from 'react'
import { resetPassword, clearAuth } from '../services/dashboardApi.js'
import { goToPath } from '../router.js'

// /reset-password?token=… — set a new password from the emailed link, then send
// the user to /login to sign in with it.
//
// The backend's /auth/reset-password also returns a JWT (it signs you straight
// in), which dashboardApi stores. Since we want them to log in again, we DROP
// that token before redirecting — otherwise they'd sit on the login page while
// already authenticated.
const FONT = "'Outfit', sans-serif"

const inputStyle = {
  fontFamily: FONT,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.14)',
}

export default function ResetPassword() {
  const [token, setToken] = useState('')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    const t = new URLSearchParams(window.location.search).get('token') || ''
    setToken(t.trim())
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!token) { setErr('This reset link is invalid. Request a new one.'); return }
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (pw !== confirm) { setErr('Passwords don’t match.'); return }
    setBusy(true)
    try {
      await resetPassword({ token, password: pw })
      // Password changed. Drop the auto-issued JWT so they genuinely sign in
      // again with the new password, then send them to the login page.
      clearAuth()
      goToPath('/login?reset=1')
    } catch (e2) {
      setErr(e2.message || 'Could not reset password. The link may have expired.')
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
        <h1 className="text-center font-semibold text-3xl mb-2" style={{ fontFamily: FONT }}>Set a new password</h1>
        <p className="text-center text-white/55 text-[14px] mb-8" style={{ fontFamily: FONT }}>
          Choose a new password for your account.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div>
            <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>New password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg px-4 py-3 pr-11 text-[15px] text-white outline-none transition-colors focus:border-white/40 placeholder:text-white/35"
                style={inputStyle}
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
          <div>
            <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Confirm password</label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
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
            {busy ? 'Saving…' : 'Reset password'}
          </button>
        </form>

        <p className="text-center text-white/55 text-[13px] mt-7" style={{ fontFamily: FONT }}>
          <a href="/login" onClick={(e) => { e.preventDefault(); goToPath('/login') }} className="font-medium hover:underline" style={{ color: '#9B93E8' }}>Back to sign in</a>
        </p>
      </div>
    </div>
  )
}

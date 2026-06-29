// DEV-ONLY local sign-in. Visit /dev-login?username=<creator> and this page
// calls the backend's dev-login (which mints a token for that creator, only
// when the server isn't in production), stores it on THIS origin, and forwards
// to the creator's dashboard. Origin-proof: the token is always saved on the
// same origin you're browsing, so there's no localhost vs 127.0.0.1 mismatch.
import { useEffect, useState } from 'react'
import { API_BASE, setToken, setStoredUsername, dashboardBase } from '../../services/dashboardApi.js'
import { FONT } from '../influence/influenceData.js'

export default function DevLogin() {
  const [msg, setMsg] = useState('Signing you in…')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const username = (params.get('username') || '').trim()
    if (!username) {
      setMsg('Add ?username=<creator> to the URL, e.g. /dev-login?username=finding.rhythm')
      return
    }

    let alive = true
    fetch(`${API_BASE}/auth/dev-login?username=${encodeURIComponent(username)}`)
      .then((r) => r.json().catch(() => ({})))
      .then((data) => {
        if (!alive) return
        if (!data?.success || !data.token) {
          throw new Error(data?.error || 'Dev login failed')
        }
        setToken(data.token)
        setStoredUsername(data.username)
        // Land on the creator's dashboard (token now lives on this origin).
        window.history.replaceState({}, '', dashboardBase(data.username))
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      .catch((e) => { if (alive) setMsg(e.message || 'Dev login failed') })

    return () => { alive = false }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: '#05060f' }}>
      <div className="h-10 w-10 rounded-full animate-spin" style={{ border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#8B5CF6' }} />
      <p className="text-white/70 text-[15px]" style={{ fontFamily: FONT }}>{msg}</p>
    </div>
  )
}

// Landing target for the Instagram login redirect:
//   backend /auth/callback → ${FRONTEND_URL}/auth-success?token=…&username=…
// Stores the JWT + username, then forwards to the creator's own dashboard at
// /<username>/dashboard. Rendered briefly; the user just sees a spinner.
import { useEffect } from 'react'
import { setToken, setStoredUsername, dashboardBase } from '../../services/dashboardApi.js'
import { FONT } from '../influence/influenceData.js'

export default function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const username = params.get('username') || ''

    if (token) {
      setToken(token)
      if (username) setStoredUsername(username)
    }

    // Replace (not push) so the back button skips this throwaway screen. Land on
    // the creator's dashboard if we know the username, else the home page.
    const dest = token && username ? dashboardBase(username) : '/'

    // Defer to a macrotask: React runs CHILD effects before PARENT effects, so
    // on first load the router's popstate listener (registered in Root's effect)
    // isn't attached yet. Firing popstate synchronously here would be missed and
    // the screen would hang on this spinner. setTimeout(0) lets the parent effect
    // run first, so the route actually switches to the dashboard.
    const id = setTimeout(() => {
      window.history.replaceState({}, '', dest)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }, 0)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#05060f' }}>
      <div
        className="h-10 w-10 rounded-full animate-spin"
        style={{ border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#8B5CF6' }}
      />
      <p className="text-white/70 text-[15px]" style={{ fontFamily: FONT }}>Signing you in…</p>
    </div>
  )
}

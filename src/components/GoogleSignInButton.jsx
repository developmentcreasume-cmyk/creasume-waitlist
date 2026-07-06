// The official "Sign in with Google" button, rendered by Google Identity
// Services (GIS). Loads the GIS script once, initialises it with our OAuth Web
// client id, and hands the resulting `credential` (a signed ID token) back to
// the parent via onCredential — which POSTs it to the backend /auth/google.
//
// Requires VITE_GOOGLE_CLIENT_ID to be set to the SAME OAuth 2.0 Web client id
// the backend verifies against (GOOGLE_CLIENT_ID). If it's missing the button
// renders nothing and reports via onError, so the email/password form still
// works on its own.
import { useEffect, useRef } from 'react'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

// Load the GIS script a single time, shared across every button instance.
let gisPromise = null
function loadGis() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.google?.accounts?.id) return Promise.resolve()
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => { gisPromise = null; reject(new Error('Could not load Google sign-in.')) }
    document.head.appendChild(s)
  })
  return gisPromise
}

export default function GoogleSignInButton({ onCredential, onError, text = 'continue_with' }) {
  const holderRef = useRef(null)
  // Keep the latest callbacks in refs so the render effect can stay keyed only on
  // `text` — re-running it would re-mount the Google button and lose its state.
  const cbRef = useRef(onCredential)
  const errRef = useRef(onError)
  useEffect(() => {
    cbRef.current = onCredential
    errRef.current = onError
  })

  useEffect(() => {
    if (!CLIENT_ID) {
      // Not configured yet — stay silent so the email/password form is unaffected.
      // (Set VITE_GOOGLE_CLIENT_ID to enable the button.)
      console.warn('[GoogleSignInButton] VITE_GOOGLE_CLIENT_ID is not set — Google sign-in is hidden.')
      return
    }
    let cancelled = false
    loadGis()
      .then(() => {
        if (cancelled || !holderRef.current) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => { if (resp?.credential) cbRef.current?.(resp.credential) },
        })
        holderRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(holderRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text,           // 'continue_with' | 'signin_with' | 'signup_with'
          logo_alignment: 'left',
          width: 320,
        })
      })
      .catch((e) => { if (!cancelled) errRef.current?.(e.message) })
    return () => { cancelled = true }
  }, [text])

  if (!CLIENT_ID) return null
  return <div ref={holderRef} className="flex justify-center" />
}

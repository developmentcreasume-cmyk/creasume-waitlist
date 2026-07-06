// "Continue with Google" — a button styled to match the rest of the auth card,
// not Google's default chrome. Google Identity Services (GIS) only lets you
// render ITS own button, so we use the well-known overlay technique: draw our
// own styled button, then render the real (themeable-only) Google button on top
// of it, fully transparent, so it captures the click and still hands us the
// signed `credential` (ID token). The parent POSTs that to /auth/google.
//
// Requires VITE_GOOGLE_CLIENT_ID (same value as the backend GOOGLE_CLIENT_ID).
// When it's missing the component renders nothing so the rest of the form works.
import { useEffect, useRef, useState } from 'react'

const FONT = "'Outfit', sans-serif"
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

// The official multi-colour Google "G".
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function GoogleSignInButton({ onCredential, onError, label = 'Continue with Google' }) {
  const wrapRef = useRef(null)   // the styled button wrapper (sets the width)
  const holderRef = useRef(null) // where GIS renders its real button
  const [width, setWidth] = useState(0)

  // Keep the latest callbacks in refs so the render effect stays keyed on width.
  const cbRef = useRef(onCredential)
  const errRef = useRef(onError)
  useEffect(() => {
    cbRef.current = onCredential
    errRef.current = onError
  })

  // Track the wrapper's width so the (transparent) Google button can match it and
  // capture clicks across the whole button. GIS caps the width at 400px.
  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    const measure = () => setWidth(Math.min(400, Math.round(el.getBoundingClientRect().width)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Render the real Google button once we know the width.
  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn('[GoogleSignInButton] VITE_GOOGLE_CLIENT_ID is not set — Google sign-in is hidden.')
      return
    }
    if (!width) return
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
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width,
        })
      })
      .catch((e) => { if (!cancelled) errRef.current?.(e.message) })
    return () => { cancelled = true }
  }, [width])

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      {/* Visible, site-styled button. Always rendered so it can never silently
          vanish; when Google isn't configured, clicking reports why. When it IS
          configured, the transparent Google button below sits on top and takes
          the click, so this onClick doesn't fire. */}
      <button
        type="button"
        onClick={() => {
          if (!CLIENT_ID) onError?.('Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).')
        }}
        className="w-full rounded-lg py-3 flex items-center justify-center gap-3 font-semibold text-[15px] transition-colors"
        style={{
          fontFamily: FONT,
          color: '#fff',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        <GoogleG />
        {label}
      </button>

      {/* The real Google button, transparent, on top — it takes the click and
          keeps GIS's credential flow. Only mounted when configured. */}
      {CLIENT_ID && (
        <div
          ref={holderRef}
          className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-0"
        />
      )}
    </div>
  )
}

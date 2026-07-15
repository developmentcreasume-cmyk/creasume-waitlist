// "Continue with Google" via Google Identity Services (GIS).
//
// We render GOOGLE'S OWN button (visible), not a custom-styled one behind a
// transparent overlay. That overlay technique was fragile: only the small
// centred Google iframe was actually clickable, so the edges of the visible
// button did nothing and it felt like "the button won't click". Google's real
// button is guaranteed clickable; we theme it (outline, dark-friendly) and size
// it to the card so it blends in.
//
// Requires VITE_GOOGLE_CLIENT_ID (same value as the backend GOOGLE_CLIENT_ID).
// The Google Cloud OAuth client's "Authorized JavaScript origins" MUST include
// the EXACT origin you open the site on — note http://localhost and
// http://127.0.0.1 are DIFFERENT origins to Google, and every deployed domain
// (e.g. https://creasume.com) must be listed too, or the button won't work.
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

export default function GoogleSignInButton({ onCredential, onError, label = 'Continue with Google' }) {
  const wrapRef = useRef(null)   // sets the width GIS renders at
  const holderRef = useRef(null) // where GIS renders its real button
  const [width, setWidth] = useState(0)
  const [rendered, setRendered] = useState(false)

  // Latest callbacks in refs so the render effect can stay keyed on width only.
  const cbRef = useRef(onCredential)
  const errRef = useRef(onError)
  useEffect(() => { cbRef.current = onCredential; errRef.current = onError })

  // Track the wrapper width so the Google button matches the card (GIS caps 400).
  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    const measure = () => setWidth(Math.min(400, Math.max(200, Math.round(el.getBoundingClientRect().width))))
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
          theme: 'filled_black', // blends with the dark auth card
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width,
        })
        // GIS renders asynchronously into an iframe; confirm it actually appeared
        // (a wrong/unauthorised origin renders nothing) so we can show a fallback.
        setTimeout(() => {
          if (cancelled || !holderRef.current) return
          setRendered(holderRef.current.childElementCount > 0)
        }, 400)
      })
      .catch((e) => { if (!cancelled) errRef.current?.(e.message) })
    return () => { cancelled = true }
  }, [width])

  if (!CLIENT_ID) return null

  return (
    <div ref={wrapRef} className="relative w-full flex justify-center select-none">
      {/* Google's real (clickable) button renders here. */}
      <div ref={holderRef} className="flex justify-center" />

      {/* Fallback shown only if GIS didn't render (e.g. this origin isn't in the
          OAuth client's Authorized JavaScript origins). Clicking explains why. */}
      {!rendered && (
        <button
          type="button"
          onClick={() =>
            onError?.(
              'Google sign-in couldn’t load. Make sure this exact site URL is added to your Google OAuth client’s Authorized JavaScript origins.'
            )
          }
          className="absolute inset-0 w-full rounded-full py-3 flex items-center justify-center gap-3 font-semibold text-[15px]"
          style={{ fontFamily: FONT, color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {label}
        </button>
      )}
    </div>
  )
}

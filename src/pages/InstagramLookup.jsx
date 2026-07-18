import { useState } from 'react'
import { goToPath } from '../router.js'

const FONT = "'Outfit', sans-serif"
const USERNAME_RE = /^[a-zA-Z0-9._]{1,30}$/

export default function InstagramLookup() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const clean = username.trim().replace(/^@+/, '')
    if (!USERNAME_RE.test(clean)) {
      setError('Enter a valid Instagram username (letters, numbers, dots, or underscores).')
      return
    }
    goToPath(`/preview?lookup=${encodeURIComponent(clean)}`)
  }

  return (
    <main className="min-h-screen bg-[#050509] text-white px-5 py-12 grid place-items-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(70% 55% at 50% 15%, rgba(105,77,220,.28), transparent 72%)' }} />
      <section className="w-full max-w-2xl relative">
        <a href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-10 no-underline" style={{ fontFamily: FONT }}>
          <span aria-hidden="true">←</span> Back to Creasume
        </a>

        <div className="rounded-[28px] p-6 sm:p-10" style={{ background: 'rgba(20,21,35,.88)', border: '1px solid rgba(255,255,255,.11)', boxShadow: '0 28px 90px rgba(0,0,0,.45)' }}>
          <div className="h-12 w-12 rounded-2xl grid place-items-center mb-6 text-xl font-bold" style={{ background: 'linear-gradient(135deg,#7C5CFF,#E731A2)' }}>@</div>
          <p className="uppercase tracking-[.2em] text-[11px] text-[#B7AEFF] font-semibold mb-3" style={{ fontFamily: FONT }}>Public influence card preview</p>
          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight mb-4" style={{ fontFamily: FONT }}>Turn any Instagram username into an Influence Card.</h1>
          <p className="text-white/58 text-[15px] sm:text-base max-w-xl mb-8" style={{ fontFamily: FONT }}>
            We’ll use publicly available Instagram information. Metrics Instagram does not expose publicly are filled with clearly identified sample data for the preview.
          </p>

          <form onSubmit={submit} noValidate>
            <label htmlFor="instagram-username" className="block text-sm font-semibold mb-2" style={{ fontFamily: FONT }}>Instagram username</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 font-semibold">@</span>
                <input
                  id="instagram-username"
                  value={username}
                  onChange={(event) => { setUsername(event.target.value); setError('') }}
                  placeholder="creator.username"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  className="w-full rounded-xl pl-10 pr-4 py-3.5 bg-black/35 border border-white/15 text-white placeholder:text-white/28 outline-none focus:border-[#9B93E8]"
                  style={{ fontFamily: FONT }}
                />
              </div>
              <button type="submit" className="rounded-xl px-6 py-3.5 font-semibold text-sm text-white hover:brightness-110 transition" style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#6F63DE,#C04DCC)' }}>
                Create Influence Card
              </button>
            </div>
            {error && <p role="alert" className="text-[#FF8A9B] text-sm mt-3" style={{ fontFamily: FONT }}>{error}</p>}
          </form>

          <div className="grid sm:grid-cols-3 gap-3 mt-8">
            {['Public profile details', 'Recent post signals', 'Sample private insights'].map((label, index) => (
              <div key={label} className="rounded-xl px-4 py-3 text-white/55 text-xs" style={{ fontFamily: FONT, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.025)' }}>
                <span className="text-[#AFA7FF] mr-2">0{index + 1}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

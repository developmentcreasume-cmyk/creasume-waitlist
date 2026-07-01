import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SiteNav from '../components/SiteNav.jsx'
import FooterCard from '../components/FooterCard.jsx'

// Standalone "Contact Us" page. Reuses the new site shell — starfield
// background + glassy pill nav (matching Pricing / How it works) — with the
// contact card (info panel + form) and the new 3-column footer from the design.
// The form posts each message to a Google Sheet (Apps Script web app).

const FONT = "'Outfit', sans-serif"
const CONTACT_EMAIL = 'contact@sanatcreatives.com'

const lineInput =
  'contact-field w-full bg-transparent text-white text-[15px] outline-none placeholder:text-white/35 border-b border-white/25 focus:border-white/60 transition-colors pb-2'

export default function ContactUs() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | invalid | error
  const [menuOpen, setMenuOpen] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()
    const message = form.message.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!firstName || !email || !message || !emailOk) {
      setStatus('invalid')
      return
    }

    const endpoint =
      import.meta.env.VITE_CONTACT_SHEET_ENDPOINT || import.meta.env.VITE_SHEET_ENDPOINT
    if (!endpoint) {
      console.error('VITE_CONTACT_SHEET_ENDPOINT (or VITE_SHEET_ENDPOINT) is not set — contact form has no sheet endpoint.')
      setStatus('error')
      return
    }

    setStatus('sending')
    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'contact', firstName, lastName, email, message }),
      })
      setStatus('success')
      setForm({ firstName: '', lastName: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip bg-black text-white">
      <div className="starfield" />

      {/* Decorative accent — top-right corner */}
      <img
        src="/Rectangle%2089.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-0 right-0 z-0 w-[68%] max-w-[880px] h-auto"
      />

      <SiteNav active="contact" />

      {/* ============ HEADER ============ */}
      <section className="relative z-10 px-6 sm:px-12 md:px-20 pt-4 md:pt-8 pb-16 md:pb-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-bold leading-tight"
          style={{ fontFamily: FONT, fontSize: 'clamp(36px, 6vw, 56px)' }}
        >
          Contact Us!
        </motion.h1>
        <p className="mt-0.5 text-white" style={{ fontFamily: FONT, fontSize: 'clamp(20px, 3.2vw, 30px)' }}>
          Any question or remarks? Just write us a message!
        </p>
      </section>

      {/* ============ CARD ============ */}
      <main className="relative z-10 px-6 sm:px-10 md:px-20 lg:px-28 pb-16">
        {/* Blue glow circles behind the card (same palette as the waitlist page) */}
        {[
          { size: 330, top: '-70px', right: '160px' },
          { size: 185, top: '-50px', left: '300px' },
          { size: 307, bottom: '-35px', left: '165px' },
          { size: 128, bottom: '10px', right: '300px' },
          { size: 128, top: '60%', left: '40%', hideMobile: true },
        ].map((c, i) => {
          const { size, hideMobile, ...pos } = c
          return (
            <div
              key={i}
              aria-hidden="true"
              className={`pointer-events-none absolute rounded-full opacity-40 sm:opacity-100 ${hideMobile ? 'hidden sm:block' : ''}`}
              style={{
                ...pos,
                // Cap size to a share of the viewport on phones so the big orbs
                // (330/307px) shrink to subtle corner glows; on wide screens the
                // vw cap is larger than `size`, so desktop keeps its full size.
                width: `min(${size}px, 42vw)`,
                height: `min(${size}px, 42vw)`,
                background: 'radial-gradient(circle, #3C48F7 0%, #212997 45%, #0a0f3a 72%, rgba(0,0,0,0) 100%)',
                zIndex: 0,
              }}
            />
          )
        })}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 mx-auto max-w-5xl rounded-[28px] p-2.5 overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 24px 60px rgba(0,0,0,0.45)',
          }}
        >
          <div className="relative grid grid-cols-1 min-[560px]:grid-cols-[0.85fr_1.15fr] gap-2.5">
            {/* Left — Contact Information panel (frosted glass) */}
            <div
              className="relative overflow-hidden rounded-3xl p-5 sm:p-7 md:p-8"
              style={{
                background: 'linear-gradient(150deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.14)',
                backdropFilter: 'blur(14px) saturate(140%)',
                WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <div className="relative">
                <h2 className="font-medium text-2xl md:text-3xl" style={{ fontFamily: FONT }}>Contact Information</h2>
                <div className="mt-1 flex items-center gap-2 -ml-2">
                  <span className="grid place-items-center shrink-0" style={{ width: 40, height: 40 }}>
                    <svg width="27" height="27" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                      <path d="M22 4H2.01L2 20h20V4zm-2 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </span>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-white text-[17px] font-light no-underline hover:text-white/80 transition-colors" style={{ fontFamily: FONT }}>{CONTACT_EMAIL}</a>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <form onSubmit={handleSubmit} className="relative rounded-3xl p-5 sm:p-7 md:p-9 pb-28 sm:pb-32 md:pb-36" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>First Name</label>
                  <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="" className={lineInput} style={{ fontFamily: FONT }} />
                </div>
                <div>
                  <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Last Name</label>
                  <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="" className={lineInput} style={{ fontFamily: FONT }} />
                </div>
              </div>
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Email</label>
                  <input type="search" name="cf_reply" autoComplete="off" data-lpignore="true" data-1p-ignore="true" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="" className={lineInput} style={{ fontFamily: FONT }} />
                </div>
              </div>
              <div className="mt-7">
                <label className="block text-white text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>Message</label>
                <textarea rows={1} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Write your message.." className={`${lineInput} resize-none [&::placeholder]:!text-white/80`} style={{ fontFamily: FONT }} />
              </div>

              {/* Decorative paper-plane + dashed trail — sits ABOVE the button
                  (mirrored to the left so the trail points toward the button) */}
              <img
                src="/letter.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none absolute right-8 sm:right-16 -bottom-12 z-0 w-[78%] sm:w-[54%] max-w-[320px] sm:max-w-[280px] h-auto"
              />

              <div className="relative z-10 mt-16 md:mt-20 flex items-center justify-end gap-4 flex-wrap">
                {status === 'invalid' && <span className="text-[13px] text-[#FB7185]" style={{ fontFamily: FONT }}>Please fill name, a valid email and a message.</span>}
                {status === 'error' && <span className="text-[13px] text-[#FB7185]" style={{ fontFamily: FONT }}>Something went wrong. Try again.</span>}
                {status === 'success' && <span className="text-[13px] text-[#4DE0B0]" style={{ fontFamily: FONT }}>🎉 Message sent! We'll be in touch.</span>}
                <button type="submit" disabled={status === 'sending'} className="rounded-lg px-7 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#35353b] disabled:opacity-60" style={{ fontFamily: FONT, background: '#2a2a2f', border: '1px solid rgba(255,255,255,0.10)' }}>
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Shared site footer (single source of truth) */}
      <FooterCard />

      {/* Giant CREASUME wordmark at the bottom (same as the shared Footer). */}
      <div className="relative z-10 overflow-hidden -mx-7.5 md:-mx-16 lg:-mx-24 pt-8 md:pt-16 pb-2">
        <h1 className="giant-text text-center select-none whitespace-nowrap">
          CREASUME
        </h1>
      </div>
    </div>
  )
}

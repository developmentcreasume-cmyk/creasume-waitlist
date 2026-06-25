import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FONT } from './influenceData.js'
import { sendInquiry, resolveUsername } from '../../services/influenceApi.js'

const FIELDS = [
  { key: 'brand', placeholder: 'Brand Name', type: 'text', required: true },
  { key: 'agency', placeholder: 'Agency (Optional)', type: 'text', required: false },
  { key: 'email', placeholder: 'Your Professional Email', type: 'email', required: true },
  { key: 'campaignType', placeholder: 'Campaign Type', type: 'text', required: true },
]

export default function WorkWithMe() {
  const [data, setData] = useState({ brand: '', agency: '', email: '', campaignType: '', brief: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  // When the flying plane lands here, swap the button's arrow for the plane image.
  const [landed, setLanded] = useState(false)
  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }

  useEffect(() => {
    const onLanded = () => setLanded(true)
    window.addEventListener('plane-landed', onLanded)
    return () => window.removeEventListener('plane-landed', onLanded)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (sending || sent) return
    // Require the key fields (Agency + Brief are optional) so empty forms can't
    // be submitted, with a friendly inline message.
    if (!data.brand.trim() || !data.email.trim() || !data.campaignType.trim()) {
      setError('Please fill in your brand, email and campaign type.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    // No live creator (no URL username and no env default) → demo confirmation.
    if (!resolveUsername()) {
      setSent(true)
      return
    }
    setSending(true)
    setError('')
    try {
      await sendInquiry(data)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="work-with-me" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-24 md:pt-40 pb-0 overflow-hidden">
      <div className="relative max-w-[1196px] mx-auto">
        {/* Glowing blue orbs tucked around every edge of the card */}
        {[
          { top: '-70px', left: '-55px', size: 170 },
          { top: '-95px', right: '-50px', size: 205 },
          { bottom: '-65px', left: '-45px', size: 185 },
          { bottom: '-75px', right: '-45px', size: 195 },
          { bottom: '-55px', left: '42%', transform: 'translateX(-50%)', size: 150 },
        ].map(({ size, ...pos }, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="hidden md:block absolute rounded-full pointer-events-none select-none"
            style={{
              width: size,
              height: size,
              zIndex: 0,
              background: 'radial-gradient(circle, #3C48F7 0%, #2230C4 52%, #0A1060 100%)',
              boxShadow: '0 0 80px 22px rgba(60,95,255,0.5)',
              filter: 'blur(2px)',
              ...pos,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 rounded-[28px] p-2 md:p-2.5 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-auto lg:h-[667px]"
          style={{
            width: '1196px',
            maxWidth: '100%',
            background: 'rgba(18,18,22,0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 30px 90px rgba(0,0,0,0.55)',
          }}
        >
          <div className="flex flex-col lg:h-full">
            <div
              className="rounded-[22px] pt-10 pb-8 pl-8 pr-8 md:pt-20 md:pb-6 md:pl-12 md:pr-9 lg:h-full flex flex-col justify-start"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h2 className="font-bold leading-none mb-6" style={{ fontFamily: FONT, fontSize: 'clamp(44px, 6vw, 64px)' }}>
                Work With<br />Me.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 200 }}>
                Looking for transparent, data-driven partnerships?<br />Drop your details and I&apos;ll get back to you.
              </p>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="flex flex-col justify-center gap-5 lg:h-full pt-2 pb-8 px-0 lg:pt-8 lg:px-9"
          >
            {FIELDS.map((f) => (
              <input
                key={f.key}
                type={f.type}
                placeholder={f.placeholder}
                required={f.required}
                value={data[f.key]}
                onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                className="rounded-xl px-5 text-white text-base placeholder:text-white placeholder:opacity-100 outline-none focus:border-white/25 transition-colors"
                style={{ ...inputStyle, height: 58 }}
              />
            ))}
            <textarea
              placeholder="Campaign Brief or Goals"
              rows={5}
              value={data.brief}
              onChange={(e) => setData({ ...data, brief: e.target.value })}
              className="rounded-xl px-5 py-4 text-white text-base placeholder:text-white placeholder:opacity-100 outline-none focus:border-white/25 transition-colors resize-none"
              style={inputStyle}
            />
            {error && (
              <p className="text-sm font-medium" style={{ color: '#FF8FB0' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={sending || sent}
              className="mt-2 self-center w-auto px-10 md:px-14 rounded-full text-white font-semibold text-base md:text-xl py-3.5 md:py-5 inline-flex items-center justify-center gap-2 md:gap-3 transition-transform hover:scale-[1.02] disabled:opacity-70"
              style={{ background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)', fontFamily: FONT }}
            >
              {sent ? 'Inquiry Sent ✓' : sending ? 'Sending…' : 'Send Inquiry'}
              {!sent && !sending && (
                // Fixed-size icon slot so swapping the arrow for the plane on
                // landing never changes the button's width.
                <span className="inline-flex items-center justify-center shrink-0" style={{ width: 26, height: 26 }}>
                  {landed ? (
                    <img src="/PLANE.png" alt="" draggable={false} style={{ width: 24, height: 24, objectFit: 'contain', transform: 'rotate(42deg)' }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  )}
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Invite the viewer to make their own influence card. */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 text-center mt-12 md:mt-16 px-4 text-base md:text-lg font-medium"
        style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.72)' }}
      >
        &ldquo;Create a similar influence card for your Instagram profile{' '}
        <a
          href="/#waitlist"
          className="text-white hover:opacity-80 whitespace-nowrap"
        >
          here
        </a>
        &rdquo;
      </motion.p>

      {/* CTA button → home waitlist. Arrow points down, inviting the viewer to
          join below. */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        className="relative z-10 flex justify-center mt-6 md:mt-8"
      >
        <motion.a
          href="/#waitlist"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="no-underline inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold whitespace-nowrap"
          style={{
            fontFamily: FONT,
            fontSize: '17px',
            background: 'linear-gradient(180deg, #5D65DC 0%, #9CA2E1 100%)',
            color: '#0B0B27',
          }}
        >
          Create Your Influence Card
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </motion.div>

      {/* Giant CREASUME wordmark — clip horizontal only so the letters aren't
          cut off at the bottom on mobile. */}
      <div className="relative z-10 overflow-x-clip overflow-y-visible mt-20 md:mt-80 -mx-6 md:-mx-16 lg:-mx-24">
        <h1 className="giant-text text-center select-none whitespace-nowrap">CREASUME</h1>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FONT } from './influenceData.js'

const FIELDS = [
  { key: 'brand', placeholder: 'Brand Name', type: 'text' },
  { key: 'agency', placeholder: 'Agency (Optional)', type: 'text' },
  { key: 'email', placeholder: 'Your Professional Email', type: 'email' },
  { key: 'campaignType', placeholder: 'Campaign Type', type: 'text' },
]

export default function WorkWithMe() {
  const [data, setData] = useState({ brand: '', agency: '', email: '', campaignType: '', brief: '' })
  const [sent, setSent] = useState(false)
  // When the flying plane lands here, swap the button's arrow for the plane image.
  const [landed, setLanded] = useState(false)
  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }

  useEffect(() => {
    const onLanded = () => setLanded(true)
    window.addEventListener('plane-landed', onLanded)
    return () => window.removeEventListener('plane-landed', onLanded)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="work-with-me" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-24 md:pt-40 pb-0 overflow-hidden">
      <div className="relative max-w-[1196px] mx-auto">
        {/* 5 solid blue orbs tucked around the card edges */}
        {[
          { top: '-105px', left: '-25px', width: '186.31px', height: '186.31px' },
          { top: '-150px', right: '-25px', width: '275.86px', height: '275.86px' },
          { bottom: '-75px', left: '-55px', width: '242.64px', height: '225.31px' },
          { bottom: '-75px', right: '-55px', width: '241.2px', height: '241.2px' },
          { bottom: '60px', left: '38%', transform: 'translateX(-50%)' },
        ].map((pos, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none select-none"
            style={{
              width: '128.19px',
              height: '128.18px',
              zIndex: 0,
              background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)',
              boxShadow: '0 0 40px rgba(70,100,255,0.28)',
              ...pos,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 rounded-[28px] p-2 md:p-2.5 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          style={{
            width: '1196px',
            height: '667px',
            maxWidth: '100%',
            background: 'rgba(18,18,22,0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 30px 90px rgba(0,0,0,0.55)',
          }}
        >
          <div className="flex flex-col h-full">
            <div
              className="rounded-[22px] pt-14 pb-5 pl-10 pr-9 md:pt-20 md:pb-6 md:pl-12 h-full flex flex-col justify-start"
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
            className="flex flex-col justify-center gap-5 h-full pt-8 pb-8 px-8 md:px-9"
          >
            {FIELDS.map((f) => (
              <input
                key={f.key}
                type={f.type}
                placeholder={f.placeholder}
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
            <button
              type="submit"
              className="mt-2 w-full rounded-full text-white font-semibold text-xl py-5 inline-flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.02]"
              style={{ background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)', fontFamily: FONT }}
            >
              {sent ? 'Inquiry Sent ✓' : 'Send Inquiry'}
              {!sent && (
                landed ? (
                  // Plane has landed — show the plane image in place of the arrow.
                  <img src="/PLANE.png" alt="" draggable={false} style={{ width: 26, height: 26, objectFit: 'contain', transform: 'rotate(42deg)' }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Giant CREASUME wordmark — clip horizontal only so the letters aren't
          cut off at the bottom on mobile. */}
      <div className="relative z-10 overflow-x-clip overflow-y-visible mt-64 md:mt-80 -mx-6 md:-mx-16 lg:-mx-24">
        <h1 className="giant-text text-center select-none whitespace-nowrap">CREASUME</h1>
      </div>
    </section>
  )
}

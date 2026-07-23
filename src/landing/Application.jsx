import { useState } from 'react'
import { JoinedProof } from '../shared/JoinedProof.jsx'
import { submitWaitlist } from '../services/waitlistApi.js'

// Founding Creator application form. Posts the same way the waitlist form does
// (no-cors POST to the Google Sheet endpoint), with an added phone field.
const inputStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  width: '501.2px',
  maxWidth: '100%',
  padding: '18px 22px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  color: '#FFFFFF',
  border: '1px solid rgba(255, 255, 255, 0.06)',
}

export default function Application() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', handle: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | invalid | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    const name = formData.name.trim()
    const email = formData.email.trim()
    const phone = formData.phone.trim()
    const handle = formData.handle.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!name || !email || !handle || !emailOk) {
      setStatus('invalid')
      return
    }

    setStatus('sending')

    try {
      await submitWaitlist({ name, email, phone, handle })
      setStatus('success')
      setFormData({ name: '', email: '', phone: '', handle: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="apply" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-12 md:pt-20 pb-12 md:pb-24 overflow-hidden">
      {/* Soft colored ellipse around the section */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          top: '-40px', bottom: '-40px', left: '0%', right: '0%',
          background: 'radial-gradient(62% 58% at 50% 50%, rgba(26,33,92,0.38) 0%, rgba(26,33,92,0.38) 52%, rgba(37,49,133,0) 82%)',
          zIndex: 0,
        }}
      />

      <div className="text-center mb-14 md:mb-20 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-2">Founding Creator</h2>
        <span className="text-4xl md:text-5xl font-bold" style={{ color: '#9EA5E2' }}>Application</span>
      </div>

      <div className="relative mx-auto z-10" style={{ width: '610px', maxWidth: '100%' }}>
        {/* Glowing blue circles tucked behind the card corners */}
        {[
          { width: 'clamp(72px, 19vw, 120px)', height: 'clamp(72px, 19vw, 120px)', top: 'clamp(-45px, -4.5vw, -22px)', left: 'clamp(-45px, -4.5vw, -22px)' },
          { width: 'clamp(96px, 26vw, 178px)', height: 'clamp(96px, 26vw, 178px)', top: 'clamp(-55px, -6vw, -26px)', right: 'clamp(-55px, -6vw, -26px)' },
          { width: 'clamp(90px, 24vw, 157px)', height: 'clamp(84px, 22vw, 145px)', bottom: '-8px', left: 'clamp(-58px, -6vw, -26px)' },
          { width: 'clamp(94px, 25vw, 173px)', height: 'clamp(94px, 25vw, 173px)', bottom: 'clamp(-40px, -4.5vw, -20px)', right: 'clamp(-40px, -4.5vw, -20px)' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none select-none"
            style={{
              ...pos,
              zIndex: 0,
              background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)',
              filter: 'blur(0.5px)',
              boxShadow: '0 0 40px rgba(70,100,255,0.28)',
            }}
          />
        ))}

        <form
          onSubmit={handleSubmit}
          className="waitlist-form rounded-[28px] mx-auto relative"
          style={{
            minHeight: '440px',
            padding: 'clamp(28px, 6vw, 44px) clamp(20px, 4vw, 28px)',
            zIndex: 1,
            background: 'rgba(18, 18, 22, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 30px 90px rgba(0, 0, 0, 0.55)',
          }}
        >
          <div className="space-y-5">
            <input type="text" required placeholder="Your full name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-[14px] outline-none mx-auto block w-full transition-colors focus:border-white/20 placeholder:text-white/45"
              style={inputStyle} />
            <input type="email" required placeholder="Email address" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-[14px] outline-none mx-auto block w-full transition-colors focus:border-white/20 placeholder:text-white/45"
              style={inputStyle} />
            <input type="tel" placeholder="Phone Number" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="rounded-[14px] outline-none mx-auto block w-full transition-colors focus:border-white/20 placeholder:text-white/45"
              style={inputStyle} />
            <input type="text" required placeholder="Instagram username (e.g. @yourhandle)" value={formData.handle}
              onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
              className="rounded-[14px] outline-none mx-auto block w-full transition-colors focus:border-white/20 placeholder:text-white/45"
              style={inputStyle} />

            <button
              type="submit"
              disabled={status === 'sending'}
              className="gradient-btn rounded-[14px] text-white transition-all hover:scale-[1.015] mx-auto block w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                width: '501.2px', maxWidth: '100%', padding: '19px 22px',
                fontFamily: "'Gelion', 'Outfit', sans-serif", fontWeight: 700, fontSize: '19px', marginTop: '28px',
                boxShadow: '0 12px 30px rgba(168, 85, 247, 0.35), 0 6px 18px rgba(236, 72, 153, 0.3)',
              }}
            >
              {status === 'sending' ? 'Submitting…' : 'Become a Founding Creator'}
            </button>

            {status === 'success' && (
              <p className="text-center mt-4 text-base text-white relative z-10">🎉 You're in! We'll be in touch soon.</p>
            )}
            {status === 'invalid' && (
              <p className="text-center mt-4 text-base text-[#F22997] relative z-10">Please fill in your name, a valid email, and Instagram handle.</p>
            )}
            {status === 'error' && (
              <p className="text-center mt-4 text-base text-[#F22997] relative z-10">Something went wrong. Please try again.</p>
            )}

            <JoinedProof />
          </div>
        </form>
      </div>
    </section>
  )
}

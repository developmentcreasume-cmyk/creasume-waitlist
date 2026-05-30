import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    handle: '',
  })
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      await fetch(import.meta.env.VITE_SHEET_ENDPOINT, {
        method: 'POST',
        // text/plain avoids the CORS preflight that Apps Script web apps don't answer.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData),
      })
      setStatus('success')
      setFormData({ name: '', email: '', handle: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Starfield */}
      <div className="starfield" />

      {/* Top wide lavender halo (from-above glow) */}
      <div className="top-halo" />

      {/* Hero decorative orb image */}
      <img
        src="/image/Group%201707480435.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '-500px',
          right: '0px',
          left: '0px',
          width: '100%',
          height: 'auto',
          zIndex: 0,
          opacity: 0.85,
          clipPath: 'inset(25% 0 0 0)',
        }}
      />

      {/* Global animated glow orbs — positioned to match the reference design */}
      {/* Right side — around the Three Steps section */}
      <div
        className="glow-orb delay-2"
        style={{ width: 500, height: 500, top: 3700, right: -200, background: '#253185', '--orb-opacity': 0.45 }}
      />
      {/* Right side — around the Founding Creator perks */}
      <div
        className="glow-orb delay-3"
        style={{ width: 550, height: 550, top: 5000, right: -200, background: '#2116B9', '--orb-opacity': 0.4 }}
      />


      {/* ============ NAVIGATION ============ */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 py-6">
        <div className="flex items-center gap-2">
          <img src="/creasumelogo.png" alt="Creasume" className="h-12 md:h-14 w-auto" />
        </div>
        <div
          className="hidden md:flex items-center justify-between px-1 rounded-full bg-[#020423] backdrop-blur-sm ml-auto"
          style={{ width: '324px', height: '52px' }}
        >
          {[
            { id: 'home', label: 'Home', href: '#home' },
            { id: 'waitlist', label: 'Waitlist', href: '#waitlist' },
            { id: 'signout', label: 'Sign Out', href: '#signout' },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <a
                key={tab.id}
                href={tab.href}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center h-[42px] rounded-full font-medium transition ${
                  isActive ? 'text-white px-6' : 'text-[#9EA5E2] hover:text-white px-3'
                }`}
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  backgroundColor: isActive ? 'rgba(34, 39, 114, 0.53)' : 'transparent',
                }}
              >
                {tab.label}
              </a>
            )
          })}
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pt-12 pb-24">
        {/* Two separate badge pills */}
        <div className="flex flex-wrap items-center gap-9 mb-10">
          <div
            className="inline-flex items-center justify-center rounded-full border backdrop-blur-sm px-6"
            style={{
              height: '40px',
              backgroundColor: 'rgba(125, 113, 201, 0.09)',
              borderColor: 'rgba(255, 255, 255, 0.43)',
            }}
          >
            <span
              style={{
                fontFamily: "'Gelion', 'Outfit', sans-serif",
                color: '#FFFFFF',
                letterSpacing: '0.1em',
                lineHeight: '0.976',
                fontSize: '15.68px',
                fontWeight: 300,
              }}
            >
              VERIFIED CREATOR IDENTITY PLATFORM
            </span>
          </div>

          <div
            className="inline-flex items-center justify-center gap-3 rounded-full bg-white"
            style={{ width: '244.95px', height: '35.46px' }}
          >
            <img
              src="/Group%201707480613.png"
              alt="Creasume"
              style={{ width: '96px', height: '26px', objectFit: 'contain' }}
            />
            <span className="text-[#9EA5E2] text-sm">×</span>
            <img
              src="/image%202%20(1).png"
              alt="Meta"
              style={{ width: '74.67px', height: '21px', objectFit: 'contain' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1
              className="mb-6"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontStyle: 'normal',
                fontWeight: 600,
                fontSize: '102.329px',
                lineHeight: '97.63%',
                width: '747px',
                maxWidth: '100%',
              }}
            >
              Your Influence<br />
              <span className="gradient-text">Structured &</span><br />
              <span className="gradient-text">Verified.</span>
            </h1>
            <p className="text-[#9EA5E2] text-base md:text-lg max-w-md mb-10 leading-relaxed">
              Turn your social presence into a professional creator identity that brands trust and opportunities find.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                className="gradient-btn rounded-full text-white transition-all hover:scale-105 flex items-center justify-center"
                style={{
                  width: '417px',
                  height: '59px',
                  fontWeight: 600,
                  fontSize: '22px',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                }}
              >
                Become A Founding Creator
              </button>
              <button
                className="rounded-full border border-[#36377A] bg-[#0B0B27]/40 hover:bg-[#10133C] transition text-white flex items-center justify-center px-7"
                style={{
                  height: '59px',
                  fontWeight: 600,
                  fontSize: '22px',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                }}
              >
                Explore Vision
              </button>
            </div>
          </div>

          {/* Sample Creator card */}
          <div className="relative flex justify-center lg:justify-end lg:pr-56">
            <img
              src="/image/blurimage.png"
              alt="Sample Creator Profile"
              className="w-full max-w-md rounded-2xl shadow-2xl shadow-[#2116B9]/30"
            />
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pb-24 flex justify-center">
        <div
          className="rounded-2xl px-8 grid grid-cols-2 md:grid-cols-4 gap-6 items-center"
          style={{
            width: '1070.05px',
            maxWidth: '100%',
            height: '129.24px',
            backgroundColor: 'rgba(16, 31, 70, 0.59)',
          }}
        >
          {[
            { title: 'Dynamic', sub: 'PROFESSIONAL LINK' },
            { title: '$250 Billion', sub: 'CREATOR ECONOMY' },
            { title: 'Early Access', sub: 'FOUNDING CREATORS' },
            { title: 'Verified', sub: 'CREATOR PROFILES' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center relative">
              {idx !== 0 && (
                <span
                  className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2"
                  style={{ width: '1px', height: '100%', backgroundColor: 'rgba(54, 55, 122, 0.5)' }}
                />
              )}
              <div
                className="mb-1"
                style={{
                  color: '#FFFFFF',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '33.26px',
                  lineHeight: '97.6%',
                }}
              >
                {stat.title}
              </div>
              <div
                className="text-[10px] tracking-[0.2em] font-medium"
                style={{
                  background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ BUILT FOR EMERGING CREATORS ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 py-24">
        <div className="glow-orb" style={{ width: 400, height: 400, top: 100, right: -100, background: '#2116B9', opacity: 0.15 }} />

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif" }}>
            Built for{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #5D65DC 0%, #9CA2E1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Emerging Creators.
            </span>
          </h2>
          <p className="text-white max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8">
            Content creators have become one of the most powerful marketing channels for modern brands.
            But most emerging creators still lack the professional identity needed to position themselves effectively.
          </p>
          <p className="text-white font-semibold max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-6">
            No media kit. No credibility layer. No way to show brands why they matter.
          </p>
          <p className="text-white max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Creasume changes that.<br />
            Build credibility, improve discoverability, and become<br />
            <span
              className="font-medium"
              style={{
                background: 'linear-gradient(90deg, #5D65DC 0%, #9CA2E1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              brand-ready from day one
            </span>{' '}
            without needing agencies or management teams.
          </p>
        </div>

        <div
          className="rounded-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{
            width: '858.21px',
            maxWidth: '100%',
            height: '428px',
            background:
              'linear-gradient(90deg, rgba(16, 31, 70, 0.84) 0%, rgba(0, 9, 32, 0.72) 100%)',
            border: '1px solid rgba(54, 55, 122, 0.4)',
          }}
        >
          {[
            {
              icon: <img src="/Icon%20MK%201.png" alt="Smart Media Kits" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
              title: (<>Smart Media<br />Kits</>),
              desc: 'Auto-generated, brand-ready kits that showcase your reach exactly the way brands want to see it.',
            },
            {
              icon: <img src="/Icon%20ID%201.png" alt="Creator Profiles" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
              title: (<>Creator<br />Profiles</>),
              desc: 'One verified identity page that replaces scattered links with a single credible presence.',
            },
            {
              icon: <img src="/Vector%20(2).png" alt="Brand Inquiries" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
              title: (<>Brand<br />Inquiries</>),
              desc: 'Structured collaboration requests no DM chaos, no back and forth with brands.',
            },
            {
              icon: <img src="/Vector%20(3).png" alt="Stronger Positioning" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
              title: (<>Stronger<br />Positioning</>),
              desc: 'Get discovered. Stand out in front of brands actively looking for creators like you.',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="relative p-8 flex flex-col"
              style={idx !== 0 ? { borderLeft: '1px solid rgba(54, 55, 122, 0.4)' } : {}}
            >
              <div className="mb-8">{card.icon}</div>
              <div
                className="mb-8 rounded-full"
                style={{
                  width: '32px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
                }}
              />
              <h3
                className="mb-6 text-white leading-tight"
                style={{
                  width: '165.46px',
                  height: '52.95px',
                  fontWeight: 500,
                  fontSize: '24.27px',
                }}
              >
                {card.title}
              </h3>
              <p
                className="text-[#9EA5E2]"
                style={{
                  fontWeight: 400,
                  fontSize: '14.34px',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  lineHeight: '120%',
                }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ MADE FOR NEXT GENERATION ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 py-24">
        <div className="text-center mb-16">
          <h2
            className="font-bold mb-6"
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: '48px',
              lineHeight: '110%',
              color: '#FFFFFF',
            }}
          >
            Made for the{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #5D65DC 0%, #9CA2E1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              next generation<br />of creators.
            </span>
          </h2>
          <p className="text-white max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Everything you need to present your influence professionally<br />
            and get discovered by the right brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="iconGrad1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5D65DC" />
                      <stop offset="100%" stopColor="#9CA2E1" />
                    </linearGradient>
                  </defs>
                  <rect x="3" y="13" width="4" height="8" stroke="url(#iconGrad1)" strokeWidth="1.5" />
                  <rect x="10" y="8" width="4" height="13" stroke="url(#iconGrad1)" strokeWidth="1.5" />
                  <rect x="17" y="3" width="4" height="18" stroke="url(#iconGrad1)" strokeWidth="1.5" />
                </svg>
              ),
              title: 'Data-Driven Credibility',
              desc: 'Your follower count, engagement rate, and reach update automatically. No more manual screenshots.',
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="iconGrad2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5D65DC" />
                      <stop offset="100%" stopColor="#9CA2E1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 3a9 9 0 109 9h-9V3z"
                    stroke="url(#iconGrad2)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="M14 3a7 7 0 017 7h-7V3z" stroke="url(#iconGrad2)" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              ),
              title: 'Creator Wrapped & Portfolios',
              desc: 'Beautiful animated stat cards and structured brand collaboration histories that make brands stop scrolling.',
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="iconGrad3" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5D65DC" />
                      <stop offset="100%" stopColor="#9CA2E1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                    stroke="url(#iconGrad3)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                    stroke="url(#iconGrad3)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ),
              title: 'One Professional Link',
              desc: 'Share creasume.com/you instead of multiple files. Works flawlessly in brand emails, DMs, and LinkedIn.',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-8 transition-all"
              style={{
                background:
                  'linear-gradient(180deg, rgba(16, 31, 70, 0.84) 0%, rgba(0, 9, 32, 0.72) 100%)',
                border: '1px solid rgba(54, 55, 122, 0.4)',
                minHeight: '280px',
              }}
            >
              <div className="mb-8">{card.icon}</div>
              <h3
                className="mb-4 text-white"
                style={{
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  fontWeight: 500,
                  fontSize: '20px',
                  lineHeight: '110%',
                }}
              >
                {card.title}
              </h3>
              <p
                className="text-[#9EA5E2]"
                style={{
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  fontWeight: 400,
                  fontSize: '14.34px',
                  lineHeight: '120%',
                }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ THREE STEPS ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 py-24 overflow-hidden">
        <img
          src="/image/Group%2039850.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none left-1/2 -translate-x-1/2"
          style={{
            top: '-100px',
            width: '120%',
            maxWidth: 'none',
            height: 'auto',
            opacity: 0.7,
            zIndex: 0,
          }}
        />

        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: '#FFFFFF' }}>
            Three steps to your<br />
            <span className="gradient-text">verified creator identity</span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 relative">
            {/* Horizontal connecting line */}
            <div className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] step-line" />

            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#9CA2E1" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" stroke="#9CA2E1" strokeWidth="1.5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="#9CA2E1" />
                  </svg>
                ),
                title: 'Connect Instagram',
                desc: 'Securely link your Instagram or YouTube to pull live data.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#9CA2E1" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="#9CA2E1" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="#9CA2E1" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Auto-Generate Identity',
                desc: 'Creasume pulls your stats into a structured, beautiful portfolio.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#9CA2E1" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#9CA2E1" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Share With Brands',
                desc: 'Send your verifiable link to close deals faster and look professional.',
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center relative">
                <div className="w-14 h-14 rounded-full bg-[#0B0B27] border border-[#36377A] flex items-center justify-center mx-auto mb-5 relative z-10">
                  {step.icon}
                </div>
                <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
                <p className="text-xs text-[#9EA5E2] leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-lg text-white mb-4">
              <span className="inline-block w-3 h-3 rounded-full border border-[#5D65DC] mr-2 align-middle" />
              Your consent matters to us
            </p>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white mb-5">
              <img src="/Group%201707480613.png" alt="Creasume" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
              <span className="text-[#9EA5E2] text-sm">×</span>
              <img src="/image/image%204.png" alt="Instagram" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <p className="text-lg text-white max-w-2xl mx-auto">
              We fetch your verified statistics with your consent directly through Instagram permissions.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FOUNDING CREATOR PERKS ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 py-24">
        <div className="text-center mb-16">
          <h2
            className="font-bold mb-6"
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              fontSize: '48px',
              lineHeight: '110%',
            }}
          >
            Become a<br />
            <span className="gradient-text" style={{ fontStyle: 'italic' }}>Founding Creator</span>
          </h2>
          <p
            className="text-[#9EA5E2]"
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              fontSize: '20px',
            }}
          >
            Unlock the following perks and benifits
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="perkGrad1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#5D65DC" />
                        <stop offset="100%" stopColor="#9CA2E1" />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="9" stroke="url(#perkGrad1)" strokeWidth="1.5" />
                    <path d="M9 12L11 14L15 10" stroke="url(#perkGrad1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Early Access to Creasume',
              },
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="perkGrad2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#5D65DC" />
                        <stop offset="100%" stopColor="#9CA2E1" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2L15 8L21 9L17 14L18 21L12 18L6 21L7 14L3 9L9 8L12 2Z" stroke="url(#perkGrad2)" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Exclusive Founding Creator Badge',
              },
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="perkGrad3" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#5D65DC" />
                        <stop offset="100%" stopColor="#9CA2E1" />
                      </linearGradient>
                    </defs>
                    <path d="M7 11L12 6L17 11M7 17L12 12L17 17" stroke="url(#perkGrad3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Lifetime Access to Premium Version',
              },
            ].map((perk, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  minHeight: '240px',
                  backgroundColor: '#000000',
                  border: '1px solid rgba(54, 55, 122, 0.35)',
                }}
              >
                <img
                  src="/image/shape.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  style={{ opacity: 0.5 }}
                />
                <div className="mb-6 relative z-10">{perk.icon}</div>
                <h3
                  className="text-white leading-tight max-w-[180px] relative z-10"
                  style={{
                    fontFamily: "'Gelion', 'Outfit', sans-serif",
                    fontWeight: 500,
                    fontSize: '20px',
                  }}
                >
                  {perk.title}
                </h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[calc(66.666%+12px)] mx-auto">
            {[
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="perkGrad4" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#5D65DC" />
                        <stop offset="100%" stopColor="#9CA2E1" />
                      </linearGradient>
                    </defs>
                    <path d="M4 6H20M4 10H20M4 14H14" stroke="url(#perkGrad4)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Priority listing to brands',
              },
              {
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="perkGrad5" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#5D65DC" />
                        <stop offset="100%" stopColor="#9CA2E1" />
                      </linearGradient>
                    </defs>
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="url(#perkGrad5)" strokeWidth="1.5" />
                    <rect x="7" y="9" width="4" height="3" stroke="url(#perkGrad5)" strokeWidth="1" />
                    <path d="M14 10H17M14 12H16" stroke="url(#perkGrad5)" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Chance to work with us as a partner and get paid',
              },
            ].map((perk, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  minHeight: '240px',
                  backgroundColor: '#000000',
                  border: '1px solid rgba(54, 55, 122, 0.35)',
                }}
              >
                <img
                  src="/image/shape.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  style={{ opacity: 0.5 }}
                />
                <div className="mb-6 relative z-10">{perk.icon}</div>
                <h3
                  className="text-white leading-tight max-w-[220px] relative z-10"
                  style={{
                    fontFamily: "'Gelion', 'Outfit', sans-serif",
                    fontWeight: 500,
                    fontSize: '20px',
                  }}
                >
                  {perk.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ RESERVE YOUR IDENTITY ============ */}
      <section id="waitlist" className="relative z-10 px-6 md:px-16 lg:px-24 py-24">

        <div className="text-center mb-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Reserve your<br />
            <span className="gradient-text">creator identity</span>
          </h2>
          <p className="text-[#9EA5E2] text-sm md:text-base">
            Be among the first creators to own a verified professional identity.<br />
            Limited spots in our founding cohort.
          </p>
        </div>

        <div className="relative mx-auto z-10" style={{ width: '697.37px', maxWidth: '100%' }}>
          {/* Four blue corner orbs around the form */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '260px',
              height: '260px',
              top: '-90px',
              left: '-90px',
              background: 'radial-gradient(circle at 50% 50%, #2628A8 0%, #1B1FA1 55%, rgba(27, 31, 161, 0) 80%)',
              filter: 'blur(10px)',
              zIndex: -1,
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '260px',
              height: '260px',
              top: '-90px',
              right: '-90px',
              background: 'radial-gradient(circle at 50% 50%, #2628A8 0%, #1B1FA1 55%, rgba(27, 31, 161, 0) 80%)',
              filter: 'blur(10px)',
              zIndex: -1,
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '260px',
              height: '260px',
              bottom: '-90px',
              left: '-90px',
              background: 'radial-gradient(circle at 50% 50%, #2628A8 0%, #1B1FA1 55%, rgba(27, 31, 161, 0) 80%)',
              filter: 'blur(10px)',
              zIndex: -1,
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '260px',
              height: '260px',
              bottom: '-90px',
              right: '-90px',
              background: 'radial-gradient(circle at 50% 50%, #2628A8 0%, #1B1FA1 55%, rgba(27, 31, 161, 0) 80%)',
              filter: 'blur(10px)',
              zIndex: -1,
            }}
          />

          <form
            onSubmit={handleSubmit}
            className="rounded-[30.64px] mx-auto relative"
            style={{
              height: '520px',
              padding: '60px',
              background:
                'linear-gradient(135deg, rgba(46, 46, 46, 0.75) 0%, rgba(21, 21, 21, 0.82) 45%, rgba(16, 16, 16, 0.88) 75%, rgba(38, 50, 168, 0.35) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '2px solid rgba(255, 255, 255, 0.45)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 30px 80px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="space-y-8">
              <input
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-2xl outline-none mx-auto block"
                style={{
                  backgroundColor: '#000000',
                  width: '501.2px',
                  maxWidth: '100%',
                  height: '60px',
                  padding: '0 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '20px',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-2xl outline-none mx-auto block"
                style={{
                  backgroundColor: '#000000',
                  width: '501.2px',
                  maxWidth: '100%',
                  height: '60px',
                  padding: '0 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '20px',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />
              <input
                type="text"
                placeholder="Instagram username (e.g. @yourhandle)"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className="rounded-2xl outline-none mx-auto block"
                style={{
                  backgroundColor: '#000000',
                  width: '501.2px',
                  maxWidth: '100%',
                  height: '60px',
                  padding: '0 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '20px',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="gradient-btn rounded-full text-white transition-all hover:scale-[1.02] mx-auto block disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  width: '501.2px',
                  maxWidth: '100%',
                  height: '60px',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '24px',
                  marginTop: '40px',
                }}
              >
                {status === 'sending' ? 'Joining…' : 'Join the Waitlist'}
              </button>

              {status === 'success' && (
                <p className="text-center mt-4 text-base text-white relative z-10">
                  🎉 You're on the waitlist! We'll be in touch.
                </p>
              )}
              {status === 'error' && (
                <p className="text-center mt-4 text-base text-[#F22997] relative z-10">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="text-center mt-48 relative z-10">
          <p
            className="mb-7"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '25px',
              color: '#FFFFFF',
              lineHeight: '97.6%',
            }}
          >
            <img src="/Vector%20(5).png" alt="" className="inline-block mr-2 align-middle" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            Security of your data is our utmost priority
          </p>
          <div
            className="inline-flex items-center justify-center gap-4 rounded-full bg-white mb-10"
            style={{ width: '340px', height: '50px' }}
          >
            <img
              src="/Group%201707480613.png"
              alt="Creasume"
              style={{ width: '135px', height: '37px', objectFit: 'contain' }}
            />
            <span className="text-[#9EA5E2] text-base">×</span>
            <img
              src="/image%202%20(1).png"
              alt="Meta"
              style={{ width: '105px', height: '30px', objectFit: 'contain' }}
            />
          </div>
          <p
            className="mx-auto"
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              fontWeight: 300,
              fontSize: '22px',
              width: '989px',
              maxWidth: '100%',
              color: '#FFFFFF',
              lineHeight: '97.6%',
            }}
          >
            Your data is secure and provided directly by Meta APIs. Creasume is a Meta-verified business with view-only
            access to your profile statistics. No third party or even us can access your personal data.
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 px-6 md:px-16 lg:px-24 pt-16 pb-8 border-t border-[#36377A]/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div>
            <h4 className="font-semibold text-2xl mb-6">Creasume</h4>
            <ul className="space-y-4 text-lg text-[#9EA5E2]">
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#" className="hover:text-white transition">Vision</a></li>
              <li><a href="#" className="hover:text-white transition">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition">Join the Waitlist</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-2xl mb-6">Follow us</h4>
            <ul className="space-y-4 text-lg text-[#9EA5E2]">
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition">X</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-2xl mb-6">Contact Us</h4>
            <ul className="space-y-4 text-lg text-[#9EA5E2]">
              <li><a href="mailto:support@creasume.com" className="hover:text-white transition">support@creasume.com</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-2xl mb-6">Work with Us</h4>
            <ul className="space-y-4 text-lg text-[#9EA5E2]">
              <li><a href="mailto:partnerships@creasume.com" className="hover:text-white transition">partnerships@creasume.com</a></li>
            </ul>
          </div>
        </div>

        <div className="text-right text-base text-[#9EA5E2]/60 mb-8">
          © 2026 Creasume. All rights reserved.
        </div>

        {/* Giant CREASUME text */}
        <div className="overflow-hidden -mb-8">
          <h1 className="giant-text text-center select-none whitespace-nowrap">
            CREASUME
          </h1>
        </div>
      </footer>
    </div>
  )
}

export default App

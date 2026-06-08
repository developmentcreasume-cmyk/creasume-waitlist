import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// Animated "live demo" that plays inside the hero browser chrome.
// Flow: connect -> syncing -> profile -> share -> (Replay) -> connect.
const MONO = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace"

// ---- Shared screen wrapper: cross-fades each step in the same fixed box ----
function Screen({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8"
    >
      {children}
    </motion.div>
  )
}

// ---- Step 1: Connect Instagram ----
function ConnectScreen({ onConnect }) {
  return (
    <Screen>
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{
          width: 70,
          height: 70,
          background: 'linear-gradient(135deg, #363C98 0%, #5D65DC 100%)',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" stroke="none" />
        </svg>
      </div>
      <h3 className="text-white font-bold text-[26px] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Connect Instagram
      </h3>
      <p className="text-white/55 text-[15px] mb-7 text-center">
        Generate your live influence card in seconds.
      </p>
      <button
        onClick={onConnect}
        className="w-full rounded-xl text-white font-semibold text-[16px] transition-transform hover:scale-[1.02]"
        style={{
          height: 56,
          fontFamily: "'Outfit', sans-serif",
          background: 'linear-gradient(90deg, #363C98 0%, #5D65DC 100%)',
        }}
      >
        Connect Account
      </button>
    </Screen>
  )
}

// ---- Step 2: Syncing loader ----
function SyncingScreen() {
  return (
    <Screen>
      <motion.div
        className="rounded-full mb-5"
        style={{
          width: 44,
          height: 44,
          border: '3px solid rgba(93,101,220,0.2)',
          borderTopColor: '#6068DC',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
      />
      <p className="text-brand-purple text-[14px] tracking-wide" style={{ fontFamily: MONO }}>
        Syncing Insights...
      </p>
    </Screen>
  )
}

// ---- Step 3: Profile / analytics card ----
function StatBox({ value, label, color }) {
  return (
    <div
      className="flex-1 rounded-xl px-4 py-3 text-center"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="font-bold text-[20px]" style={{ color }}>{value}</div>
      <div className="text-white/45 text-[12px]" style={{ fontFamily: MONO }}>{label}</div>
    </div>
  )
}

function AnalyticsBar({ value, label, tint }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{ background: `linear-gradient(90deg, ${tint} 0%, rgba(255,255,255,0.02) 100%)`, border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="text-white font-bold text-[22px] leading-none mb-1">{value}</div>
      <div className="text-white/45 text-[12px]" style={{ fontFamily: MONO }}>{label}</div>
    </div>
  )
}

function ProfileScreen() {
  return (
    <Screen>
      <div className="w-full flex flex-col items-center">
        <div
          className="rounded-full mb-3"
          style={{
            width: 76,
            height: 76,
            padding: 3,
            background: 'linear-gradient(135deg, #5D65DC, #9CA2E1, #6068DC)',
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{ background: 'radial-gradient(circle at 50% 35%, #9aa0a6 0%, #4a4d52 70%)' }}
          />
        </div>
        <h3 className="text-white font-bold text-[24px] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Priya Sharma
        </h3>
        <p className="text-white/50 text-[13px] mb-5" style={{ fontFamily: MONO }}>
          @priya.creates · Lifestyle
        </p>

        <div className="w-full flex gap-3 mb-5">
          <StatBox value="125K" label="Followers" color="#9CA2E1" />
          <StatBox value="4.2%" label="Engagement" color="#6068DC" />
        </div>

        <div className="w-full text-left text-[#3FD3A0] text-[12px] tracking-wide mb-2" style={{ fontFamily: MONO }}>
          ✦ ANALYTICS
        </div>
        <div className="w-full flex flex-col gap-3">
          <AnalyticsBar value="45.2K" label="Avg. Reach" tint="rgba(34,90,68,0.55)" />
          <AnalyticsBar value="8.4M" label="Total Impressions" tint="rgba(90,46,46,0.55)" />
        </div>
      </div>
    </Screen>
  )
}

// ---- Step 4: Share & get paid ----
function ShareScreen({ onReplay }) {
  return (
    <Screen>
      <div className="relative w-full flex flex-col items-center">
        {/* glow behind the toast */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '90%',
            height: 150,
            background: 'radial-gradient(closest-side, rgba(93,101,220,0.4), rgba(156,162,225,0.15), transparent)',
            filter: 'blur(8px)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full rounded-2xl px-5 py-4 mb-7 text-center"
          style={{ backgroundColor: 'rgba(20,20,26,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="mx-auto mb-2 flex items-center justify-center rounded-full"
            style={{ width: 34, height: 34, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.5)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <div className="text-white font-semibold text-[15px]">New Brand Inquiry!</div>
          <div className="text-white/50 text-[13px]">Lumina Cosmetics sent a request</div>
        </motion.div>

        <h3 className="text-white font-bold text-[27px] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Share &amp; Get Paid
        </h3>
        <p className="text-white/55 text-[14px] mb-6 text-center">
          Impress brands with verified stats.
        </p>
        <button
          onClick={onReplay}
          className="rounded-full text-white/85 text-[13px] px-6 py-2.5 transition-colors hover:bg-white/10"
          style={{ fontFamily: MONO, border: '1px solid rgba(255,255,255,0.2)' }}
        >
          Replay Demo
        </button>
      </div>
    </Screen>
  )
}

const STEPS = { CONNECT: 0, SYNCING: 1, PROFILE: 2, SHARE: 3 }

export default function LiveDemoCard() {
  const [step, setStep] = useState(STEPS.CONNECT)
  const reduceMotion = useReducedMotion()

  // Auto-advance through the timed steps; user drives connect & replay.
  useEffect(() => {
    if (step === STEPS.SYNCING) {
      const t = setTimeout(() => setStep(STEPS.PROFILE), 2200)
      return () => clearTimeout(t)
    }
    if (step === STEPS.PROFILE) {
      const t = setTimeout(() => setStep(STEPS.SHARE), 3200)
      return () => clearTimeout(t)
    }
  }, [step])

  return (
    <div
      className="relative w-full rounded-b-xl overflow-hidden"
      style={{
        height: 520,
        background: 'radial-gradient(120% 90% at 50% 0%, #141019 0%, #0A0A0E 60%, #08080B 100%)',
      }}
    >
      <AnimatePresence mode="wait">
        {step === STEPS.CONNECT && (
          <ConnectScreen key="connect" onConnect={() => setStep(reduceMotion ? STEPS.PROFILE : STEPS.SYNCING)} />
        )}
        {step === STEPS.SYNCING && <SyncingScreen key="syncing" />}
        {step === STEPS.PROFILE && <ProfileScreen key="profile" />}
        {step === STEPS.SHARE && <ShareScreen key="share" onReplay={() => setStep(STEPS.CONNECT)} />}
      </AnimatePresence>
    </div>
  )
}

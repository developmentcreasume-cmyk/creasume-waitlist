// Influence Dashboard — the creator-facing control center (distinct from the
// public Influence Card at /<username>). Lives at /<username>/dashboard and is
// gated behind the Instagram login (JWT). All numbers are LIVE:
//   • display stats / posts / platforms / Creasume score  → GET /public/:username
//   • score breakdown + inquiry counts                    → GET /creator/dashboard-stats
//   • account (name / email / socials)                    → GET /creator/me
//   • recent brand inquiries                              → GET /inquiry/my-inquiries
// Edits made in "Edit Profile" write through to the same models the card reads,
// so changes show up on the live card.
import { useState, useEffect, useCallback, useRef, forwardRef } from 'react'
import { FONT, MONO } from '../influence/influenceData.js'
import { goToPath } from '../../router.js'
import EditProfileView from './EditProfileView.jsx'
import DashboardTour from './DashboardTour.jsx'
import {
  fetchPublic,
  fetchMe,
  fetchDashboardStats,
  fetchMyInquiries,
  updateProfile,
  deleteAccount,
  ensureDevToken,
  isLoggedIn,
  loginUrl,
  facebookLoginUrl,
  clearAuth,
  setStoredUsername,
  inquiriesPath,
  inquiryDetailPath,
  mapInquiry,
  formatCount,
  shortenLocation,
} from '../../services/dashboardApi.js'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { key: 'edit', label: 'Edit Profile', icon: 'user' },
  { key: 'settings', label: 'Settings', icon: 'gear' },
]

// ---- Icons (inherit stroke colour) ----
const ic = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  followers: (<svg {...ic}><circle cx="9" cy="8" r="3" /><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 3.5a3 3 0 0 1 0 5.8M21 19c0-2.3-1.3-4-3.5-4.7" /></svg>),
  eye: (<svg {...ic}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>),
  camera: (<svg {...ic}><path d="M3 8h3l1.5-2h9L18 8h3v11H3Z" /><circle cx="12" cy="13" r="3.2" /></svg>),
  chart: (<svg {...ic}><path d="M4 19V5M4 19h16" /><path d="m7 14 3-3 3 3 5-6" /></svg>),
  inbox: (<svg {...ic}><path d="M4 13h4l1.5 2.5h5L16 13h4" /><path d="M5 5h14l2 8v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z" /></svg>),
  grid: (<svg {...ic}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
  user: (<svg {...ic}><circle cx="12" cy="8" r="3.2" /><path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" /></svg>),
  gear: (<svg {...ic}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.8 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.4H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 6.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8Z" /></svg>),
  igMark: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" /></svg>),
  refresh: (<svg {...ic} width="14" height="14"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v4h-4" /></svg>),
  external: (<svg {...ic} width="14" height="14"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>),
  logout: (<svg {...ic}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>),
  copy: (<svg {...ic} width="18" height="18"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>),
  check: (<svg {...ic} width="18" height="18"><path d="M20 6 9 17l-5-5" /></svg>),
  shield: (<svg {...ic}><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>),
  card: (<svg {...ic}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>),
  bell: (<svg {...ic}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>),
  alert: (<svg {...ic}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>),
  fbMark: (<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.46-.13-2.43 0-4.1 1.49-4.1 4.22v2.2H7.7V13h2.74v8h3.06z" /></svg>),
  ytMark: (<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15V9l5 3-5 3z" /></svg>),
  sparkle: (<svg {...ic}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" /></svg>),
  share: (<svg {...ic}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" /></svg>),
  message: (<svg {...ic}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /></svg>),
  handshake: (<svg {...ic}><path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.6-3.6" /><path d="M14 14l2.5 2.5a1 1 0 0 0 1.4-1.4L13 10l-2.5 2a2 2 0 0 1-2.6-3L11 7l3-1 6 5" /><path d="M4 12l3 3M4 6l3-1 2 1" /></svg>),
  info: (<svg {...ic} width="15" height="15"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>),
  trendUp: (<svg {...ic} width="14" height="14"><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg>),
  pin: (<svg {...ic}><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.5" /></svg>),
  fb: (<svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.46-.13-2.43 0-4.1 1.49-4.1 4.22v2.2H7.7V13h2.74v8h3.06z" /></svg>),
  save: (<svg {...ic} width="15" height="15"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>),
}

// Dark URL pill with a copy button (shows a check on success).
const CardLinkPill = forwardRef(function CardLinkPill({ url }, ref) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <button
      ref={ref}
      type="button"
      onClick={copy}
      aria-label="Copy link"
      className="flex items-center gap-3 rounded-lg px-5 py-3 text-[15px] font-medium self-start sm:self-auto transition-colors hover:bg-white/10"
      style={{ fontFamily: MONO, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <span style={{ color: '#3DDC84' }}>{url}</span>
      <span style={{ color: copied ? '#3DDC84' : '#fff' }}>{copied ? ICONS.check : ICONS.copy}</span>
    </button>
  )
})

const PANEL = { background: 'rgba(13,16,45,0.55)', border: '1px solid rgba(255,255,255,0.08)' }
const LABEL_GRADIENT = {
  background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}

// Small on/off switch used on each stat card to control card visibility.
function MiniToggle({ on, onChange, title }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      title={title}
      onClick={(e) => { e.stopPropagation(); onChange(!on) }}
      className="relative inline-flex shrink-0 items-center rounded-full transition-colors"
      style={{ width: 34, height: 19, background: on ? 'linear-gradient(90deg,#8B5CF6,#EC4899)' : 'rgba(255,255,255,0.32)', border: on ? '1px solid transparent' : '1px solid rgba(255,255,255,0.25)' }}
    >
      <span className="rounded-full bg-white transition-transform" style={{ width: 14, height: 14, transform: on ? 'translateX(16px)' : 'translateX(2px)', boxShadow: '0 1px 2px rgba(0,0,0,0.4)' }} />
    </button>
  )
}

function StatCard({ value, label, sub, icon, small, on, onToggle }) {
  const hidden = onToggle && !on
  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col gap-1.5 transition-all hover:bg-white/[0.03]"
      style={{ ...PANEL, minHeight: 116, opacity: hidden ? 0.5 : 1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-white/65 text-[12.5px] font-medium leading-tight" style={{ fontFamily: FONT }}>{label}</span>
        <span
          className="grid place-items-center rounded-lg shrink-0 text-white/45"
          style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {ICONS[icon]}
        </span>
      </div>
      <span
        className={`text-white font-bold leading-tight mt-auto ${small ? 'text-[17px]' : 'text-[27px]'}`}
        style={{ fontFamily: FONT }}
      >
        {value}
      </span>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px]" style={{ fontFamily: MONO, ...LABEL_GRADIENT }}>{sub}</span>
        {onToggle && (
          <MiniToggle on={on} onChange={onToggle} title={on ? 'Showing on Influence Card — tap to hide' : 'Hidden from Influence Card — tap to show'} />
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const accepted = status === 'ACCEPTED'
  const declined = status === 'DECLINED'
  const color = accepted ? '#4DE0B0' : declined ? '#F4607A' : '#F4C13B'
  const bg = accepted ? 'rgba(77,224,176,0.12)' : declined ? 'rgba(244,96,122,0.12)' : 'rgba(244,193,59,0.12)'
  const border = accepted ? 'rgba(77,224,176,0.35)' : declined ? 'rgba(244,96,122,0.35)' : 'rgba(244,193,59,0.35)'
  return (
    <span
      className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full"
      style={{ fontFamily: MONO, color, background: bg, border: `1px solid ${border}` }}
    >
      {status}
    </span>
  )
}

// ===== Creasume Stats (credibility score) =====
// Builds the card data from the backend score breakdown (GET
// /creator/dashboard-stats → stats.score). Falls back to zeros pre-load.
function buildCreasume(score) {
  const s = score || {}
  const c = s.components || {}
  const lever = (k) => c[k] || { count: 0, weight: 0, points: 0 }
  const views = lever('cardViews')
  const shares = lever('cardShares')
  const inquiries = lever('brandInquiries')
  const accepted = lever('inquiriesAccepted')
  return {
    score: s.score != null ? s.score : 0,
    tier: s.tier || 'New',
    shareBonus: s.shareRateBonus != null ? s.shareRateBonus : 0,
    totalPoints: s.rawPoints != null ? s.rawPoints : 0,
    benchmark: s.benchmark != null ? s.benchmark : 500,
    metrics: [
      { key: 'views', icon: 'eye', mult: `×${views.weight}`, value: views.count, label: 'Card Views', pts: `+${views.points} pts`, color: '#4DE0B0' },
      { key: 'shares', icon: 'share', mult: `×${shares.weight}`, value: shares.count, label: 'Card Shares', pts: `+${shares.points} pts`, color: '#A78BFA' },
      { key: 'inquiries', icon: 'message', mult: `×${inquiries.weight}`, value: inquiries.count, label: 'Brand Inquiries', pts: `+${inquiries.points} pts`, color: '#F472B6' },
      { key: 'accepted', icon: 'handshake', mult: `×${accepted.weight}`, value: accepted.count, label: 'Inquiries Accepted', pts: `+${accepted.points} pts`, color: '#FB923C' },
    ],
  }
}

// Circular score gauge (SVG ring filled to score/100).
function ScoreRing({ score, size = 168 }) {
  const r = (size - 16) / 2
  const cc = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#EC4899" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={cc} strokeDashoffset={cc * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-bold text-[40px] leading-none" style={{ fontFamily: FONT }}>{score}</span>
        <span className="text-white/45 text-[11px] tracking-wider mt-1" style={{ fontFamily: MONO }}>/ 100 SCORE</span>
      </div>
    </div>
  )
}

function CreasumeStats({ data }) {
  const c = data
  const [showInfo, setShowInfo] = useState(false)
  const pct = c.benchmark ? Math.min(100, Math.round((c.totalPoints / c.benchmark) * 100)) : 0
  return (
    <div className="rounded-2xl p-6 md:p-8" style={PANEL}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2.5">
            <span style={{ color: '#A78BFA' }}>{ICONS.sparkle}</span>
            <h3 className="text-white font-bold text-xl" style={{ fontFamily: FONT }}>Creasume Stats</h3>
          </div>
          <p className="mt-1 text-white/55 text-sm" style={{ fontFamily: FONT }}>Your credibility, earned from activity on Creasume.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/5 shrink-0"
          style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          {ICONS.info} Learn more
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
        {/* Score gauge */}
        <div className="flex flex-col items-center justify-center gap-4 shrink-0 lg:w-[230px]">
          <ScoreRing score={c.score} />
          <span
            className="rounded-full px-4 py-1.5 text-[13px] font-bold"
            style={{ fontFamily: FONT, color: '#F472B6', background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.4)' }}
          >
            {c.tier}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ fontFamily: MONO, color: '#4DE0B0' }}>
            {ICONS.trendUp} +{c.shareBonus} share-rate bonus
          </span>
        </div>

        {/* Breakdown */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {c.metrics.map((m) => (
              <div
                key={m.key}
                className="relative rounded-2xl p-4 sm:p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span style={{ color: m.color, opacity: 0.9 }}>{ICONS[m.icon]}</span>
                <span
                  className="absolute top-4 right-4 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white/60"
                  style={{ fontFamily: MONO, background: 'rgba(255,255,255,0.06)' }}
                >
                  {m.mult}
                </span>
                <div className="mt-3 text-white font-bold text-[30px] leading-none" style={{ fontFamily: FONT }}>{m.value}</div>
                <div className="mt-1.5 text-white/65 text-sm" style={{ fontFamily: FONT }}>{m.label}</div>
                <div className="mt-2 text-[13px] font-semibold" style={{ fontFamily: MONO, color: m.color }}>{m.pts}</div>
              </div>
            ))}
          </div>

          {/* Total points progress */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/65 text-sm" style={{ fontFamily: FONT }}>Total points</span>
              <span className="text-sm" style={{ fontFamily: MONO }}>
                <span className="text-white font-bold">{c.totalPoints}</span>
                <span className="text-white/40"> / {c.benchmark} benchmark</span>
              </span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 10, background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#7C5CFF 0%,#C04DCC 55%,#EC4899 100%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* "Learn more" — explains how the Creasume Score is built. */}
      {showInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowInfo(false)}
        >
          <div
            className="w-full max-w-[520px] rounded-2xl p-7 max-h-[85vh] overflow-y-auto"
            style={{ background: '#15171f', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: FONT }}>How your Creasume Score works</h3>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                aria-label="Close"
                className="text-white/55 hover:text-white text-2xl leading-none bg-transparent border-0 cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="text-white/70 text-[14px] leading-relaxed mb-5" style={{ fontFamily: FONT }}>
              Your Creasume Score (0–100) is a credibility signal brands trust. It's earned from real
              activity on Creasume — a complete profile, connected Instagram analytics, the brand
              inquiries you receive, and how reliably you respond. Keep your card updated and engage
              with brands to grow it.
            </p>
            {Array.isArray(c.metrics) && c.metrics.length > 0 && (
              <div className="flex flex-col gap-2.5 mb-5">
                {c.metrics.map((m) => (
                  <div
                    key={m.key}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-white/80 text-[14px]" style={{ fontFamily: FONT }}>{m.label}</span>
                    <span className="text-[13px] font-semibold" style={{ fontFamily: MONO, color: m.color }}>{m.pts}</span>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-white/80 text-[14px] font-semibold" style={{ fontFamily: FONT }}>Total</span>
                  <span className="text-[13px] font-bold text-white" style={{ fontFamily: MONO }}>{c.totalPoints} / {c.benchmark}</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="w-full rounded-xl py-3 text-white font-semibold"
              style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Settings =====
const SUBNAV = [
  { key: 'account', label: 'Account', icon: 'user' },
  { key: 'platforms', label: 'Platforms', icon: 'shield' },
  { key: 'billing', label: 'Plan & Billing', icon: 'card' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
]

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
      style={{ background: on ? 'linear-gradient(90deg,#7C5CFF,#9D7BFF)' : 'rgba(255,255,255,0.14)' }}
    >
      <span className="rounded-full bg-white" style={{ width: 18, height: 18, transform: on ? 'translateX(22px)' : 'translateX(3px)', transition: 'transform 0.2s' }} />
    </button>
  )
}

function SField({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-white/55" style={{ fontFamily: FONT }}>{label}</span>
      <input
        {...props}
        className="w-full rounded-xl px-4 py-3 text-[15px] text-white outline-none transition-colors focus:border-violet-400/60"
        style={{ fontFamily: FONT, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)' }}
      />
    </label>
  )
}

function SHead({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-white font-bold text-2xl" style={{ fontFamily: FONT }}>{title}</h2>
      {subtitle && <p className="mt-1.5 text-white/55 text-sm leading-relaxed" style={{ fontFamily: FONT }}>{subtitle}</p>}
    </div>
  )
}

function AccountPanel({ creator }) {
  const [email, setEmail] = useState(creator?.email || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [deleting, setDeleting] = useState(false)
  useEffect(() => { setEmail(creator?.email || '') }, [creator])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2400) }
  const save = async () => {
    if (saving) return
    setSaving(true)
    try { await updateProfile({ email: email.trim() }); flash('Saved ✓') }
    catch (e) { flash(e.message || 'Save failed') }
    finally { setSaving(false) }
  }
  const del = async () => {
    if (deleting) return
    if (!window.confirm('Delete your account permanently? Your card, packages, collaborations and inquiries will be removed. This cannot be undone.')) return
    setDeleting(true)
    try { await deleteAccount(); clearAuth(); goToPath('/') }
    catch (e) { flash(e.message || 'Delete failed'); setDeleting(false) }
  }

  return (
    <div>
      <SHead title="Account Details" />
      <div className="max-w-md flex flex-col gap-5">
        <SField label="Email Address" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ fontFamily: FONT, background: 'var(--theme-grad, linear-gradient(90deg,#7C5CFF,#C04DCC))' }}>
            {saving ? 'Saving…' : 'Save Email'}
          </button>
          {msg && <span className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: msg.includes('✓') ? '#4DE0B0' : '#FB7185' }}>{msg}</span>}
        </div>
        <p className="text-[12px] text-white/40" style={{ fontFamily: FONT }}>You sign in with Instagram, so there's no password to manage here.</p>
      </div>
      <div className="mt-10 max-w-md rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.28)' }}>
        <div className="flex items-center gap-2 text-[15px] font-semibold" style={{ fontFamily: FONT, color: '#FB7185' }}>
          <span style={{ color: '#FB7185' }}>{ICONS.alert}</span> Danger Zone
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-white/55" style={{ fontFamily: FONT }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button type="button" onClick={del} disabled={deleting} className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-500/15 disabled:opacity-60" style={{ fontFamily: FONT, color: '#FB7185', border: '1px solid rgba(239,68,68,0.45)' }}>
          {deleting ? 'Deleting…' : 'Delete Account'}
        </button>
      </div>
    </div>
  )
}

function PlatformsPanel({ creator }) {
  const username = creator?.username || ''
  const igConnected = Boolean(creator?.instagramId || username)
  const rows = [
    { key: 'instagram', name: 'Instagram', handle: igConnected && username ? `@${username}` : 'Not connected', icon: 'igMark', connected: igConnected },
    { key: 'facebook', name: 'Facebook', handle: creator?.facebookConnected ? 'Connected for Meta insights' : 'Not connected', icon: 'fbMark', connected: Boolean(creator?.facebookConnected) },
    { key: 'youtube', name: 'YouTube', handle: creator?.socials?.youtube || 'Not connected', icon: 'ytMark', connected: Boolean(creator?.socials?.youtube) },
  ]
  return (
    <div>
      <SHead title="Connected Platforms" subtitle="Connect your social accounts to automatically sync your latest stats and content to your Influence Card." />
      <div className="flex flex-col gap-3">
        {rows.map((p) => (
          <div key={p.key} className="flex items-center justify-between rounded-2xl px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center rounded-xl" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.06)' }}>{ICONS[p.icon]}</span>
              <div>
                <div className="text-white text-[15px] font-semibold" style={{ fontFamily: FONT }}>{p.name}</div>
                <div className="text-white/45 text-[12px]" style={{ fontFamily: MONO }}>{p.handle}</div>
              </div>
            </div>
            {p.connected ? (
              <span className="rounded-lg px-4 py-2 text-[12px] font-semibold" style={{ fontFamily: FONT, color: '#4DE0B0', background: 'rgba(77,224,176,0.12)' }}>Connected</span>
            ) : (
              <a href={p.key === 'facebook' ? facebookLoginUrl() : loginUrl()} className="rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-white/15 no-underline" style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.1)' }}>Connect</a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function BillingPanel() {
  const features = ['Unlimited portfolio items', 'Custom domain support', 'Advanced audience analytics', 'Remove Creasume branding']
  return (
    <div className="max-w-lg">
      <SHead title="Current Plan" />
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full px-3 py-1 text-[12px] font-semibold" style={{ fontFamily: FONT, color: '#C4B5FD', background: 'rgba(124,92,255,0.2)' }}>Pro Plan</span>
            <p className="mt-3 text-white font-bold text-2xl" style={{ fontFamily: FONT }}>$12<span className="text-white/55 text-sm font-medium">/month</span></p>
            <p className="mt-1 text-white/45 text-[12px]" style={{ fontFamily: MONO }}>Renews on Oct 24, 2026</p>
          </div>
          <button type="button" className="rounded-xl px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-white/10" style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>Manage Billing</button>
        </div>
      </div>
      <h3 className="mt-8 mb-3 text-white font-semibold text-lg" style={{ fontFamily: FONT }}>Plan Features</h3>
      <ul className="flex flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-white/75 text-sm" style={{ fontFamily: FONT }}>
            <span className="rounded-full" style={{ width: 6, height: 6, background: '#9C7CF0' }} />{f}
          </li>
        ))}
      </ul>
      <button type="button" className="mt-8 w-full rounded-xl py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-95" style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#7C5CFF 0%,#C04DCC 55%,#EC4899 100%)' }}>Upgrade to Premium</button>
    </div>
  )
}

function NotificationsPanel({ creator }) {
  const [prefs, setPrefs] = useState({ inquiries: true, weekly: true, product: false })
  const [msg, setMsg] = useState('')
  useEffect(() => {
    const n = creator?.notifications
    if (n) setPrefs({ inquiries: n.inquiries !== false, weekly: n.weekly !== false, product: !!n.product })
  }, [creator])
  // Persist on every toggle (optimistic — the switch flips instantly).
  const update = async (key, v) => {
    const next = { ...prefs, [key]: v }
    setPrefs(next)
    try { await updateProfile({ notifications: next }); setMsg('Saved ✓') }
    catch { setMsg('Save failed') }
    setTimeout(() => setMsg(''), 1800)
  }
  const rows = [
    { key: 'inquiries', title: 'Brand Inquiries', desc: 'Get notified when a brand sends a message through your form.' },
    { key: 'weekly', title: 'Weekly Analytics Report', desc: 'A summary of your profile views and audience growth.' },
    { key: 'product', title: 'Product Updates', desc: 'News about new features and improvements to Creasume.' },
  ]
  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <SHead title="Email Notification" />
        {msg && <span className="text-[13px] font-semibold -mt-5" style={{ fontFamily: FONT, color: msg.includes('✓') ? '#4DE0B0' : '#FB7185' }}>{msg}</span>}
      </div>
      <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <div className="text-white text-[15px] font-semibold" style={{ fontFamily: FONT }}>{r.title}</div>
              <div className="mt-1 text-white/50 text-[12px] leading-relaxed" style={{ fontFamily: FONT }}>{r.desc}</div>
            </div>
            <Toggle on={prefs[r.key]} onChange={(v) => update(r.key, v)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsView({ creator }) {
  const [tab, setTab] = useState('account')
  return (
    <>
      {/* Header band — blue gradient like the mockup */}
      <header className="px-5 sm:px-8 md:px-24 py-7 md:py-8" style={{ background: 'linear-gradient(110deg,#0A0E26 0%,#15205C 55%,#283AA8 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 className="font-bold leading-none mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(22px, 2.6vw, 30px)' }}>Settings</h1>
        <p className="text-white/65 text-base" style={{ fontFamily: FONT }}>Manage your account preferences and billing.</p>
      </header>

      <div className="px-5 sm:px-8 md:px-24 py-6 md:py-10 flex flex-col md:flex-row gap-6">
        {/* Sub-nav — horizontal scroll on phones, vertical list on desktop. */}
        <nav className="flex md:flex-col gap-2 shrink-0 md:w-56 overflow-x-auto md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SUBNAV.map((s) => {
            const active = tab === s.key
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setTab(s.key)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors whitespace-nowrap shrink-0 md:shrink"
                style={{ fontFamily: FONT, color: active ? '#fff' : 'rgba(255,255,255,0.55)', background: active ? 'rgba(255,255,255,0.07)' : 'transparent' }}
              >
                <span className={active ? 'text-white' : 'text-white/45'}>{ICONS[s.icon]}</span>
                {s.label}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <section className="flex-1 rounded-2xl p-6 md:p-8" style={PANEL}>
          {tab === 'account' && <AccountPanel creator={creator} />}
          {tab === 'platforms' && <PlatformsPanel creator={creator} />}
          {tab === 'billing' && <BillingPanel />}
          {tab === 'notifications' && <NotificationsPanel creator={creator} />}
        </section>
      </div>
    </>
  )
}

export default function InfluenceDashboard({ username }) {
  const [view, setView] = useState('dashboard')
  const [mobileNav, setMobileNav] = useState(false) // mobile menu open/closed
  // Bumped by the mobile top-bar "Save" button to trigger EditProfileView's save
  // (the save logic lives in that child, so we signal it via a counter prop).
  const [editSaveSignal, setEditSaveSignal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [me, setMe] = useState(null)        // GET /creator/me → the signed-in account
  const [pub, setPub] = useState(null)      // GET /public/:username → the URL creator
  const [stats, setStats] = useState(null)  // GET /creator/dashboard-stats (signed in)
  const [inquiries, setInquiries] = useState([])
  const [showTour, setShowTour] = useState(false)
  // Per-metric "show on Influence Card" toggles. key → boolean (default on).
  const [visibility, setVisibility] = useState({})

  // Targets the first-login tour spotlights.
  const editNavRef = useRef(null)
  const refreshRef = useRef(null)
  const viewProfileRef = useRef(null)
  const cardLinkRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // Local dev: auto-acquire a token for this creator if none exists, so
      // Save / Fetch work without the manual sign-in step. No-op in production.
      if (!isLoggedIn()) await ensureDevToken(username)

      // Display data is keyed by the username IN THE URL — visiting
      // /<username>/dashboard always shows that creator's dashboard.
      const pubRes = await fetchPublic(username).catch(() => null)
      setPub(pubRes)
      // Seed the metric toggles from the saved visibility map.
      setVisibility(pubRes?.creator?.metricVisibility || {})

      // When signed in, also pull the creator's own account + private data
      // (score breakdown, brand inquiries). The FULL dashboard always renders —
      // Edit Profile and Settings are always available.
      if (isLoggedIn()) {
        const [meRes, statsRes, inqRes] = await Promise.all([
          fetchMe().catch(() => null),
          fetchDashboardStats().catch(() => null),
          fetchMyInquiries().catch(() => ({ inquiries: [] })),
        ])
        const viewer = meRes?.creator || null

        // The dashboard is the signed-in creator's OWN private control center —
        // it always edits `me`, never the creator named in the URL. So if the URL
        // handle belongs to a DIFFERENT creator (e.g. a stale link, or landing on
        // someone else's /<handle>/dashboard), correct the address to this
        // creator's own dashboard so the URL, header and editor all agree.
        const myHandle = viewer?.publicId || viewer?.username || ''
        const urlMatchesMe =
          viewer &&
          username &&
          (username === viewer.publicId || username === viewer.username || username === viewer.slug)
        if (myHandle && username && !urlMatchesMe) {
          const parts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
          parts[0] = encodeURIComponent(myHandle)
          window.history.replaceState({}, '', '/' + parts.join('/'))
          window.dispatchEvent(new PopStateEvent('popstate'))
          return // load() re-runs for the corrected handle
        }

        setMe(viewer)
        if (viewer?.metricVisibility) setVisibility(viewer.metricVisibility)
        if (viewer?.username) setStoredUsername(viewer.username)
        setStats(statsRes?.stats || null)
        setInquiries((inqRes?.inquiries || []).map(mapInquiry))
      } else {
        setMe(null)
        setStats(null)
        setInquiries([])
      }
    } catch (e) {
      // A 401 just means we're signed out (token cleared / expired). That's an
      // expected state — the sidebar shows "Sign in to manage", so don't surface
      // a scary raw "No token" / "Not authorized" banner. Only show real errors.
      if (e.status === 401) {
        clearAuth()
      } else {
        setError(e.message || 'Failed to load dashboard')
      }
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => { load() }, [load])

  // Guided tour — shown ONCE ever (first visit to the dashboard). The flag in
  // localStorage persists across logins/sessions on this browser.
  useEffect(() => {
    try {
      if (!localStorage.getItem('creasume_tour_dashboard')) setShowTour(true)
    } catch { /* storage unavailable → just don't auto-show */ }
  }, [])

  const finishTour = () => {
    setShowTour(false)
    try {
      localStorage.setItem('creasume_tour_dashboard', '1')
    } catch { /* storage unavailable */ }
  }

  // Toggle a metric's visibility on the public card and persist it. Optimistic:
  // flips locally, then saves the whole map via /creator/update. On failure we
  // revert the flip and surface why — a 401 means the token is invalid/expired,
  // so we clear it and prompt a fresh sign-in instead of failing silently.
  const toggleMetric = (key, nextOn) => {
    if (!isLoggedIn()) return
    const prev = visibility
    const next = { ...prev, [key]: nextOn }
    setVisibility(next)
    updateProfile({ metricVisibility: next }).catch((e) => {
      setVisibility(prev) // revert the optimistic change
      if (e.status === 401) {
        clearAuth()
        setError('Your session expired — please sign in again to change what shows on your card.')
      } else {
        setError(e.message || 'Could not save your change. Please try again.')
      }
    })
  }

  if (loading && !pub && !me) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#05060f' }}>
        <img src="/creasume-c.png" alt="Creasume" className="h-16 w-auto" style={{ objectFit: 'contain', animation: 'creasumeFade 1.5s ease-in-out infinite' }} />
      </div>
    )
  }

  // ---- Derive the view models from the live payloads ----
  const loggedIn = isLoggedIn()
  // Prefer the signed-in creator's own record; else the public creator doc.
  const creator = me || pub?.creator || {}
  const handle = username || creator.username || ''
  const s = pub?.stats || {}
  // Score breakdown from the public payload (any username) or the signed-in
  // creator's authed dashboard-stats — same shape either way.
  const score = pub?.score || stats?.score || null
  const firstName = (creator.name || handle || 'Creator').split(' ')[0]
  // Admin-managed badges, same rule as the public card: a Founding Creator is
  // always verified.
  const isFounding = !!creator.isFoundingCreator
  const isVerified = !!(creator.isVerified || creator.isFoundingCreator)
  const cardUrl = `creasume.com/${handle}`
  const fc0 = (v) => formatCount(v) ?? '0'

  const inquiryCount =
    stats?.totalInquiries ??
    score?.components?.brandInquiries?.count ??
    inquiries.length
  const profileViews = stats?.profileViews ?? pub?.creator?.profileViews ?? score?.components?.cardViews?.count

  // Extra metrics that the public Influence Card shows, surfaced here too.
  const topCity = pub?.demographics?.city?.[0]?.key || null
  const brandDeals = Array.isArray(pub?.collaborations) ? pub.collaborations.length : 0
  const creasumeScore = score?.score != null ? score.score : (s.creasumeScore != null ? s.creasumeScore : 0)

  // All the cards shown on the Influence Card (hero pills + metric grid), plus
  // the dashboard-only Profile Views / Brand Inquiries.
  const STATS = [
    { metricKey: 'followers', label: 'Followers', value: fc0(s.followersCount), sub: 'Total Audience', icon: 'followers' },
    { metricKey: 'engagement', label: 'Engagement Rate', value: s.engagementRate != null ? `${s.engagementRate}%` : '0%', sub: 'Avg. Engagement', icon: 'chart' },
    { metricKey: 'views', label: 'Total Views', value: fc0(s.views), sub: 'Last 30 Days', icon: 'eye' },
    { metricKey: 'reach', label: 'Reach', value: fc0(s.reach), sub: 'Last 30 Days', icon: 'trendUp' },
    { metricKey: 'posts', label: 'Total Posts', value: fc0(s.mediaCount), sub: 'Media Count', icon: 'camera' },
    { metricKey: 'impressions', label: 'Impressions', value: fc0(s.impressions), sub: 'Total Impressions', icon: 'share' },
    { metricKey: 'creasumeScore', label: 'Creasume Score', value: String(creasumeScore), sub: 'Credibility / 100', icon: 'sparkle' },
    { metricKey: 'brandDeals', label: 'Brand Deals', value: String(brandDeals), sub: 'Collaborations', icon: 'handshake' },
    { metricKey: 'topCity', label: 'Top City', value: topCity ? shortenLocation(topCity) : '—', sub: 'Top Audience', icon: 'pin', small: true },
    { metricKey: 'profileViews', label: 'Profile Views', value: fc0(profileViews), sub: 'Card Views', icon: 'eye' },
    { metricKey: 'brandInquiries', label: 'Brand Inquiries', value: String(inquiryCount), sub: 'Total Received', icon: 'inbox' },
  ]

  const creasume = buildCreasume(score)

  // Recent posts — real images from the top-posts set (falls back to recent media).
  const postSources = (pub?.topPosts?.length ? pub.topPosts.map((p) => p.photo) : (pub?.media || []).map((m) => (m.media_type === 'VIDEO' ? m.thumbnail_url || m.media_url : m.media_url)))
    .filter(Boolean)
  const POSTS = [0, 1, 2].map((i) => ({ photo: postSources[i] || '' }))

  // Extra platform links the creator added (beyond Instagram).
  const otherLinks = (Array.isArray(creator.socialLinks) ? creator.socialLinks : [])
    .filter((l) => l && l.platform && l.url && l.platform.toLowerCase() !== 'instagram')

  const recentInquiries = inquiries.slice(0, 4)
  const navItems = NAV

  const tourSteps = [
    { ref: editNavRef, title: 'Customize Your Profile', desc: 'Add your custom packages, previous collaborations, and personal branding.' },
    { ref: refreshRef, title: 'Real-time Analytics', desc: 'Sync your latest Instagram metrics with one click to keep your card up-to-date.' },
    { ref: viewProfileRef, title: 'Preview Your Card', desc: 'See exactly what brands will see when they visit your public link.' },
    { ref: cardLinkRef, title: 'Share With Brands', desc: 'Copy your unique link and use it in your bio or brand outreach emails.' },
  ]

  return (
    <div className="relative min-h-screen text-white" style={{ background: '#05060f' }}>
      {showTour && view === 'dashboard' && <DashboardTour steps={tourSteps} onDone={finishTour} />}
      <div className="flex min-h-screen">
        {/* ===== Sidebar ===== */}
        <aside
          // Sticky + full viewport height so the bottom "Log out / Sign in"
          // button is always visible instead of scrolling off with the page.
          className="hidden md:flex md:sticky md:top-0 md:h-screen flex-col shrink-0 w-[210px] lg:w-[240px]"
          style={{ background: 'rgba(10,12,30,0.9)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="h-27 flex items-center justify-center border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <img src="/creasumelogo.png" alt="Creasume" className="h-9 w-auto" style={{ objectFit: 'contain' }} />
          </div>
          <nav className="flex flex-col gap-2 p-4 mt-2">
            {navItems.map((n) => {
              const active = n.key === view
              return (
                <button
                  key={n.key}
                  ref={n.key === 'edit' ? editNavRef : undefined}
                  type="button"
                  onClick={() => setView(n.key)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors"
                  style={{
                    fontFamily: FONT,
                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                    background: active ? 'linear-gradient(90deg,#5D65DC 0%, #8B5CF6 100%)' : 'transparent',
                  }}
                >
                  <span className={active ? 'text-white' : 'text-white/55'}>{ICONS[n.icon]}</span>
                  {n.label}
                </button>
              )
            })}
          </nav>

          {/* Log out (signed in) / Sign in — pinned to the bottom */}
          <div className="mt-auto p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {loggedIn ? (
              <button
                type="button"
                // Clear the stored token/username, then do a FULL reload to the
                // home page so all in-memory creator state is wiped and the local
                // dev auto-token can't silently sign the user back in.
                onClick={() => { clearAuth(); window.location.href = '/' }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 w-full text-left text-[15px] font-medium text-white/70 hover:text-white hover:bg-red-500/10 transition-colors"
                style={{ fontFamily: FONT }}
              >
                <span className="text-white/60">{ICONS.logout}</span>
                Log out
              </button>
            ) : (
              <a
                href={loginUrl()}
                className="flex items-center gap-3 rounded-xl px-4 py-3 w-full text-left text-[15px] font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors no-underline"
                style={{ fontFamily: FONT }}
              >
                <span className="text-white/55">{ICONS.igMark}</span>
                Sign in to manage
              </a>
            )}
          </div>
        </aside>

        {/* ===== Main ===== */}
        <main className="flex-1 min-w-0">
          {/* Mobile top bar — the sidebar is hidden on phones, so nav + auth live
              here. Logo on the left, hamburger opens the menu. */}
          <div
            className="md:hidden sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b"
            style={{ background: 'rgba(10,12,30,0.96)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
          >
            <img src="/creasumelogo.png" alt="Creasume" className="h-7 w-auto" style={{ objectFit: 'contain' }} />
            <div className="flex items-center gap-2">
              {/* Save Changes — only in Edit Profile; triggers the editor's save */}
              {view === 'edit' && (
                <button
                  type="button"
                  onClick={() => setEditSaveSignal((s) => s + 1)}
                  aria-label="Save Changes"
                  title="Save Changes"
                  className="grid place-items-center rounded-lg w-10 h-10 text-white shrink-0 transition-opacity hover:opacity-90"
                  style={{ fontFamily: FONT, background: 'var(--theme-grad, linear-gradient(90deg,#7C5CFF,#C04DCC))' }}
                >
                  {ICONS.save}
                </button>
              )}
              {/* Connect Facebook — lives by the menu bar on mobile */}
              <a
                href={facebookLoginUrl()}
                aria-label="Connect Facebook"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 h-10 text-[13px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
                style={{ fontFamily: FONT, background: 'rgba(24,119,242,0.18)', border: '1px solid rgba(24,119,242,0.55)' }}
              >
                {ICONS.fb} Connect
              </a>
              <button
                type="button"
                onClick={() => setMobileNav((o) => !o)}
                aria-label="Menu"
                aria-expanded={mobileNav}
                className="grid place-items-center rounded-lg w-10 h-10 text-white shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {mobileNav ? <><path d="M18 6 6 18" /><path d="M6 6l12 12" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu — slides in from the RIGHT as a drawer over a backdrop
              (instead of dropping down from the top). Always mounted so the
              slide/fade transitions run on both open and close. */}
          <div
            className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileNav ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ background: 'rgba(0,0,0,0.55)' }}
            onClick={() => setMobileNav(false)}
            aria-hidden="true"
          />
          <aside
            className={`md:hidden fixed top-0 right-0 z-50 h-full w-[82%] max-w-[320px] flex flex-col px-4 pt-4 pb-6 transition-transform duration-300 ease-out ${mobileNav ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ background: 'rgba(10,12,30,0.99)', borderLeft: '1px solid rgba(255,255,255,0.08)', boxShadow: '-20px 0 50px rgba(0,0,0,0.5)' }}
          >
            {/* Drawer header: logo + close */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <img src="/creasumelogo.svg" alt="Creasume" className="h-7 w-auto" style={{ objectFit: 'contain' }} />
              <button
                type="button"
                onClick={() => setMobileNav(false)}
                aria-label="Close menu"
                className="grid place-items-center rounded-lg w-9 h-9 text-white shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {navItems.map((n) => (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => { setView(n.key); setMobileNav(false) }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium"
                  style={{
                    fontFamily: FONT,
                    color: n.key === view ? '#fff' : 'rgba(255,255,255,0.6)',
                    background: n.key === view ? 'linear-gradient(90deg,#5D65DC 0%, #8B5CF6 100%)' : 'transparent',
                  }}
                >
                  <span className={n.key === view ? 'text-white' : 'text-white/55'}>{ICONS[n.icon]}</span>
                  {n.label}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {loggedIn ? (
                <button
                  type="button"
                  onClick={() => { clearAuth(); window.location.href = '/' }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 w-full text-left text-[15px] font-medium text-white/70 hover:bg-red-500/10 transition-colors"
                  style={{ fontFamily: FONT }}
                >
                  <span className="text-white/60">{ICONS.logout}</span>
                  Log out
                </button>
              ) : (
                <a
                  href={loginUrl()}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 w-full text-left text-[15px] font-medium text-white/80 hover:bg-white/5 transition-colors no-underline"
                  style={{ fontFamily: FONT }}
                >
                  <span className="text-white/55">{ICONS.igMark}</span>
                  Sign in to manage
                </a>
              )}
            </div>
          </aside>

          {view === 'settings' ? <SettingsView creator={creator} /> : view === 'edit' ? <EditProfileView creator={creator} username={handle} onSaved={load} saveSignal={editSaveSignal} /> : (
          <>
          {/* Header band */}
          <header
            className="px-5 sm:px-8 md:px-24 pt-12 md:pt-12 pb-6 md:pb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
            style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="font-bold leading-none" style={{ fontFamily: FONT, fontSize: 'clamp(18px, 2.4vw, 28px)' }}>
                  Welcome back, {firstName}!
                </h1>
                {/* Verified tick — blue seal with a white check (admin-managed). */}
                {isVerified && (
                  <span title="Verified" className="inline-flex shrink-0 items-center justify-center" style={{ width: 22, height: 22 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
                      <circle cx="12" cy="12" r="10" fill="#3B82F6" />
                      <path d="M7.8 12.4l2.6 2.6 5.4-5.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                {/* Founding Creator — gold pill (admin-managed). */}
                {isFounding && (
                  <span
                    title="Founding Creator"
                    className="founding-badge inline-flex shrink-0 items-center rounded-full text-[10.5px] font-bold whitespace-nowrap px-2 py-0.5"
                    style={{
                      fontFamily: FONT,
                      color: '#F5D98B',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(212,175,55,0.6)',
                    }}
                  >
                    ★ Founding Creator
                  </span>
                )}
              </div>
              <p className="text-white/65 text-base" style={{ fontFamily: FONT }}>
                Here's what's happening with your creator business today.
              </p>
            </div>
            <div
              className="flex flex-nowrap items-center gap-3 shrink-0 self-end md:self-auto ml-auto whitespace-nowrap"
              style={{ marginRight: 'clamp(0px, 6vw, 110px)' }}
            >
              <button
                ref={refreshRef}
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                disabled={loading}
                style={{ fontFamily: FONT, color: '#fff', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                {ICONS.refresh} {loading ? 'Refreshing…' : 'Refresh Stats'}
              </button>
              <a
                href={facebookLoginUrl()}
                className="hidden md:inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-medium transition-colors no-underline hover:opacity-90"
                style={{ fontFamily: FONT, color: '#fff', background: 'rgba(24,119,242,0.16)', border: '1px solid rgba(24,119,242,0.55)' }}
              >
                {ICONS.fb} Connect Facebook
              </a>
              <a
                ref={viewProfileRef}
                href={`/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-medium hover:bg-white/5 transition-colors no-underline"
                style={{ fontFamily: FONT, color: '#fff', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                {ICONS.external} View Live Profile
              </a>
            </div>
          </header>

          <div className="px-5 sm:px-8 md:px-24 py-8 md:py-12 flex flex-col gap-7">
            {error && (
              <div className="rounded-xl px-5 py-4 text-[14px]" style={{ fontFamily: FONT, color: '#FB7185', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}

            {/* Influence card link */}
            <div className="rounded-2xl px-7 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={PANEL}>
              <div>
                <div className="text-white font-semibold text-xl mb-1.5" style={{ fontFamily: FONT }}>Your Influence Card Link</div>
                <div className="text-white/55 text-base" style={{ fontFamily: FONT }}>Share this with brands instead of a PDF media kit.</div>
              </div>
              <CardLinkPill ref={cardLinkRef} url={cardUrl} />
            </div>

            {/* Stat grid — a real 2 / 3 / 4-per-row CSS grid so every card lines
                up in clean columns and the leftover last row stays left-aligned
                under the columns above (not centered/offset). */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {STATS.map((st) => (
                <StatCard
                  key={st.label}
                  {...st}
                  on={visibility[st.metricKey] !== false}
                  onToggle={loggedIn ? (nextOn) => toggleMetric(st.metricKey, nextOn) : undefined}
                />
              ))}
            </section>

            {/* Creasume credibility score */}
            <CreasumeStats data={creasume} />

            {/* Posts + side column */}
            <section className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
              {/* Recent Instagram posts */}
              <div className="rounded-2xl p-6" style={PANEL}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold text-lg" style={{ fontFamily: FONT }}>Top Posts</h3>
                </div>
                <div
                  className="grid gap-x-4 sm:gap-x-12 gap-y-4 sm:gap-y-6"
                  style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: '262px' }}
                >
                  {POSTS.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        maxWidth: '100%',
                        // Tall left card spans both rows; shorter than the full span.
                        gridRow: i === 0 ? 'span 2' : undefined,
                        height: i === 0 ? 460 : undefined,
                        alignSelf: i === 0 ? 'start' : undefined,
                      }}
                    >
                      {p.photo && <img src={p.photo} alt="" loading="lazy" className="w-full h-full object-cover" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-6">
                {/* Platforms */}
                <div className="rounded-2xl p-6" style={PANEL}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-semibold text-lg" style={{ fontFamily: FONT }}>Platforms</h3>
                    <button type="button" onClick={() => setView('edit')} className="text-sm font-medium" style={{ fontFamily: FONT, color: '#9C7CF0' }}>Manage</button>
                  </div>
                  <div
                    className="flex items-center gap-3.5 rounded-xl px-4 py-4"
                    style={{ background: 'linear-gradient(90deg, rgba(93,101,220,0.16) 0%, rgba(139,92,246,0.16) 100%)', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    <span className="shrink-0">{ICONS.igMark}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-base font-medium" style={{ fontFamily: FONT }}>Instagram</div>
                      <div className="text-white/55 text-[12px]" style={{ fontFamily: MONO }}>@{handle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold text-base" style={{ fontFamily: FONT }}>{fc0(s.mediaCount)}</div>
                      <div className="text-white/45 text-[10px]" style={{ fontFamily: MONO }}>Total posts</div>
                    </div>
                  </div>

                  {otherLinks.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-3.5 rounded-xl px-4 py-4 no-underline transition-colors hover:bg-white/5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-base font-medium" style={{ fontFamily: FONT }}>{l.platform}</div>
                        <div className="text-white/55 text-[12px] truncate" style={{ fontFamily: MONO }}>{l.url}</div>
                      </div>
                      <span className="text-white/50">{ICONS.external}</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* Recent brand inquiries */}
            <div className="rounded-2xl p-6" style={PANEL}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-lg" style={{ fontFamily: FONT }}>Recent Brand Inquiries</h3>
                <button type="button" onClick={() => goToPath(inquiriesPath(handle))} className="text-sm font-medium" style={{ fontFamily: FONT, color: '#9C7CF0' }}>View All</button>
              </div>
              {recentInquiries.length === 0 ? (
                <div className="rounded-xl grid place-items-center text-white/40 text-[15px] px-6 py-10 text-center" style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  No brand inquiries yet. Share your card to start receiving them.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentInquiries.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goToPath(inquiryDetailPath(handle, q.id))}
                      className="flex items-center justify-between rounded-xl px-5 py-4 text-left w-full cursor-pointer transition-colors hover:bg-white/6"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-base font-semibold truncate" style={{ fontFamily: FONT }}>{q.brand.name}</span>
                          <StatusBadge status={q.status} />
                        </div>
                        <div className="text-white/50 text-sm truncate" style={{ fontFamily: FONT }}>{q.detail}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 pl-4">
                        <span className="text-[13px] text-[#9EA5E2] whitespace-nowrap" style={{ fontFamily: MONO }}>{q.date}</span>
                        <span className="text-white/50">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  )
}

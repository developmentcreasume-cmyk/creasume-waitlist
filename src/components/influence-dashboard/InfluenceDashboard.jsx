// Influence Dashboard — creator-facing control center (distinct from the public
// Influence Card at /<username>). Static sample data for now; wire to the
// backend later. Layout: left sidebar + main (header, card link, stat row,
// recent posts, Creasume score, platforms, brand inquiries).
import { useState } from 'react'
import { FONT, MONO } from '../influence/influenceData.js'
import { goToPath } from '../../router.js'
import { INQUIRIES } from './inquiriesData.js'

// ---- Sample data (replace with live data once wired) ----
const CREATOR = {
  firstName: 'Hetvi',
  cardUrl: 'creasume.com/hetvipatel',
  followers: '12,500',
  profileViews: '43,270',
  mediaCount: '142',
  engagement: '34.62%',
  inquiries: '13',
  creasumeScore: 10,
  igHandle: '@hetvi_07',
  igPosts: '142',
}

const STATS = [
  { label: 'Followers', value: CREATOR.followers, sub: 'Total Audience', icon: 'followers' },
  { label: 'Profile Views', value: CREATOR.profileViews, sub: 'Total Views', icon: 'eye' },
  { label: 'Media Count', value: CREATOR.mediaCount, sub: 'Total Posts', icon: 'camera' },
  { label: 'Avg. Engagement', value: CREATOR.engagement, sub: 'Engagement Rate', icon: 'chart' },
  { label: 'Brand Inquiries', value: CREATOR.inquiries, sub: 'Total Received', icon: 'inbox' },
]

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
}

// Dark URL pill with a copy button (shows a check on success).
function CardLinkPill({ url }) {
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
}

const PANEL = { background: 'rgba(13,16,45,0.55)', border: '1px solid rgba(255,255,255,0.08)' }
const LABEL_GRADIENT = {
  background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}

function StatCard({ value, label, sub, icon }) {
  return (
    <div className="relative rounded-2xl px-6 py-6 flex flex-col gap-2" style={PANEL}>
      <span className="absolute top-4 right-4 text-white/40 scale-110">{ICONS[icon]}</span>
      <span className="text-white/70 text-[13px] font-medium pr-6" style={{ fontFamily: FONT }}>{label}</span>
      <span className="text-white font-bold text-[32px] leading-none" style={{ fontFamily: FONT }}>{value}</span>
      <span className="text-[12px]" style={{ fontFamily: MONO, ...LABEL_GRADIENT }}>{sub}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const accepted = status === 'ACCEPTED'
  return (
    <span
      className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full"
      style={{
        fontFamily: MONO,
        color: accepted ? '#4DE0B0' : '#F4C13B',
        background: accepted ? 'rgba(77,224,176,0.12)' : 'rgba(244,193,59,0.12)',
        border: `1px solid ${accepted ? 'rgba(77,224,176,0.35)' : 'rgba(244,193,59,0.35)'}`,
      }}
    >
      {status}
    </span>
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

function AccountPanel() {
  const [remember, setRemember] = useState(false)
  return (
    <div>
      <SHead title="Account Details" />
      <div className="max-w-md flex flex-col gap-5">
        <SField label="Email Address" type="email" placeholder="Enter your email" />
        <SField label="Password" type="password" placeholder="••••••••" defaultValue="password" />
        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-white/55" style={{ fontFamily: FONT }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-violet-500" />
            Remember for 30 days
          </label>
          <button type="button" className="text-[13px] font-medium" style={{ fontFamily: FONT, color: '#9C7CF0' }}>Forgot Password</button>
        </div>
      </div>
      <div className="mt-10 max-w-md rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.28)' }}>
        <div className="flex items-center gap-2 text-[15px] font-semibold" style={{ fontFamily: FONT, color: '#FB7185' }}>
          <span style={{ color: '#FB7185' }}>{ICONS.alert}</span> Danger Zone
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-white/55" style={{ fontFamily: FONT }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button type="button" className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-500/15" style={{ fontFamily: FONT, color: '#FB7185', border: '1px solid rgba(239,68,68,0.45)' }}>
          Delete Account
        </button>
      </div>
    </div>
  )
}

function PlatformsPanel() {
  const [ig, setIg] = useState(true)
  const rows = [
    { key: 'instagram', name: 'Instagram', handle: ig ? '@hetvi_07' : 'Not connected', icon: 'igMark', connected: ig },
    { key: 'facebook', name: 'Facebook', handle: 'Not connected', icon: 'fbMark', connected: false },
    { key: 'youtube', name: 'YouTube', handle: 'Not connected', icon: 'ytMark', connected: false },
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
            {p.key === 'instagram' && p.connected ? (
              <button type="button" onClick={() => setIg(false)} className="rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors" style={{ fontFamily: FONT, color: '#FB7185', background: 'rgba(239,68,68,0.14)' }}>Disconnect</button>
            ) : (
              <button type="button" onClick={() => p.key === 'instagram' && setIg(true)} className="rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-white/15" style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.1)' }}>Connect</button>
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

function NotificationsPanel() {
  const [prefs, setPrefs] = useState({ inquiries: true, weekly: true, product: false })
  const rows = [
    { key: 'inquiries', title: 'Brand Inquiries', desc: 'Get notified when a brand sends a message through your form.' },
    { key: 'weekly', title: 'Weekly Analytics Report', desc: 'A summary of your profile views and audience growth.' },
    { key: 'product', title: 'Product Updates', desc: 'News about new features and improvements to Creasume.' },
  ]
  return (
    <div>
      <SHead title="Email Notification" />
      <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <div className="text-white text-[15px] font-semibold" style={{ fontFamily: FONT }}>{r.title}</div>
              <div className="mt-1 text-white/50 text-[12px] leading-relaxed" style={{ fontFamily: FONT }}>{r.desc}</div>
            </div>
            <Toggle on={prefs[r.key]} onChange={(v) => setPrefs((s) => ({ ...s, [r.key]: v }))} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsView() {
  const [tab, setTab] = useState('account')
  return (
    <>
      {/* Header band — blue gradient like the mockup */}
      <header className="px-8 md:px-24 py-7 md:py-8" style={{ background: 'linear-gradient(110deg,#0A0E26 0%,#15205C 55%,#283AA8 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 className="font-bold leading-none mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(22px, 2.6vw, 30px)' }}>Settings</h1>
        <p className="text-white/65 text-base" style={{ fontFamily: FONT }}>Manage your account preferences and billing.</p>
      </header>

      <div className="px-8 md:px-24 py-6 md:py-10 flex flex-col md:flex-row gap-6">
        {/* Sub-nav */}
        <nav className="flex md:flex-col gap-2 shrink-0 md:w-56">
          {SUBNAV.map((s) => {
            const active = tab === s.key
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setTab(s.key)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors"
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
          {tab === 'account' && <AccountPanel />}
          {tab === 'platforms' && <PlatformsPanel />}
          {tab === 'billing' && <BillingPanel />}
          {tab === 'notifications' && <NotificationsPanel />}
        </section>
      </div>
    </>
  )
}

export default function InfluenceDashboard() {
  const [view, setView] = useState('dashboard')
  return (
    <div className="relative min-h-screen text-white" style={{ background: '#05060f' }}>
      <div className="flex min-h-screen">
        {/* ===== Sidebar ===== */}
        <aside
          className="hidden md:flex flex-col shrink-0 w-[210px] lg:w-[240px]"
          style={{ background: 'rgba(10,12,30,0.9)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="h-27 flex items-center justify-center border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <img src="/creasumelogo.png" alt="Creasume" className="h-9 w-auto" style={{ objectFit: 'contain' }} />
          </div>
          <nav className="flex flex-col gap-2 p-4 mt-2">
            {NAV.map((n) => {
              const active = n.key === view
              return (
                <button
                  key={n.key}
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

          {/* Log out — pinned to the bottom */}
          <div className="mt-auto p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              className="flex items-center gap-3 rounded-xl px-4 py-3 w-full text-left text-[15px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              style={{ fontFamily: FONT }}
            >
              <span className="text-white/55">{ICONS.logout}</span>
              Log out
            </button>
          </div>
        </aside>

        {/* ===== Main ===== */}
        <main className="flex-1 min-w-0">
          {view === 'settings' ? <SettingsView /> : (
          <>
          {/* Header band */}
          <header
            className="px-8 md:px-24 py-5 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
            style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div>
              <h1 className="font-bold leading-none mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(20px, 2.4vw, 28px)' }}>
                Welcome back, {CREATOR.firstName}!
              </h1>
              <p className="text-white/65 text-base" style={{ fontFamily: FONT }}>
                Here's what's happening with your creator business today.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-medium hover:bg-white/5 transition-colors"
                style={{ fontFamily: FONT, color: '#fff', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                {ICONS.refresh} Refresh Stats
              </button>
              <a
                href={`/${CREATOR.cardUrl.split('/')[1] || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-medium hover:bg-white/5 transition-colors no-underline"
                style={{ fontFamily: FONT, color: '#fff', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                {ICONS.external} View Live Profile
              </a>
            </div>
          </header>

          <div className="px-8 md:px-24 py-6 md:py-10 flex flex-col gap-6">
            {/* Influence card link */}
            <div className="rounded-2xl px-7 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={PANEL}>
              <div>
                <div className="text-white font-semibold text-xl mb-1.5" style={{ fontFamily: FONT }}>Your Influence Card Link</div>
                <div className="text-white/55 text-base" style={{ fontFamily: FONT }}>Share this with brands instead of a PDF media kit.</div>
              </div>
              <CardLinkPill url={CREATOR.cardUrl} />
            </div>

            {/* Stat row */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {STATS.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </section>

            {/* Posts + side column */}
            <section className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
              {/* Recent Instagram posts */}
              <div className="rounded-2xl p-6" style={PANEL}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold text-lg" style={{ fontFamily: FONT }}>Recent Instagram Posts</h3>
                  <button type="button" className="text-sm font-medium" style={{ fontFamily: FONT, color: '#9C7CF0' }}>View All</button>
                </div>
                <div
                  className="grid justify-center gap-x-12 gap-y-6"
                  style={{ gridTemplateColumns: 'repeat(2, 292px)', gridAutoRows: '262px' }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        maxWidth: '100%',
                        // Tall left card spans both rows; shorter than the full span.
                        gridRow: i === 0 ? 'span 2' : undefined,
                        height: i === 0 ? 460 : undefined,
                        alignSelf: i === 0 ? 'start' : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-6">
                {/* Creasume score */}
                <div className="rounded-2xl p-6" style={PANEL}>
                  <h3 className="text-white font-semibold text-lg mb-1" style={{ fontFamily: FONT }}>Creasume Stats</h3>
                  <p className="text-white/50 text-sm mb-5" style={{ fontFamily: FONT }}>Your Creasume Score:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-[56px] leading-none" style={{ fontFamily: FONT }}>{CREATOR.creasumeScore}</span>
                    <span className="rounded-lg" style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#8B5CF6,#C04DCC)' }} />
                  </div>
                </div>

                {/* Platforms */}
                <div className="rounded-2xl p-6" style={PANEL}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-semibold text-lg" style={{ fontFamily: FONT }}>Platforms</h3>
                    <button type="button" className="text-sm font-medium" style={{ fontFamily: FONT, color: '#9C7CF0' }}>Manage</button>
                  </div>
                  <div
                    className="flex items-center gap-3.5 rounded-xl px-4 py-4"
                    style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.25) 100%)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <span className="shrink-0">{ICONS.igMark}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-base font-medium" style={{ fontFamily: FONT }}>Instagram</div>
                      <div className="text-white/55 text-[12px]" style={{ fontFamily: MONO }}>{CREATOR.igHandle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold text-base" style={{ fontFamily: FONT }}>{CREATOR.igPosts}</div>
                      <div className="text-white/45 text-[10px]" style={{ fontFamily: MONO }}>Total posts</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent brand inquiries */}
            <div className="rounded-2xl p-6" style={PANEL}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-lg" style={{ fontFamily: FONT }}>Recent Brand Inquiries</h3>
                <button type="button" onClick={() => goToPath('/dashboard/inquiries')} className="text-sm font-medium" style={{ fontFamily: FONT, color: '#9C7CF0' }}>View All</button>
              </div>
              <div className="flex flex-col gap-3">
                {INQUIRIES.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToPath(`/dashboard/inquiries/${q.id}`)}
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
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  )
}

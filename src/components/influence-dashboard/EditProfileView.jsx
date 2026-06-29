// Edit Influence Card — the creator editor (Profile / Portfolio / Packages /
// Design tabs) with a live-preview of the creator's REAL card and a Save bar.
// Everything is wired to the backend:
//   • Profile + Design  → PUT /creator/update (name, bio, niche, location,
//                          social links, theme) — these render on the card.
//   • Packages          → /packages create/update/delete
//   • Portfolio collabs  → /collaborations create/delete
// Saving bumps the preview iframe and calls onSaved() so the dashboard refreshes.
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { FONT, MONO } from '../influence/influenceData.js'
import DashboardTour from './DashboardTour.jsx'
import {
  API_BASE,
  isLoggedIn,
  updateProfile,
  fetchMyPackages,
  createPackage,
  updatePackage,
  deletePackage,
  fetchMyCollaborations,
  createCollaboration,
  deleteCollaboration,
  fetchCollabMetrics,
  facebookLoginUrl,
} from '../../services/dashboardApi.js'

const TABS = ['Profile', 'Portfolio', 'Packages', 'Design']

// Quick-pick solid colours + gradient presets for the accent picker.
const QUICK_COLOURS = ['#8B5CF6', '#EC4899', '#22C55E', '#F97316', '#3B82F6', '#EF4444', '#EAB308', '#10B981', '#06B6D4', '#A855F7', '#F43F5E', '#FFFFFF']
const GRADIENT_PRESETS = [
  ['#A855F7', '#EC4899'], ['#3B82F6', '#06B6D4'], ['#F59E0B', '#F97316'],
  ['#10B981', '#14B8A6'], ['#F97316', '#EF4444'], ['#6366F1', '#06B6D4'],
]
const BG_STYLES = [
  { key: 'mesh', label: 'Mesh Gradient', bg: 'radial-gradient(120% 120% at 30% 10%, #2b3aa0 0%, #141a4d 45%, #0a0c1f 100%)' },
  { key: 'solid', label: 'Solid Dark', bg: 'linear-gradient(160deg,#0b0d18 0%,#05060f 100%)' },
]
const FONTS = [
  { key: 'outfit', name: 'Outfit & DM Mono', desc: 'Modern, bold, Gen Z aesthetic (Default)' },
  { key: 'inter', name: 'Inter & DM Mono', desc: 'Clean, technical, professional' },
]
// Premium niche themes (locked behind ₹50/mo each).
const NICHE_THEMES = [
  { name: 'Aurora', niche: 'Lifestyle & Wellness', desc: 'Soft rounded type and floral motifs for calm, feel-good content.', emoji: '🌿', grad: 'linear-gradient(135deg,#7C3AED 0%,#2563EB 45%,#22C55E 100%)' },
  { name: 'Neon Circuit', niche: 'Tech & Coding', desc: 'Pixel type and code symbols on deep black — pure dev energy.', emoji: '💻', grad: 'linear-gradient(135deg,#1D4ED8 0%,#0EA5E9 100%)' },
  { name: 'Rose Glow', niche: 'Beauty & Fashion', desc: 'Classy Playfair serif with sparkles — editorial and luxe.', emoji: '💄', grad: 'linear-gradient(135deg,#EC4899 0%,#F59E0B 100%)' },
  { name: 'Pulse', niche: 'Fitness & Health', desc: 'Heavy condensed type that hits like a PR. Pure intensity.', emoji: '💪', grad: 'linear-gradient(135deg,#F59E0B 0%,#84CC16 100%)' },
  { name: 'Wanderlust', niche: 'Travel & Adventure', desc: 'Breezy script and travel marks for golden-hour storytellers.', emoji: '🌅', grad: 'linear-gradient(135deg,#F97316 0%,#FBBF24 100%)' },
  { name: 'Feast', niche: 'Food & Cooking', desc: 'Retro diner script and warm tones that look delicious.', emoji: '🍜', grad: 'linear-gradient(135deg,#F97316 0%,#EF4444 100%)' },
  { name: 'Ledger', niche: 'Finance & Crypto', desc: 'Clean numeric type and chart marks for credible, data-led content.', emoji: '📈', grad: 'linear-gradient(135deg,#10B981 0%,#84CC16 100%)' },
  { name: 'Arcade', niche: 'Gaming & Esports', desc: 'Pixel arcade type with neon energy for high-score creators.', emoji: '🎮', grad: 'linear-gradient(135deg,#7C3AED 0%,#06B6D4 100%)' },
  { name: 'Canvas', niche: 'Art & Design', desc: 'Expressive type and a painterly palette for makers and artists.', emoji: '🎨', grad: 'linear-gradient(135deg,#EC4899 0%,#8B5CF6 100%)' },
]

// ---- Icons ----
const ic = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
const I = {
  link: (<svg {...ic}><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>),
  trash: (<svg {...ic}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>),
  phone: (<svg {...ic} width="16" height="16"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>),
  monitor: (<svg {...ic} width="16" height="16"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>),
  eye: (<svg {...ic} width="15" height="15"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>),
  save: (<svg {...ic} width="15" height="15"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>),
  plus: (<svg {...ic} width="15" height="15"><path d="M12 5v14M5 12h14" /></svg>),
  upload: (<svg {...ic} width="15" height="15"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>),
  lock: (<svg {...ic} width="13" height="13"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>),
  crown: (<svg {...ic} width="13" height="13" fill="currentColor" stroke="none"><path d="M3 7l4 4 5-6 5 6 4-4v11H3z" /></svg>),
  swap: (<svg {...ic} width="13" height="13"><path d="M7 10l-3 3 3 3M4 13h11M17 14l3-3-3-3M20 11H9" /></svg>),
  image: (<svg {...ic} width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.8" /><path d="m21 15-5-5L5 21" /></svg>),
  fetch: (<svg {...ic} width="14" height="14"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v4h-4" /></svg>),
  info: (<svg {...ic} width="15" height="15"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>),
  fb: (<svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.46-.13-2.43 0-4.1 1.49-4.1 4.22v2.2H7.7V13h2.74v8h3.06z" /></svg>),
}

// ---- Reusable controls ----
const inputStyle = { fontFamily: FONT, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)' }

function Label({ children }) {
  return <label className="block text-white/70 text-[13px] font-medium mb-2" style={{ fontFamily: FONT }}>{children}</label>
}
function Field({ label, children }) {
  return <div>{label && <Label>{label}</Label>}{children}</div>
}
function TextInput(props) {
  return <input {...props} className="w-full rounded-xl px-4 h-12 text-white text-[15px] outline-none focus:border-white/30 transition-colors placeholder:text-white/30" style={inputStyle} />
}
function SectionHead({ title, sub }) {
  return (
    <div className="mb-6">
      <h2 className="font-bold leading-none mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(26px,3vw,34px)' }}>{title}</h2>
      {sub && <p className="text-white/55 text-base" style={{ fontFamily: FONT }}>{sub}</p>}
    </div>
  )
}
function GhostBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 shrink-0" style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)' }}>
      {children}
    </button>
  )
}
function PurpleBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors shrink-0 hover:bg-[rgba(139,92,246,0.18)]" style={{ fontFamily: FONT, color: '#C4B5FD', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.5)' }}>
      {children}
    </button>
  )
}
const PANEL = { background: 'rgba(10,12,30,0.45)', border: '1px solid rgba(255,255,255,0.08)' }

// Small on/off switch (same pattern as the admin category toggles).
function MiniToggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
      style={{ background: on ? 'var(--theme-grad, linear-gradient(90deg,#7C5CFF,#9D7BFF))' : 'rgba(255,255,255,0.16)' }}
      title={on ? 'Shown on card' : 'Hidden from card'}
    >
      <span className="rounded-full bg-white" style={{ width: 18, height: 18, transform: on ? 'translateX(22px)' : 'translateX(3px)', transition: 'transform 0.2s' }} />
    </button>
  )
}

// ---- Live preview mockup (phone or laptop, per the device toggle) ----

// Fills the device's screen area with the real Influence Card (in an iframe) at
// a fixed logical viewport width, scaled to fit. The card scrolls inside.
function DeviceScreen({ logicalWidth, src }) {
  const ref = useRef(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = box.w ? box.w / logicalWidth : 0
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {scale > 0 && (
        <iframe
          src={src}
          id="creasume-preview-frame"
          title="Influence card live preview"
          className="device-preview-frame"
          style={{
            width: logicalWidth,
            height: box.h / scale,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      )}
    </div>
  )
}

function PhoneFrame({ src }) {
  return (
    <div
      className="relative"
      style={{ width: 300, aspectRatio: '9 / 19.3', borderRadius: 46, padding: 3, background: 'linear-gradient(150deg,#d8b878 0%,#8a6f3c 40%,#caa566 70%,#6f5a30 100%)', boxShadow: '0 30px 70px rgba(0,0,0,0.55)' }}
    >
      <div className="w-full h-full rounded-[43px] p-2" style={{ background: '#050608' }}>
        <div className="relative w-full h-full rounded-[36px] overflow-hidden" style={{ background: 'linear-gradient(180deg,#11142e 0%,#0a0c1f 100%)' }}>
          <DeviceScreen logicalWidth={390} src={src} />
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black z-10" style={{ width: 96, height: 26 }} />
        </div>
      </div>
    </div>
  )
}

function LaptopFrame({ src }) {
  return (
    <div className="w-full max-w-[460px]">
      <div className="relative mx-auto rounded-[14px] border-[6px] border-[#23262e] overflow-hidden" style={{ background: '#0a0c1f', aspectRatio: '16 / 10', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <DeviceScreen logicalWidth={1280} src={src} />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-16 h-2 rounded-b-lg bg-[#23262e] z-10" />
      </div>
      <div className="relative mx-auto h-2.5 rounded-b-xl" style={{ width: '116%', marginLeft: '-8%', background: 'linear-gradient(180deg,#c7ccd6,#8a909c)' }}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-20 h-1 rounded-b-md bg-[#6b7080]" />
      </div>
    </div>
  )
}

function LivePreview({ device, setDevice, deviceRef, src }) {
  return (
    <div className="pt-6 pb-4">
      {/* Header row above the frame — badge left, device toggle right (no overlap) */}
      <div className="flex items-center justify-between gap-3 mb-4 px-1">
        <span className="rounded-md px-2.5 py-1 text-[11px] font-semibold" style={{ fontFamily: MONO, color: '#fff', background: '#5B62E0' }}>Live Preview</span>
        <div ref={deviceRef} className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <button type="button" onClick={() => setDevice('phone')} className="grid place-items-center rounded-lg transition-colors" style={{ width: 32, height: 30, color: '#fff', background: device === 'phone' ? 'rgba(139,92,246,0.7)' : 'transparent' }}>{I.phone}</button>
          <button type="button" onClick={() => setDevice('desktop')} className="grid place-items-center rounded-lg transition-colors" style={{ width: 32, height: 30, color: '#fff', background: device === 'desktop' ? 'rgba(139,92,246,0.7)' : 'transparent' }}>{I.monitor}</button>
        </div>
      </div>
      <div className="flex justify-center">
        {device === 'desktop' ? <LaptopFrame src={src} /> : <PhoneFrame src={src} />}
      </div>
    </div>
  )
}

// ===== Profile tab (controlled by the parent) =====
function ProfilePanel({ profile, setProfile, socials, setSocials, username, avatarSrc, onSaveLinks }) {
  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }))
  const removeSocial = (key) => setSocials((s) => s.filter((x) => x.key !== key))
  const addSocial = () => setSocials((s) => [...s, { key: Date.now(), platform: '', url: '', enabled: true }])
  const updateSocial = (key, field, v) => setSocials((s) => s.map((x) => (x.key === key ? { ...x, [field]: v } : x)))
  const [savingLinks, setSavingLinks] = useState(false)
  const [linksMsg, setLinksMsg] = useState('')
  const saveLinks = async () => {
    if (savingLinks) return
    setSavingLinks(true)
    try { await onSaveLinks?.(); setLinksMsg('Saved ✓') }
    catch (e) { setLinksMsg(e.message || 'Save failed') }
    finally { setSavingLinks(false); setTimeout(() => setLinksMsg(''), 2400) }
  }
  return (
    <div className="flex flex-col gap-12">
      <section>
        <SectionHead title="Basic Info" sub="Update your photo and personal details." />
        {/* Upload card */}
        <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-6" style={PANEL}>
          <div className="shrink-0 rounded-full overflow-hidden bg-white/85" style={{ width: 96, height: 96 }}>
            {avatarSrc && <img src={avatarSrc} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="text-center sm:text-left">
            <div className="text-white font-bold text-xl" style={{ fontFamily: FONT }}>Profile Photo</div>
            <p className="mt-1 text-white/50 text-sm" style={{ fontFamily: FONT }}>Your photo syncs automatically from your connected Instagram account.</p>
            <p className="mt-3 text-white/35 text-[12px]" style={{ fontFamily: MONO }}>Reconnect Instagram from Settings → Platforms to refresh it.</p>
          </div>
        </div>
        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Display Name"><TextInput value={profile.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" /></Field>
          <Field label="Username">
            <div className="flex items-stretch h-12 rounded-xl overflow-hidden" style={inputStyle}>
              <span className="flex items-center px-3 text-white/45 text-[13px] border-r border-white/10 shrink-0 whitespace-nowrap" style={{ fontFamily: MONO }}>creasume.com/</span>
              <input
                value={username}
                readOnly
                title="Your username is synced from your connected Instagram account"
                className="flex-1 min-w-0 bg-transparent px-3 text-white/70 text-[15px] outline-none cursor-not-allowed"
                style={{ fontFamily: FONT }}
              />
            </div>
            <p className="mt-1.5 text-white/35 text-[12px]" style={{ fontFamily: FONT }}>
              Synced from your connected Instagram account.
            </p>
          </Field>
          <div className="md:col-span-2">
            <Field label="Bio">
              <textarea rows={3} value={profile.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Tell brands what you're about…" className="w-full rounded-xl px-4 py-3 text-white text-[15px] outline-none focus:border-white/30 transition-colors resize-none" style={inputStyle} />
            </Field>
          </div>
          <Field label="Location"><TextInput value={profile.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Mumbai, India" /></Field>
          <Field label="Niche"><TextInput value={profile.niche} onChange={(e) => set('niche', e.target.value)} placeholder="e.g. Lifestyle & Wellness" /></Field>
        </div>
      </section>

      <section>
        <SectionHead title="Social Links" sub="Add links to your other platforms. These show on your card's Professional Presence." />
        <div className="flex flex-col gap-3">
          {socials.map((s) => {
            const on = s.enabled !== false
            return (
              <div key={s.key} className="flex flex-wrap items-center gap-2.5 sm:gap-3 rounded-xl p-2.5 transition-opacity" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', opacity: on ? 1 : 0.5 }}>
                <span className="order-1 grid place-items-center rounded-lg shrink-0 text-white/60" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.06)' }}>{I.link}</span>
                <input value={s.platform} onChange={(e) => updateSocial(s.key, 'platform', e.target.value)} placeholder="Platform" className="order-2 flex-1 min-w-0 sm:flex-none sm:w-40 rounded-lg px-3 h-10 text-white text-[14px] outline-none" style={inputStyle} />
                {/* URL: own full-width line on phones, inline on sm+ */}
                <input value={s.url} onChange={(e) => updateSocial(s.key, 'url', e.target.value)} placeholder="https://" className="order-5 w-full sm:order-3 sm:w-auto sm:flex-1 min-w-0 rounded-lg px-3 h-10 text-white/80 text-[14px] outline-none" style={inputStyle} />
                {/* Show / hide this link on the card */}
                <span className="order-3 sm:order-4 shrink-0"><MiniToggle on={on} onChange={(v) => updateSocial(s.key, 'enabled', v)} /></span>
                <button type="button" onClick={() => removeSocial(s.key)} className="order-4 sm:order-5 grid place-items-center rounded-lg shrink-0 text-white/50 hover:text-[#FB7185] hover:bg-white/5 transition-colors" style={{ width: 40, height: 40 }}>{I.trash}</button>
              </div>
            )
          })}
          <button type="button" onClick={addSocial} className="inline-flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors" style={{ fontFamily: FONT, border: '1px dashed rgba(255,255,255,0.2)' }}>{I.plus} Add Link</button>
        </div>
        {/* Save the links so they appear on the public card */}
        <div className="flex items-center gap-3 mt-4">
          <button type="button" onClick={saveLinks} disabled={savingLinks} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ fontFamily: FONT, background: 'var(--theme-grad, linear-gradient(90deg,#7C5CFF,#C04DCC))' }}>
            {I.save} {savingLinks ? 'Saving…' : 'Save Links'}
          </button>
          {linksMsg && <span className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: linksMsg.includes('✓') ? '#4DE0B0' : '#FB7185' }}>{linksMsg}</span>}
        </div>
      </section>
    </div>
  )
}

// ===== Portfolio tab (Brand Collabs) — persists on add / remove =====
const EMPTY_COLLAB = { link: '', brand: '', overview: '', category: '', url: '', logo: '' }
function PortfolioPanel({ collabs, onAdd, onRemove }) {
  const [form, setForm] = useState(EMPTY_COLLAB)
  const [busy, setBusy] = useState(false)
  const [fetched, setFetched] = useState(null)   // SAVED metrics used by Add entry
  const [draft, setDraft] = useState(null)        // editable copy (inputs bind here)
  const [metricsSaved, setMetricsSaved] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchErr, setFetchErr] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Icon shown on the collab card. Defaults to the fetched Instagram post
  // thumbnail; uploading an image overrides it. We downscale to a 160×160 cover
  // JPEG so the stored data URL stays tiny (no upload server needed).
  const iconPreview = form.logo || fetched?.postImage || ''
  const onPickIcon = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const S = 160
        const canvas = document.createElement('canvas')
        canvas.width = S; canvas.height = S
        const ctx = canvas.getContext('2d')
        const scale = Math.max(S / img.width, S / img.height)
        const w = img.width * scale, h = img.height * scale
        ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h)
        set('logo', canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  // Pull live per-post metrics for the pasted Instagram link (must be one of the
  // creator's own posts). Pre-fills the overview from the caption if empty.
  const doFetch = async () => {
    const url = form.link.trim()
    if (!url || fetching) return
    setFetching(true)
    setFetchErr('')
    setFetched(null)
    try {
      const res = await fetchCollabMetrics(url)
      const post = res.post || null
      // Pull metrics + thumbnail only. Campaign overview is written manually,
      // so we never auto-fill it from the post caption.
      setFetched(post)
      setDraft(post)            // editable copy
      setMetricsSaved(true)     // freshly fetched values are already "saved"
      // Auto-fill the "Link" field with the resolved Instagram post URL.
      const postUrl = post?.instagramUrl || post?.permalink || url
      if (postUrl) set('url', postUrl)
    } catch (e) {
      setFetchErr(e.message || 'Could not fetch this post.')
    } finally {
      setFetching(false)
    }
  }

  const addEntry = async () => {
    if (!form.brand.trim() || busy) return
    setBusy(true)
    try {
      await onAdd(form, fetched)
      setForm(EMPTY_COLLAB)
      setFetched(null)
      setDraft(null)
      setMetricsSaved(false)
      setFetchErr('')
    } finally {
      setBusy(false)
    }
  }

  // Metrics become editable after a fetch — so the creator can correct numbers
  // the organic insights miss (e.g. promoted/boosted reach & impressions). Edits
  // go to `draft`; they only apply to the entry after Save (commits draft →
  // fetched).
  const METRIC_FIELDS = [['reach', 'Reach'], ['views', 'Views'], ['likes', 'Likes'], ['comments', 'Comments'], ['engagementRate', 'ER %']]
  const setMetric = (k, v) => {
    setDraft((d) => ({ ...d, [k]: v === '' ? '' : Number(v) }))
    setMetricsSaved(false)
  }
  const metricsDirty = !!draft && !!fetched &&
    METRIC_FIELDS.some(([k]) => Number(draft[k] || 0) !== Number(fetched[k] || 0))
  const saveMetrics = () => {
    setFetched((f) => ({ ...f, ...draft }))
    setMetricsSaved(true)
  }

  return (
    <section>
      <SectionHead title="Brand Collabs" sub="Showcase your best sponsored content. Added collabs appear on your card." />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-6 items-start">
        {/* Left: add-collaboration form */}
        <div className="rounded-2xl p-6" style={PANEL}>
          <h3 className="text-white font-bold text-lg mb-5" style={{ fontFamily: FONT }}>Add collaboration</h3>

          <Field label="Instagram collab post link">
            <div className="flex items-stretch gap-2">
              <input value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://instagram.com/p/…" className="flex-1 min-w-0 rounded-xl px-4 h-12 text-white text-[15px] outline-none focus:border-white/30 transition-colors placeholder:text-white/30" style={inputStyle} />
              <GhostBtn onClick={doFetch}>{I.fetch} {fetching ? 'Fetching…' : 'Fetch'}</GhostBtn>
            </div>
          </Field>
          <p className="mt-2 mb-3 text-white/40 text-[12px] leading-relaxed" style={{ fontFamily: FONT }}>
            Must be one of your own posts — insights aren't available for other accounts.
          </p>

          {/* Promoted-reel note + Meta (Facebook) connect. Shown only AFTER a
              fetch — paid reach/impressions come through the Meta API (Facebook
              login); before fetching there's nothing to act on. */}
          {fetched && (
          <div className="mb-4 rounded-xl p-3" style={{ background: 'rgba(24,119,242,0.07)', border: '1px solid rgba(24,119,242,0.32)' }}>
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5 text-[#4D9BFF]">{I.info}</span>
              <div className="min-w-0">
                <p className="text-white/75 text-[12.5px] leading-relaxed" style={{ fontFamily: FONT }}>
                  <span className="font-semibold text-white">Promoted or boosted reel?</span> Exact paid reach &amp; impressions only come from Meta. Connect Facebook (the same Meta login behind your Instagram) so we can pull the real promoted numbers — otherwise only organic insights show, which you can still edit by hand below.
                </p>
                <a href={facebookLoginUrl()} className="mt-2.5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white no-underline transition-opacity hover:opacity-90" style={{ fontFamily: FONT, background: '#1877F2' }}>
                  {I.fb} Connect Facebook (Meta)
                </a>
              </div>
            </div>
          </div>
          )}

          {fetchErr && (
            <p className="mb-4 text-[12px] leading-relaxed" style={{ fontFamily: FONT, color: '#FB7185' }}>{fetchErr}</p>
          )}
          {fetched && (
            <div className="mb-5 rounded-xl p-3.5" style={{ background: 'rgba(77,224,176,0.06)', border: '1px solid rgba(77,224,176,0.3)' }}>
              <div className="flex items-center gap-3 mb-3">
                {fetched.postImage && <img src={fetched.postImage} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="text-[#4DE0B0] text-[12px] font-semibold" style={{ fontFamily: MONO }}>Post metrics fetched ✓</div>
                  <div className="text-white/45 text-[11px] leading-snug" style={{ fontFamily: FONT }}>Edit any value if it's off — e.g. promoted reach.</div>
                </div>
                {/* Save the edited metrics — only saved values are added to the card. */}
                <button
                  type="button"
                  onClick={saveMetrics}
                  disabled={!metricsDirty}
                  title="Save edited metrics"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:cursor-default"
                  style={{
                    fontFamily: FONT,
                    color: metricsDirty ? '#fff' : '#4DE0B0',
                    background: metricsDirty ? 'rgba(255,255,255,0.1)' : 'rgba(77,224,176,0.14)',
                    border: `1px solid ${metricsDirty ? 'rgba(255,255,255,0.18)' : 'rgba(77,224,176,0.4)'}`,
                  }}
                >
                  {I.save} {metricsDirty ? 'Save' : (metricsSaved ? 'Saved' : 'Save')}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {METRIC_FIELDS.map(([k, label]) => (
                  <label key={k} className="flex flex-col gap-1">
                    <span className="text-white/45 text-[10px] tracking-wide uppercase" style={{ fontFamily: MONO }}>{label}</span>
                    <input type="number" min="0" value={draft?.[k] ?? ''} onChange={(e) => setMetric(k, e.target.value)} className="rounded-lg px-2.5 h-9 text-white text-[13px] outline-none focus:border-white/30 transition-colors" style={inputStyle} />
                  </label>
                ))}
              </div>
              {metricsDirty && (
                <p className="mt-2 text-[11px]" style={{ fontFamily: FONT, color: '#F4C13B' }}>Unsaved edits — click Save to apply them to the collab.</p>
              )}
            </div>
          )}

          <div className="mb-5"><Field label="Brand / Campaign name"><TextInput value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Summer Escapes" /></Field></div>

          {/* Collab icon — defaults to the Instagram thumbnail, optional override */}
          <div className="mb-5">
            <Label>Collab icon</Label>
            <div className="flex items-center gap-3">
              <div className="shrink-0 grid place-items-center rounded-xl overflow-hidden" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {iconPreview
                  ? <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white/35 text-[10px] text-center px-1" style={{ fontFamily: MONO }}>No icon</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-white/80 hover:bg-white/5 transition-colors" style={{ fontFamily: FONT, border: '1px solid rgba(255,255,255,0.18)' }}>
                  {I.upload} {form.logo ? 'Change icon' : 'Upload icon'}
                  <input type="file" accept="image/*" className="sr-only" onChange={onPickIcon} />
                </label>
                {form.logo && (
                  <button type="button" onClick={() => set('logo', '')} className="text-[12px] text-white/45 hover:text-white text-left transition-colors" style={{ fontFamily: FONT }}>
                    Reset to Instagram thumbnail
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-white/40 text-[12px] leading-relaxed" style={{ fontFamily: FONT }}>Defaults to your Instagram post thumbnail. Upload a brand logo to override it.</p>
          </div>
          <div className="mb-5">
            <Field label="Campaign overview">
              <textarea rows={3} value={form.overview} onChange={(e) => set('overview', e.target.value)} placeholder="Write a short summary of this collaboration…" className="w-full rounded-xl px-4 py-3 text-white text-[15px] outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/30" style={inputStyle} />
            </Field>
          </div>
          <div className="mb-5"><Field label="Category"><TextInput value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Travel" /></Field></div>
          <div className="mb-6"><Field label="Link"><TextInput value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://…" /></Field></div>

          <button type="button" onClick={addEntry} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60" style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)' }}>
            {I.plus} {busy ? 'Adding…' : 'Add entry'}
          </button>
        </div>

        {/* Right: collaborations list */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4" style={{ fontFamily: FONT }}>Collaborations ({collabs.length})</h3>
          {collabs.length === 0 ? (
            <div className="rounded-2xl grid place-items-center text-white/40 text-[15px] px-6 text-center" style={{ ...PANEL, minHeight: 180, fontFamily: FONT }}>
              No collaborations added yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {collabs.map((c) => (
                <div key={c.id} className="rounded-2xl p-4 flex items-start gap-4" style={PANEL}>
                  {c.image ? (
                    <img src={c.image} alt="" className="rounded-lg shrink-0 object-cover" style={{ width: 56, height: 56 }} />
                  ) : (
                    <span className="grid place-items-center rounded-lg shrink-0 text-white/45" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.06)' }}>{I.image}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-[15px] truncate" style={{ fontFamily: FONT }}>{c.brand}</span>
                      {c.category && <span className="text-[11px] px-2 py-0.5 rounded-full text-white/70" style={{ background: 'rgba(255,255,255,0.08)', fontFamily: MONO }}>{c.category}</span>}
                    </div>
                    {c.overview && <p className="text-white/50 text-[13px] mt-1 line-clamp-2" style={{ fontFamily: FONT }}>{c.overview}</p>}
                    {c.reach > 0 && <span className="text-white/45 text-[12px] mt-1 inline-block" style={{ fontFamily: MONO }}>Reach: {Number(c.reach).toLocaleString()}</span>}
                    {c.url && <span className="text-[#9C7CF0] text-[12px] mt-1 block truncate max-w-full" style={{ fontFamily: MONO }}>{c.url}</span>}
                  </div>
                  <button type="button" onClick={() => onRemove(c)} className="grid place-items-center rounded-lg shrink-0 text-white/50 hover:text-[#FB7185] hover:bg-white/5 transition-colors" style={{ width: 40, height: 40 }}>{I.trash}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ===== Packages tab (controlled; persisted on Save / remove) =====
const TIER_OPTIONS = ['Starter', 'Campaign', 'Core', 'Growth', 'Premium']

function Toggle({ on, onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 mt-1">
      <span className="relative inline-flex rounded-full transition-colors shrink-0" style={{ width: 44, height: 24, background: on ? '#8B5CF6' : 'rgba(255,255,255,0.18)' }}>
        <span className="absolute rounded-full bg-white transition-all" style={{ width: 20, height: 20, top: 2, left: on ? 22 : 2 }} />
      </span>
      <span className="text-white text-[14px] font-medium" style={{ fontFamily: FONT }}>{label}</span>
    </button>
  )
}

function PackagesPanel({ pkgs, setPkgs, onRemove, onSave }) {
  const update = (id, k, v) => setPkgs((p) => p.map((x) => (x.id === id ? { ...x, [k]: v } : x)))
  const setPopular = (id) => setPkgs((p) => p.map((x) => ({ ...x, isPopular: x.id === id ? !x.isPopular : false })))
  const addTier = () => setPkgs((p) => (p.length >= 3 ? p : [...p, { id: `tmp-${Date.now()}`, _id: null, tier: 'Starter', price: '0', deliverables: '', revisions: '1', isPopular: false }]))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const save = async () => {
    if (saving) return
    setSaving(true)
    try { await onSave?.(); setMsg('Saved ✓') }
    catch (e) { setMsg(e.message || 'Save failed') }
    finally { setSaving(false); setTimeout(() => setMsg(''), 2400) }
  }
  return (
    <section>
      <div className="flex items-start justify-between gap-4 mb-2">
        <SectionHead title="Services & Packages" sub="Configure deliverables, pricing and revision rounds. Up to 3 tiers. Click Save Changes to publish." />
        <PurpleBtn onClick={addTier}>{I.plus} Add tier</PurpleBtn>
      </div>
      {/* Mobile: one horizontal scrolling line of tier cards (side by side).
          md+: a 2 / 3-column grid. */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-[10%] md:px-0 pb-2 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pkgs.map((p) => (
          <div key={p.id} className="rounded-2xl p-5 flex flex-col gap-4 shrink-0 w-[80%] sm:w-[330px] md:w-auto snap-center" style={{ background: 'rgba(10,12,30,0.55)', border: p.isPopular ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between gap-3">
              <select value={p.tier} onChange={(e) => update(p.id, 'tier', e.target.value)} className="rounded-xl px-3 h-11 text-white text-[15px] font-semibold outline-none cursor-pointer" style={{ ...inputStyle, fontFamily: FONT }}>
                {TIER_OPTIONS.map((t) => <option key={t} value={t} style={{ color: '#000' }}>{t}</option>)}
              </select>
              <button type="button" onClick={() => onRemove(p)} className="text-[13px] font-semibold text-[#FB7185] hover:text-[#f43f5e] transition-colors px-2 py-1" style={{ fontFamily: FONT }}>Remove</button>
            </div>
            <Field label="Price (₹)">
              <input type="number" value={p.price} onChange={(e) => update(p.id, 'price', e.target.value)} className="w-full rounded-xl px-4 h-12 text-white text-[15px] outline-none focus:border-white/30 transition-colors" style={inputStyle} />
            </Field>
            <Field label="Deliverables">
              <textarea rows={3} value={p.deliverables} onChange={(e) => update(p.id, 'deliverables', e.target.value)} placeholder="e.g. 1 Reel, 2 Stories" className="w-full rounded-xl px-4 py-3 text-white text-[15px] outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/30" style={inputStyle} />
            </Field>
            <Field label="Revision rounds">
              <input type="number" value={p.revisions} onChange={(e) => update(p.id, 'revisions', e.target.value)} className="w-full rounded-xl px-4 h-12 text-white text-[15px] outline-none focus:border-white/30 transition-colors" style={inputStyle} />
            </Field>
            <Toggle on={p.isPopular} onClick={() => setPopular(p.id)} label="Mark as Most Popular" />
          </div>
        ))}
      </div>
      {/* Save packages so they appear on the public card / preview */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ fontFamily: FONT, background: 'var(--theme-grad, linear-gradient(90deg,#7C5CFF,#C04DCC))' }}>
          {I.save} {saving ? 'Saving…' : 'Save Packages'}
        </button>
        {msg && <span className="text-[13px] font-semibold" style={{ fontFamily: FONT, color: msg.includes('✓') ? '#4DE0B0' : '#FB7185' }}>{msg}</span>}
      </div>
    </section>
  )
}

// ===== Design tab (controlled) =====
function HexField({ label, value, onPick }) {
  return (
    <div>
      <Label>{label}</Label>
      <label className="flex items-center gap-3 rounded-xl px-3 h-14 cursor-pointer" style={inputStyle}>
        <span className="rounded-lg shrink-0" style={{ width: 36, height: 36, background: value }} />
        <span className="text-white/45 text-[15px]" style={{ fontFamily: MONO }}>#</span>
        <span className="text-white text-[15px] tracking-wide" style={{ fontFamily: MONO }}>{value.replace('#', '').toUpperCase()}</span>
        <input type="color" value={value} onChange={(e) => onPick(e.target.value)} className="sr-only" />
      </label>
    </div>
  )
}

function DesignPanel({ theme, setTheme }) {
  const set = (k, v) => setTheme((t) => ({ ...t, [k]: v }))
  const primary = theme.primary
  const secondary = theme.secondary
  const accentBg = `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`
  return (
    <section className="max-w-3xl mx-auto text-center">
      <SectionHead title="Theme & Design" sub="Customize how your Influence Card looks." />

      <Label>Accent Colour</Label>
      <div className="rounded-2xl h-16 grid place-items-center mb-5" style={{ background: accentBg }}>
        <span className="text-white text-[13px] font-semibold tracking-wide" style={{ fontFamily: MONO }}>Card accent preview</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <HexField label="Primary" value={primary} onPick={(v) => set('primary', v)} />
        <HexField label="Secondary (gradient end)" value={secondary} onPick={(v) => set('secondary', v)} />
      </div>
      <button type="button" onClick={() => set('secondary', primary)} className="inline-flex items-center gap-2 mt-3 text-white/55 text-[13px] hover:text-white transition-colors" style={{ fontFamily: FONT }}>
        {I.swap} Use a single solid colour
      </button>

      <div className="mt-7 mb-2"><Label>Quick colours</Label></div>
      <div className="flex flex-wrap justify-center gap-3 mb-7">
        {QUICK_COLOURS.map((c) => (
          <button key={c} type="button" onClick={() => setTheme((t) => ({ ...t, primary: c, secondary: c }))} aria-label={c} className="rounded-full transition-transform hover:scale-110" style={{ width: 34, height: 34, background: c, border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.3)' : 'none', outline: primary === c && secondary === c ? '2px solid #fff' : 'none', outlineOffset: 2 }} />
        ))}
      </div>

      <Label>Gradient presets</Label>
      <div className="flex flex-wrap justify-center gap-3 mb-9">
        {GRADIENT_PRESETS.map(([a, b]) => (
          <button key={a + b} type="button" onClick={() => setTheme((t) => ({ ...t, primary: a, secondary: b }))} className="rounded-xl transition-transform hover:scale-105" style={{ width: 66, height: 40, background: `linear-gradient(90deg, ${a}, ${b})`, outline: primary === a && secondary === b ? '2px solid #fff' : 'none', outlineOffset: 2 }} />
        ))}
      </div>

      <Label>Background Style</Label>
      <div className="grid grid-cols-2 gap-4 mb-9">
        {BG_STYLES.map((b) => (
          <button key={b.key} type="button" onClick={() => set('bg', b.key)} className="rounded-2xl h-32 grid place-items-center text-white/80 text-sm font-medium transition-all" style={{ fontFamily: FONT, background: b.bg, border: theme.bg === b.key ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.12)' }}>
            {b.label}
          </button>
        ))}
      </div>

      <Label>Font Pairing</Label>
      <div className="flex flex-col gap-3 mb-12">
        {FONTS.map((f) => (
          <button key={f.key} type="button" onClick={() => set('font', f.key)} className="text-left rounded-xl px-5 py-4 transition-colors" style={{ background: theme.font === f.key ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.3)', border: theme.font === f.key ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.12)' }}>
            <div className="text-white font-semibold text-[15px]" style={{ fontFamily: FONT }}>{f.name}</div>
            <div className="text-white/45 text-[12px] mt-0.5" style={{ fontFamily: FONT }}>{f.desc}</div>
          </button>
        ))}
      </div>

      {/* Premium niche themes */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-white font-bold text-2xl flex items-center gap-2" style={{ fontFamily: FONT }}>Niche Design Themes <span>✨</span></h3>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold shrink-0" style={{ fontFamily: FONT, color: '#F4C13B', background: 'rgba(244,193,59,0.1)', border: '1px solid rgba(244,193,59,0.4)' }}>{I.crown} Premium</span>
      </div>
      <p className="text-white/55 text-sm mb-6" style={{ fontFamily: FONT }}>
        Hand-crafted looks tuned to your niche. Unlock any design for just <span className="text-white font-semibold">₹50/month</span> each — it instantly restyles your whole card.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {NICHE_THEMES.map((t) => (
          <div key={t.name} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="relative h-28 grid place-items-center" style={{ background: t.grad }}>
              <span className="absolute top-2.5 right-2.5 grid place-items-center rounded-full text-white/90" style={{ width: 26, height: 26, background: 'rgba(0,0,0,0.35)' }}>{I.lock}</span>
              <div className="text-center">
                <div className="text-2xl leading-none mb-1">{t.emoji}</div>
                <div className="text-white font-extrabold text-lg drop-shadow" style={{ fontFamily: FONT }}>{t.name}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="text-white font-semibold text-sm" style={{ fontFamily: FONT }}>{t.niche}</div>
              <p className="mt-1 text-white/45 text-[12px] leading-relaxed min-h-[48px]" style={{ fontFamily: FONT }}>{t.desc}</p>
              <button type="button" className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-95" style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)' }}>
                {I.lock} Unlock · ₹50/mo
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---- mappers: backend record <-> editor row ----
const DEFAULT_THEME = { primary: '#8B5CF6', secondary: '#8B5CF6', bg: 'solid', font: 'outfit' }
function parseTheme(raw) {
  if (!raw) return { ...DEFAULT_THEME }
  try {
    const t = JSON.parse(raw)
    return { ...DEFAULT_THEME, ...t }
  } catch {
    return { ...DEFAULT_THEME }
  }
}
const mapPkg = (p) => p && {
  id: p._id,
  _id: p._id,
  tier: p.title || 'Starter',
  price: String(p.pricing ?? '0'),
  deliverables: Array.isArray(p.deliverables) ? p.deliverables.join(', ') : (p.deliverables || ''),
  revisions: String(p.revisions ?? '1'),
  isPopular: Boolean(p.isPopular),
}
const mapCollab = (c) => c && {
  id: c._id,
  _id: c._id,
  brand: c.brandName || '',
  overview: c.description || '',
  category: c.category || '',
  url: c.link || '',
  image: c.postImage || c.campaignImage || c.logo || '',
  reach: c.reach || 0,
}

export default function EditProfileView({ creator = {}, username = '', onSaved, saveSignal = 0 }) {
  const [tab, setTab] = useState('Profile')
  const [device, setDevice] = useState('phone')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [previewKey, setPreviewKey] = useState(0)

  // Controlled form state, seeded from the creator record.
  const [profile, setProfile] = useState({ name: '', bio: '', niche: '', location: '' })
  const [socials, setSocials] = useState([])
  const [theme, setTheme] = useState({ ...DEFAULT_THEME })
  const [pkgs, setPkgs] = useState([])
  const [collabs, setCollabs] = useState([])

  // Guided tour for the editor (tabs → device toggle → save).
  const [showTour, setShowTour] = useState(false)
  const tabsRef = useRef(null)
  const deviceRef = useRef(null)
  const saveRef = useRef(null)
  // Shown ONCE ever (first time the editor is opened). The flag persists in
  // localStorage across sessions on this browser.
  useEffect(() => {
    try {
      if (!localStorage.getItem('creasume_tour_edit')) setShowTour(true)
    } catch { /* storage unavailable → just don't auto-show */ }
  }, [])
  const finishEditTour = () => {
    setShowTour(false)
    try { localStorage.setItem('creasume_tour_edit', '1') } catch { /* ignore */ }
  }
  const tourSteps = [
    { ref: tabsRef, title: 'Navigate Sections', desc: 'Switch between profile details, your portfolio, and custom packages.' },
    { ref: deviceRef, title: 'Toggle Preview', desc: 'Check how your card looks on mobile and desktop instantly.' },
    { ref: saveRef, title: 'Save & Publish', desc: "Don't forget to save your changes to update your live link." },
  ]

  const handle = creator.username || username || ''
  const previewSrc = handle ? `/${encodeURIComponent(handle)}?preview=${previewKey}` : `/?preview=${previewKey}`
  const avatarSrc = handle ? `${API_BASE}/public/avatar/${encodeURIComponent(handle)}` : ''

  // Seed Profile / Design from the creator prop.
  useEffect(() => {
    setProfile({
      name: creator.name || '',
      bio: creator.bio || '',
      niche: creator.niche || '',
      location: creator.location || '',
    })
    const links = Array.isArray(creator.socialLinks) ? creator.socialLinks : []
    setSocials(links.map((l, i) => ({ key: i + 1, platform: l.platform || '', url: l.url || '', enabled: l.enabled !== false })))
    setTheme(parseTheme(creator.theme))
  }, [creator])

  // Load the creator's existing packages + collaborations.
  useEffect(() => {
    if (!isLoggedIn()) return
    let alive = true
    fetchMyPackages().then((r) => { if (alive) setPkgs((r?.packages || []).map(mapPkg).filter(Boolean)) }).catch(() => {})
    fetchMyCollaborations().then((r) => { if (alive) setCollabs((r?.collaborations || []).map(mapCollab).filter(Boolean)) }).catch(() => {})
    return () => { alive = false }
  }, [])

  const flash = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(''), 2200) }

  // ---- Live preview sync ----
  // Push the CURRENT (unsaved) edits into the preview iframe via postMessage, so
  // the card restyles/updates instantly as you type or pick a colour — no save
  // needed. Re-posts whenever the edits change or the iframe (re)loads & signals
  // it's ready.
  useEffect(() => {
    const payload = { theme, profile }
    const post = () => {
      document
        .getElementById('creasume-preview-frame')
        ?.contentWindow?.postMessage({ source: 'creasume-edit', payload }, '*')
    }
    post()
    const onReady = (e) => { if (e.data?.source === 'creasume-preview-ready') post() }
    window.addEventListener('message', onReady)
    return () => window.removeEventListener('message', onReady)
  }, [theme, profile])

  // ---- Persistence ----
  const saveProfile = async () => {
    await updateProfile({
      name: profile.name,
      bio: profile.bio,
      niche: profile.niche,
      location: profile.location,
      theme: JSON.stringify(theme),
      socialLinks: socials
        .filter((s) => s.platform.trim() && s.url.trim())
        .map((s) => ({ platform: s.platform.trim(), url: s.url.trim(), enabled: s.enabled !== false })),
    })
  }

  // Save just the social links (used by the "Save Links" button in the Profile
  // tab) and refresh the preview so they appear on the card.
  const saveLinks = async () => {
    await saveProfile()
    setPreviewKey((k) => k + 1)
    onSaved?.()
  }

  const savePackages = async () => {
    for (const p of pkgs) {
      const body = {
        title: p.tier,
        pricing: Number(p.price) || 0,
        deliverables: String(p.deliverables || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean),
        revisions: Number(p.revisions) || 0,
        isPopular: Boolean(p.isPopular),
      }
      if (p._id) await updatePackage(p._id, body)
      else await createPackage(body)
    }
    const r = await fetchMyPackages()
    setPkgs((r?.packages || []).map(mapPkg).filter(Boolean))
  }

  // Save packages + refresh the preview (used by the in-section "Save Packages").
  const savePackagesAndPreview = async () => {
    await savePackages()
    setPreviewKey((k) => k + 1)
    onSaved?.()
  }

  const onSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      if (tab === 'Packages') await savePackages()
      else await saveProfile() // Profile + Design both write the creator record
      setPreviewKey((k) => k + 1)
      onSaved?.()
      flash('Saved ✓')
    } catch (e) {
      flash(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // The mobile top-bar Save button lives in the parent dashboard; it bumps
  // `saveSignal` to trigger a save here. Skip the initial 0.
  useEffect(() => {
    if (saveSignal > 0) onSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveSignal])

  // ---- Portfolio actions (persist immediately) ----
  const addCollab = async (form, fetched) => {
    const body = {
      brandName: form.brand,
      description: form.overview,
      category: form.category,
      link: form.url,
      instagramUrl: fetched?.instagramUrl || form.link,
      // Custom icon override; when empty the card falls back to the IG thumbnail.
      ...(form.logo ? { logo: form.logo } : {}),
    }
    // Carry the fetched per-post metrics through so they show on the card.
    if (fetched) {
      Object.assign(body, {
        mediaId: fetched.mediaId,
        mediaType: fetched.mediaType,
        postImage: fetched.postImage,
        postCaption: fetched.postCaption,
        // Coerce — these may have been hand-edited (string inputs) before save.
        reach: Number(fetched.reach) || 0,
        views: Number(fetched.views) || 0,
        likes: Number(fetched.likes) || 0,
        comments: Number(fetched.comments) || 0,
        saves: Number(fetched.saves) || 0,
        shares: Number(fetched.shares) || 0,
        engagementRate: Number(fetched.engagementRate) || 0,
        metricsFetchedAt: fetched.metricsFetchedAt,
      })
    }
    const r = await createCollaboration(body)
    const mapped = mapCollab(r?.collaboration)
    if (mapped) setCollabs((c) => [...c, mapped])
    setPreviewKey((k) => k + 1)
    onSaved?.()
  }
  const removeCollab = async (c) => {
    if (c._id) await deleteCollaboration(c._id)
    setCollabs((list) => list.filter((x) => x.id !== c.id))
    setPreviewKey((k) => k + 1)
    onSaved?.()
  }
  const removePkg = async (p) => {
    if (p._id) await deletePackage(p._id)
    setPkgs((list) => list.filter((x) => x.id !== p.id))
  }

  return (
    <>
      {showTour && <DashboardTour steps={tourSteps} onDone={finishEditTour} />}
      {/* Header: row 1 = title + Preview; row 2 = tabs (menu) + Save icon on the right */}
      <header className="px-4 sm:px-6 md:px-10 py-4 flex flex-col gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Title + Preview together */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-wrap">
          <h1 className="font-bold text-2xl sm:text-3xl whitespace-nowrap shrink-0" style={{ fontFamily: FONT }}>Edit Influence Card</h1>
          <a href={handle ? `/${handle}` : '/'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 ml-12 text-[13px] font-semibold text-[#11132f] transition-opacity hover:opacity-90 no-underline shrink-0" style={{ fontFamily: FONT, background: '#fff' }}>{I.eye} Preview</a>
        </div>
        {/* Tabs (menu) row — Save icon pinned to the right end */}
        <div className="flex items-center gap-3">
          <nav ref={tabsRef} className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => {
              const active = tab === t
              return (
                <button key={t} type="button" onClick={() => setTab(t)} className="rounded-lg px-3 sm:px-4 py-2 text-[14px] font-medium transition-colors whitespace-nowrap shrink-0" style={{ fontFamily: FONT, color: active ? '#fff' : 'rgba(255,255,255,0.6)', background: active ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                  {t}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {savedMsg && <span className="text-[13px] font-semibold whitespace-nowrap" style={{ fontFamily: FONT, color: savedMsg.includes('✓') ? '#4DE0B0' : '#FB7185' }}>{savedMsg}</span>}
            {/* Hidden on mobile — the dashboard's top bar carries Save there. */}
            <button ref={saveRef} type="button" onClick={onSave} disabled={saving} title="Save Changes" aria-label="Save Changes" className="hidden md:inline-flex items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ width: 40, height: 40, background: 'var(--theme-grad, linear-gradient(90deg,#7C5CFF,#C04DCC))' }}>{I.save}</button>
          </div>
        </div>
      </header>

      {/* Content with the blue editor gradient backdrop */}
      <div style={{ background: 'radial-gradient(110% 80% at 50% 0%, #1c277a 0%, #121845 38%, #0a0c1f 80%)' }}>
        <div className="px-4 sm:px-6 md:px-16 lg:px-24 pb-16">
          <LivePreview device={device} setDevice={setDevice} deviceRef={deviceRef} src={previewSrc} />
          <div className="pt-8">
            {tab === 'Profile' && <ProfilePanel profile={profile} setProfile={setProfile} socials={socials} setSocials={setSocials} username={handle} avatarSrc={avatarSrc} onSaveLinks={saveLinks} />}
            {tab === 'Portfolio' && <PortfolioPanel collabs={collabs} onAdd={addCollab} onRemove={removeCollab} />}
            {tab === 'Packages' && <PackagesPanel pkgs={pkgs} setPkgs={setPkgs} onRemove={removePkg} onSave={savePackagesAndPreview} />}
            {tab === 'Design' && <DesignPanel theme={theme} setTheme={setTheme} />}
          </div>
        </div>
      </div>
    </>
  )
}

// Edit Influence Card — the creator editor (Profile / Portfolio / Packages /
// Design tabs) with a live-preview mockup and a save bar. Static sample state
// for now; wire to the backend later. Rendered inside InfluenceDashboard's main
// column (the sidebar + Creasume logo come from there).
import { useState, useRef, useLayoutEffect } from 'react'
import { FONT, MONO } from '../influence/influenceData.js'

// The creator's real Influence Card route, loaded inside the preview frames.
// Using an iframe gives each frame its own viewport, so the card lays out as a
// true mobile view (phone frame) or desktop view (laptop frame).
const PREVIEW_SRC = '/hetvipatel'

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

// ---- Live preview mockup (phone or laptop, per the device toggle) ----

// Fills the device's screen area with the real Influence Card (in an iframe) at
// a fixed logical viewport width, scaled to fit. The card scrolls inside.
function DeviceScreen({ logicalWidth }) {
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
          src={PREVIEW_SRC}
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

function PhoneFrame() {
  return (
    // Titanium/gold edge → black bezel → dark screen, with a dynamic-island pill.
    <div
      className="relative"
      style={{ width: 300, aspectRatio: '9 / 19.3', borderRadius: 46, padding: 3, background: 'linear-gradient(150deg,#d8b878 0%,#8a6f3c 40%,#caa566 70%,#6f5a30 100%)', boxShadow: '0 30px 70px rgba(0,0,0,0.55)' }}
    >
      <div className="w-full h-full rounded-[43px] p-2" style={{ background: '#050608' }}>
        <div className="relative w-full h-full rounded-[36px] overflow-hidden" style={{ background: 'linear-gradient(180deg,#11142e 0%,#0a0c1f 100%)' }}>
          {/* Real influence card at a phone viewport width */}
          <DeviceScreen logicalWidth={390} />
          {/* Dynamic island */}
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black z-10" style={{ width: 96, height: 26 }} />
        </div>
      </div>
    </div>
  )
}

function LaptopFrame() {
  return (
    <div className="w-full max-w-[460px]">
      <div className="relative mx-auto rounded-[14px] border-[6px] border-[#23262e] overflow-hidden" style={{ background: '#0a0c1f', aspectRatio: '16 / 10', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        {/* Real influence card at a desktop viewport width, scaled to fit */}
        <DeviceScreen logicalWidth={1280} />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-16 h-2 rounded-b-lg bg-[#23262e] z-10" />
      </div>
      <div className="relative mx-auto h-2.5 rounded-b-xl" style={{ width: '116%', marginLeft: '-8%', background: 'linear-gradient(180deg,#c7ccd6,#8a909c)' }}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-20 h-1 rounded-b-md bg-[#6b7080]" />
      </div>
    </div>
  )
}

function LivePreview({ device }) {
  return (
    <div className="relative flex justify-center pt-8 pb-4">
      <span className="absolute left-2 top-4 z-10 rounded-md px-2.5 py-1 text-[11px] font-semibold" style={{ fontFamily: MONO, color: '#fff', background: '#5B62E0' }}>Live Preview</span>
      {device === 'desktop' ? <LaptopFrame /> : <PhoneFrame />}
    </div>
  )
}

// ===== Profile tab =====
function ProfilePanel() {
  const [socials, setSocials] = useState([
    { id: 1, platform: 'Instagram', url: 'https://instagram.com/democreator' },
    { id: 2, platform: 'YouTube', url: 'https://youtube.com/@democreator' },
  ])
  const removeSocial = (id) => setSocials((s) => s.filter((x) => x.id !== id))
  const addSocial = () => setSocials((s) => [...s, { id: Date.now(), platform: '', url: '' }])
  return (
    <div className="flex flex-col gap-12">
      <section>
        <SectionHead title="Basic Info" sub="Update your photo and personal details." />
        {/* Upload card */}
        <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-6" style={PANEL}>
          <div className="shrink-0 rounded-full bg-white/85" style={{ width: 96, height: 96 }} />
          <div className="text-center sm:text-left">
            <div className="text-white font-bold text-xl" style={{ fontFamily: FONT }}>Upload Profile Photo</div>
            <p className="mt-1 text-white/50 text-sm" style={{ fontFamily: FONT }}>Drag and drop your image here, or click to browse.</p>
            <GhostBtn>{I.upload} Browse Files</GhostBtn>
            <p className="mt-3 text-white/35 text-[12px]" style={{ fontFamily: MONO }}>Recommended: Square, at least 400x400px (JPG, PNG)</p>
          </div>
        </div>
        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Display Name"><TextInput defaultValue="Hetvi Patel" /></Field>
          <Field label="Username">
            <div className="flex items-stretch rounded-xl overflow-hidden" style={inputStyle}>
              <span className="grid place-items-center px-3 text-white/45 text-[13px] border-r border-white/10" style={{ fontFamily: MONO }}>creasume.com/</span>
              <input defaultValue="hetvipatel" className="flex-1 min-w-0 bg-transparent px-3 text-white text-[15px] outline-none" style={{ fontFamily: FONT }} />
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Bio">
              <textarea rows={3} defaultValue="Mindful living for the modern gen. Brand deals open ♥" className="w-full rounded-xl px-4 py-3 text-white text-[15px] outline-none focus:border-white/30 transition-colors resize-none" style={inputStyle} />
            </Field>
          </div>
          <Field label="Location"><TextInput placeholder="e.g. Mumbai, India" /></Field>
          <Field label="Niche"><TextInput placeholder="e.g. Lifestyle & Wellness" /></Field>
        </div>
      </section>

      <section>
        <SectionHead title="Social Links" sub="Add links to your other platforms." />
        <div className="flex flex-col gap-3">
          {socials.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="grid place-items-center rounded-lg shrink-0 text-white/60" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.06)' }}>{I.link}</span>
              <input defaultValue={s.platform} placeholder="Platform" className="w-40 shrink-0 rounded-lg px-3 h-10 text-white text-[14px] outline-none" style={inputStyle} />
              <input defaultValue={s.url} placeholder="https://" className="flex-1 min-w-0 rounded-lg px-3 h-10 text-white/80 text-[14px] outline-none" style={inputStyle} />
              <button type="button" onClick={() => removeSocial(s.id)} className="grid place-items-center rounded-lg shrink-0 text-white/50 hover:text-[#FB7185] hover:bg-white/5 transition-colors" style={{ width: 40, height: 40 }}>{I.trash}</button>
            </div>
          ))}
          <button type="button" onClick={addSocial} className="inline-flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors" style={{ fontFamily: FONT, border: '1px dashed rgba(255,255,255,0.2)' }}>{I.plus} Add Link</button>
        </div>
      </section>
    </div>
  )
}

// ===== Portfolio tab (Brand Collabs) =====
const EMPTY_COLLAB = { link: '', brand: '', overview: '', category: '', url: '' }
function PortfolioPanel() {
  const [collabs, setCollabs] = useState([])
  const [form, setForm] = useState(EMPTY_COLLAB)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const addEntry = () => {
    if (!form.brand.trim()) return
    setCollabs((c) => [...c, { id: Date.now(), ...form }])
    setForm(EMPTY_COLLAB)
  }
  const remove = (id) => setCollabs((c) => c.filter((x) => x.id !== id))
  return (
    <section>
      <SectionHead title="Brand Collabs" sub="Showcase your best sponsored content." />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-6 items-start">
        {/* Left: add-collaboration form */}
        <div className="rounded-2xl p-6" style={PANEL}>
          <h3 className="text-white font-bold text-lg mb-5" style={{ fontFamily: FONT }}>Add collaboration</h3>

          <Field label="Instagram collab post link">
            <div className="flex items-stretch gap-2">
              <input value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://instagram.com/p/…" className="flex-1 min-w-0 rounded-xl px-4 h-12 text-white text-[15px] outline-none focus:border-white/30 transition-colors placeholder:text-white/30" style={inputStyle} />
              <GhostBtn>{I.fetch} Fetch</GhostBtn>
            </div>
          </Field>
          <p className="mt-2 mb-5 text-white/40 text-[12px] leading-relaxed" style={{ fontFamily: FONT }}>
            Must be one of the creator's own posts — insights aren't available for other accounts.
          </p>

          <Label>Brand logo / image</Label>
          <div className="flex items-center gap-3 mb-5">
            <span className="grid place-items-center rounded-lg shrink-0 text-white/45" style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>{I.image}</span>
            <GhostBtn>{I.upload} Upload</GhostBtn>
          </div>

          <div className="mb-5"><Field label="Brand / Campaign name"><TextInput value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Summer Escapes" /></Field></div>
          <div className="mb-5">
            <Field label="Campaign overview">
              <textarea rows={3} value={form.overview} onChange={(e) => set('overview', e.target.value)} placeholder="Write a short summary of this collaboration…" className="w-full rounded-xl px-4 py-3 text-white text-[15px] outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/30" style={inputStyle} />
            </Field>
          </div>
          <div className="mb-5"><Field label="Category"><TextInput value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Travel" /></Field></div>
          <div className="mb-6"><Field label="Link"><TextInput value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://…" /></Field></div>

          <button type="button" onClick={addEntry} className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-95" style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)' }}>
            {I.plus} Add entry
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
                  <span className="grid place-items-center rounded-lg shrink-0 text-white/45" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.06)' }}>{I.image}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-[15px] truncate" style={{ fontFamily: FONT }}>{c.brand}</span>
                      {c.category && <span className="text-[11px] px-2 py-0.5 rounded-full text-white/70" style={{ background: 'rgba(255,255,255,0.08)', fontFamily: MONO }}>{c.category}</span>}
                    </div>
                    {c.overview && <p className="text-white/50 text-[13px] mt-1 line-clamp-2" style={{ fontFamily: FONT }}>{c.overview}</p>}
                    {c.url && <span className="text-[#9C7CF0] text-[12px] mt-1 inline-block truncate max-w-full" style={{ fontFamily: MONO }}>{c.url}</span>}
                  </div>
                  <button type="button" onClick={() => remove(c.id)} className="grid place-items-center rounded-lg shrink-0 text-white/50 hover:text-[#FB7185] hover:bg-white/5 transition-colors" style={{ width: 40, height: 40 }}>{I.trash}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ===== Packages tab =====
const TIER_OPTIONS = ['Starter', 'Campaign', 'Core', 'Growth', 'Premium']

// iOS-style toggle in the dashboard's dark theme.
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

function PackagesPanel() {
  const [pkgs, setPkgs] = useState([
    { id: 1, tier: 'Starter', price: '0', deliverables: '', revisions: '1' },
    { id: 2, tier: 'Campaign', price: '0', deliverables: '', revisions: '3' },
    { id: 3, tier: 'Core', price: '0', deliverables: '', revisions: '2' },
  ])
  // Only one tier can be "Most Popular" at a time (null = none).
  const [popularId, setPopularId] = useState(null)
  const update = (id, k, v) => setPkgs((p) => p.map((x) => (x.id === id ? { ...x, [k]: v } : x)))
  const remove = (id) => setPkgs((p) => p.filter((x) => x.id !== id))
  const addTier = () => setPkgs((p) => (p.length >= 3 ? p : [...p, { id: Date.now(), tier: 'Starter', price: '0', deliverables: '', revisions: '1' }]))
  return (
    <section>
      <div className="flex items-start justify-between gap-4 mb-2">
        <SectionHead title="Services & Packages" sub="Configure deliverables, pricing and revision rounds. Up to 3 tiers." />
        <PurpleBtn onClick={addTier}>{I.plus} Add tier</PurpleBtn>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {pkgs.map((p) => (
          <div key={p.id} className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'rgba(10,12,30,0.55)', border: popularId === p.id ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between gap-3">
              <select value={p.tier} onChange={(e) => update(p.id, 'tier', e.target.value)} className="rounded-xl px-3 h-11 text-white text-[15px] font-semibold outline-none cursor-pointer" style={{ ...inputStyle, fontFamily: FONT }}>
                {TIER_OPTIONS.map((t) => <option key={t} value={t} style={{ color: '#000' }}>{t}</option>)}
              </select>
              <button type="button" onClick={() => remove(p.id)} className="text-[13px] font-semibold text-[#FB7185] hover:text-[#f43f5e] transition-colors px-2 py-1" style={{ fontFamily: FONT }}>Remove</button>
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
            <Toggle on={popularId === p.id} onClick={() => setPopularId((cur) => (cur === p.id ? null : p.id))} label="Mark as Most Popular" />
          </div>
        ))}
      </div>
    </section>
  )
}

// ===== Design tab =====
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

function DesignPanel() {
  const [primary, setPrimary] = useState('#8B5CF6')
  const [secondary, setSecondary] = useState('#8B5CF6')
  const [bg, setBg] = useState('mesh')
  const [font, setFont] = useState('outfit')
  const accentBg = `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`
  return (
    <section className="max-w-3xl">
      <SectionHead title="Theme & Design" sub="Customize how your Influence Card looks." />

      <Label>Accent Colour</Label>
      {/* Live accent preview bar */}
      <div className="rounded-2xl h-16 grid place-items-center mb-5" style={{ background: accentBg }}>
        <span className="text-white text-[13px] font-semibold tracking-wide" style={{ fontFamily: MONO }}>Card accent preview</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <HexField label="Primary" value={primary} onPick={setPrimary} />
        <HexField label="Secondary (gradient end)" value={secondary} onPick={setSecondary} />
      </div>
      <button type="button" onClick={() => setSecondary(primary)} className="inline-flex items-center gap-2 mt-3 text-white/55 text-[13px] hover:text-white transition-colors" style={{ fontFamily: FONT }}>
        {I.swap} Use a single solid colour
      </button>

      <div className="mt-7 mb-2"><Label>Quick colours</Label></div>
      <div className="flex flex-wrap gap-3 mb-7">
        {QUICK_COLOURS.map((c) => (
          <button key={c} type="button" onClick={() => { setPrimary(c); setSecondary(c) }} aria-label={c} className="rounded-full transition-transform hover:scale-110" style={{ width: 34, height: 34, background: c, border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.3)' : 'none', outline: primary === c && secondary === c ? '2px solid #fff' : 'none', outlineOffset: 2 }} />
        ))}
      </div>

      <Label>Gradient presets</Label>
      <div className="flex flex-wrap gap-3 mb-9">
        {GRADIENT_PRESETS.map(([a, b]) => (
          <button key={a + b} type="button" onClick={() => { setPrimary(a); setSecondary(b) }} className="rounded-xl transition-transform hover:scale-105" style={{ width: 66, height: 40, background: `linear-gradient(90deg, ${a}, ${b})`, outline: primary === a && secondary === b ? '2px solid #fff' : 'none', outlineOffset: 2 }} />
        ))}
      </div>

      <Label>Background Style</Label>
      <div className="grid grid-cols-2 gap-4 mb-9">
        {BG_STYLES.map((b) => (
          <button key={b.key} type="button" onClick={() => setBg(b.key)} className="rounded-2xl h-32 grid place-items-center text-white/80 text-sm font-medium transition-all" style={{ fontFamily: FONT, background: b.bg, border: bg === b.key ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.12)' }}>
            {b.label}
          </button>
        ))}
      </div>

      <Label>Font Pairing</Label>
      <div className="flex flex-col gap-3 mb-12">
        {FONTS.map((f) => (
          <button key={f.key} type="button" onClick={() => setFont(f.key)} className="text-left rounded-xl px-5 py-4 transition-colors" style={{ background: font === f.key ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.3)', border: font === f.key ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.12)' }}>
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
            {/* Gradient header */}
            <div className="relative h-28 grid place-items-center" style={{ background: t.grad }}>
              <span className="absolute top-2.5 right-2.5 grid place-items-center rounded-full text-white/90" style={{ width: 26, height: 26, background: 'rgba(0,0,0,0.35)' }}>{I.lock}</span>
              <div className="text-center">
                <div className="text-2xl leading-none mb-1">{t.emoji}</div>
                <div className="text-white font-extrabold text-lg drop-shadow" style={{ fontFamily: FONT }}>{t.name}</div>
              </div>
            </div>
            {/* Body */}
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

export default function EditProfileView() {
  const [tab, setTab] = useState('Profile')
  const [device, setDevice] = useState('phone')
  return (
    <>
      {/* Header: title + tabs + actions */}
      <header className="px-6 md:px-10 py-4 flex flex-wrap items-center gap-4 justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-5">
          <h1 className="font-bold text-lg whitespace-nowrap" style={{ fontFamily: FONT }}>Edit Influence Card</h1>
          <div className="hidden sm:block h-6 w-px bg-white/15" />
          <nav className="flex items-center gap-1">
            {TABS.map((t) => {
              const active = tab === t
              return (
                <button key={t} type="button" onClick={() => setTab(t)} className="rounded-lg px-4 py-2 text-[14px] font-medium transition-colors" style={{ fontFamily: FONT, color: active ? '#fff' : 'rgba(255,255,255,0.6)', background: active ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                  {t}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* device toggle */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <button type="button" onClick={() => setDevice('phone')} className="grid place-items-center rounded-lg transition-colors" style={{ width: 32, height: 30, color: '#fff', background: device === 'phone' ? 'rgba(139,92,246,0.6)' : 'transparent' }}>{I.phone}</button>
            <button type="button" onClick={() => setDevice('desktop')} className="grid place-items-center rounded-lg transition-colors" style={{ width: 32, height: 30, color: '#fff', background: device === 'desktop' ? 'rgba(139,92,246,0.6)' : 'transparent' }}>{I.monitor}</button>
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-[#11132f] transition-opacity hover:opacity-90" style={{ fontFamily: FONT, background: '#fff' }}>{I.eye} Preview</button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-[#11132f] transition-opacity hover:opacity-90" style={{ fontFamily: FONT, background: '#fff' }}>{I.save} Save Changes</button>
        </div>
      </header>

      {/* Content with the blue editor gradient backdrop */}
      <div style={{ background: 'radial-gradient(110% 80% at 50% 0%, #1c277a 0%, #121845 38%, #0a0c1f 80%)' }}>
        <div className="px-6 md:px-16 lg:px-24 pb-16">
          <LivePreview device={device} />
          <div className="pt-8">
            {tab === 'Profile' && <ProfilePanel />}
            {tab === 'Portfolio' && <PortfolioPanel />}
            {tab === 'Packages' && <PackagesPanel />}
            {tab === 'Design' && <DesignPanel />}
          </div>
        </div>
      </div>
    </>
  )
}

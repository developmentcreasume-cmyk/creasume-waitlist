// Static "creator dashboard" shown as the PROFILE step of the live demo.
// Recreates the media-kit dashboard: header + quick-stat pills + bio + actions
// + a 3×3 metrics grid. Data is randomised per render so each replay shows a
// different creator.
const MONO = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace"

// ---- Random data helpers ----
const NICHES = ['Lifestyle', 'Fashion', 'Fitness', 'Travel', 'Tech', 'Beauty', 'Food']
const CITIES = ['Mumbai', 'New York', 'London', 'Dubai', 'Berlin', 'Toronto', 'Sydney']
const BIOS = [
  'Mindful living for the modern gen. Brand deals open 🤍',
  'Turning everyday moments into stories brands love ✨',
  'Helping you live brighter, one post at a time 🌿',
  'Style, travel & honest reviews. Collabs welcome 💫',
]

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[rand(0, arr.length - 1)]
const commas = (n) => n.toLocaleString('en-US')

// Build one random creator dataset.
export function randomCreator() {
  const name = 'Sample Creator'
  const handle = '@sample.creator'
  const niche = pick(NICHES)
  const followersK = rand(18, 480)
  const followers = followersK + 'K'
  const engRate = (rand(150, 760) / 100).toFixed(2) + '%'
  const totalViews = rand(15, 92) * 1000
  const totalReach = rand(8, 46) * 1000
  const impressions = (rand(11, 94) / 10).toFixed(1) + 'M'

  // Follower-growth line: 7 monthly points trending up toward the follower count.
  const growth = Array.from({ length: 7 }, (_, i) =>
    Math.round(followersK * (0.45 + (0.55 * i) / 6)),
  )
  // Engagement-rate bars: 6 modest values (last one is the "today" highlight).
  const bars = Array.from({ length: 6 }, () => rand(22, 70))

  return {
    name,
    handle,
    niche,
    bio: pick(BIOS),
    pills: [
      { value: followers, label: 'Followers', color: '#C9CDEE' },
      { value: engRate, label: 'Eng. Rate', color: '#4DE0B0' },
      { value: commas(totalViews), label: 'Total Views', color: '#C9CDEE' },
      { value: commas(totalReach), label: 'Total Reach', color: '#C9CDEE' },
    ],
    tiles: [
      { value: engRate, label: 'Engagement Rate', Icon: ChartIcon },
      { value: commas(totalViews), label: 'Total Views', Icon: EyeIcon },
      { value: String(rand(40, 320)), label: 'Total Post', Icon: CameraIcon },
      { value: followers, label: 'Total Followers', Icon: FollowersIcon },
      { value: commas(totalReach), label: 'Reach', Icon: SendIcon },
      { value: impressions, label: 'Total Impressions', Icon: HeartIcon },
      { value: String(rand(62, 98)), label: 'Creasume Score', Icon: ScoreIcon },
      { value: pick(CITIES), label: 'Top City', Icon: PinIcon },
      { value: String(rand(3, 42)), label: 'Brand Deals Done', Icon: HandshakeIcon },
    ],
    analytics: { growth, bars },
    brandStats: [
      { value: (rand(31, 95) / 10).toFixed(1) + 'M', label: 'TOTAL REACH' },
      { value: String(rand(3, 9)), label: 'BRANDS' },
      { value: rand(8, 24) + '+', label: 'CAMPAIGNS' },
      { value: '100%', label: 'ON TIME' },
    ],
  }
}

// ---- Outline icons for the metric tiles (15px, inherit stroke colour) ----
const iconProps = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
function ChartIcon() { return (<svg {...iconProps}><path d="M4 19h16" /><path d="M4 15l4-4 3 3 5-6" /><path d="M16 8h2v2" /></svg>) }
function EyeIcon() { return (<svg {...iconProps}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>) }
function CameraIcon() { return (<svg {...iconProps}><path d="M3 8h3l1.5-2h9L18 8h3v11H3Z" /><circle cx="12" cy="13" r="3.2" /></svg>) }
function FollowersIcon() { return (<svg {...iconProps}><circle cx="9" cy="9" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M18 8v5M20.5 10.5h-5" /></svg>) }
function SendIcon() { return (<svg {...iconProps}><path d="M21 3 11 13" /><path d="M21 3l-6.5 18-3.5-8-8-3.5L21 3Z" /></svg>) }
function HeartIcon() { return (<svg {...iconProps}><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" /></svg>) }
function ScoreIcon() { return (<svg {...iconProps}><path d="M15.5 6a7 7 0 1 0 0 12" /><path d="M9 9.5 6.5 12 9 14.5" /></svg>) }
function PinIcon() { return (<svg {...iconProps}><path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>) }
function HandshakeIcon() { return (<svg {...iconProps}><path d="m11 7-3 3a2 2 0 0 0 0 3l3 3" /><path d="m13 7 3 3a2 2 0 0 1 0 3l-3 3" /><path d="M3 11l3-3h5M21 11l-3-3h-5" /></svg>) }

// ===== Scrollable media-kit sections shown below the dashboard =====
// Shared dark panel surface, matching the metric tiles.
const PANEL = { backgroundColor: 'rgba(40,46,112,0.30)', border: '1px solid rgba(255,255,255,0.08)' }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

// Solid-stroke sparkline. (SVG gradient `url(#id)` refs don't render in this
// app's hash-routed pages, so the line uses a flat brand color.)
function Sparkline({ points, stroke = '#9CA2E1' }) {
  const w = 320
  const h = 64
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / span) * (h - 10) - 5
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 64 }} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AnalyticsSection({ growth, bars }) {
  return (
    <div className="mt-7">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-bold text-[16px]" style={{ fontFamily: "'Outfit', sans-serif" }}>Live Analytics</h4>
        <div className="flex items-center gap-0.5 rounded-full p-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          {['30D', '90D', '1Y'].map((p, i) => (
            <span
              key={p}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                fontFamily: MONO,
                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.45)',
                background: i === 0 ? 'linear-gradient(90deg,#5D65DC,#9CA2E1)' : 'transparent',
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-3 mb-2.5" style={PANEL}>
        <div className="text-white/70 text-[12px] mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Follower Growth</div>
        <Sparkline points={growth} />
        <div className="flex justify-between mt-1 text-white/30 text-[9px]" style={{ fontFamily: MONO }}>
          {MONTHS.map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>

      <div className="rounded-xl p-3" style={PANEL}>
        <div className="text-white/70 text-[12px] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Engagement Rate</div>
        <div className="flex items-end justify-between gap-1.5" style={{ height: 64 }}>
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${b}%`,
                background: i === bars.length - 1 ? '#4DE0B0' : 'linear-gradient(180deg,#9CA2E1,#5D65DC)',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-white/30 text-[9px]" style={{ fontFamily: MONO }}>
          {MONTHS.slice(0, 6).map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
    </div>
  )
}

// Blue glow orb that peeks out from behind a card corner.
function GlowOrb({ className }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ width: 52, height: 52, background: '#2563EB', filter: 'blur(13px)', opacity: 0.75 }}
    />
  )
}

function BrandCollabSection({ stats }) {
  return (
    <div className="mt-7 flex items-center gap-3">
      {/* Heading on the left */}
      <h4 className="shrink-0 w-28 text-white font-extrabold leading-[1.15] text-[13px] wrap-break-word" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Brand Collaborations
      </h4>

      {/* Glass card on the right, ringed by blue glow orbs */}
      <div className="relative flex-1 min-w-0">
        <GlowOrb className="-top-3 -left-3" />
        <GlowOrb className="-top-3 -right-3" />
        <GlowOrb className="-bottom-3 -left-3" />
        <GlowOrb className="-bottom-3 -right-3" />

        <div
          className="relative rounded-2xl px-4 py-4 flex gap-3 items-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          {/* line teasers */}
          <div className="flex-1 flex flex-col justify-center gap-3.5">
            {[92, 60, 78, 70].map((w, i) => (
              <div key={i} className="h-[2px] rounded-full bg-white/90" style={{ width: `${w}%` }} />
            ))}
          </div>

          {/* stats */}
          <div className="shrink-0 flex flex-col gap-2.5 text-right">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-white font-bold text-[15px] leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
                <div className="text-white/40 text-[7px] tracking-wider mt-0.5" style={{ fontFamily: MONO }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const PACKAGES = [
  {
    tier: 'STARTER',
    price: '₹25,000',
    features: ['1× Instagram Reel (60s)', '3× Stories + link', '2 revision rounds', 'Usage rights: 90 days', 'Strategy call included'],
  },
  {
    tier: 'CORE',
    price: '₹75,000',
    popular: true,
    features: ['1× Instagram Reel (60s)', '3× Stories + link', '2 revision rounds', 'Usage rights: 90 days', 'Strategy call included'],
  },
  {
    tier: 'CAMPAIGN',
    price: '₹2,00,000+',
    sub: 'custom quote',
    features: ['Multi-platform campaign', 'YouTube + Instagram + TikTok', 'Exclusivity option available', 'Unlimited revisions', 'Dedicated campaign manager'],
  },
]

function PackagesSection() {
  return (
    <div className="mt-7">
      <h4 className="text-white font-bold text-[16px]" style={{ fontFamily: "'Outfit', sans-serif" }}>Collaboration Packages</h4>
      <p className="text-white/45 text-[11px] mb-3">Standard services. Exact quotes provided after alignment.</p>
      <div className="flex flex-col gap-2.5">
        {PACKAGES.map((p) => (
          <div
            key={p.tier}
            className="relative rounded-xl p-3.5"
            style={{ backgroundColor: 'rgba(40,46,112,0.25)', border: p.popular ? '1px solid rgba(93,101,220,0.7)' : '1px solid rgba(255,255,255,0.08)' }}
          >
            {p.popular && (
              <span
                className="absolute -top-2 right-3 text-[9px] font-semibold text-white px-2 py-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg,#5D65DC,#9CA2E1)', fontFamily: "'Outfit', sans-serif" }}
              >
                Most Popular
              </span>
            )}
            <div className="text-[10px] tracking-widest mb-1" style={{ fontFamily: MONO, color: '#A78BE8' }}>{p.tier}</div>
            <div className="text-white font-bold text-[22px] leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>{p.price}</div>
            <div className="text-white/40 text-[10px] mb-2.5" style={{ fontFamily: MONO }}>{p.sub || 'starting price'}</div>
            <ul className="flex flex-col gap-1">
              {p.features.map((f) => (
                <li key={f} className="text-white/70 text-[11.5px] flex items-start gap-1.5">
                  <span style={{ color: '#5D65DC' }}>•</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="mt-3 w-full rounded-full font-semibold text-[12px] py-2 transition-all hover:scale-[1.02] hover:!bg-none hover:!bg-[#2563EB] hover:!text-white"
              style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontFamily: "'Outfit', sans-serif" }}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkWithMeSection() {
  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }
  return (
    <div className="mt-7 rounded-2xl p-4" style={PANEL}>
      <h4 className="text-white font-bold text-[20px]" style={{ fontFamily: "'Outfit', sans-serif" }}>Work With Me.</h4>
      <p className="text-white/45 text-[11.5px] mb-3">Looking for transparent, data-driven partnerships? Drop your details and I&apos;ll get back to you.</p>
      <div className="flex flex-col gap-2">
        {['Brand Name', 'Agency (Optional)', 'Your Professional Email', 'Campaign Type'].map((ph) => (
          <input
            key={ph}
            type="text"
            placeholder={ph}
            className="rounded-lg px-3 text-white text-[12.5px] placeholder:text-white/35 outline-none"
            style={{ ...inputStyle, height: 38 }}
          />
        ))}
        <textarea
          placeholder="Campaign Brief or Goals"
          rows={3}
          className="rounded-lg px-3 py-2 text-white text-[12.5px] placeholder:text-white/35 outline-none resize-none"
          style={inputStyle}
        />
        <button
          className="mt-1 w-full rounded-full text-white font-semibold text-[13px] py-2.5 inline-flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
          style={{ background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)', fontFamily: "'Outfit', sans-serif" }}
        >
          Send Inquiry
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Presentational dashboard. `data` defaults to a fresh random creator so it can
// also be rendered standalone.
export default function SampleCreatorCard({ data = randomCreator() }) {
  return (
    <div
      className="relative w-full min-h-full px-5 py-5 overflow-hidden isolate"
      style={{ background: '#020423' }}
    >

      <div className="relative z-10">
      {/* ===== Header: avatar + name ===== */}
      <div className="flex items-center gap-3.5 mb-4">
        <div
          className="shrink-0 rounded-full"
          style={{ width: 60, height: 60, padding: 2.5, background: 'linear-gradient(135deg, #8B5CF6 0%, #C04DCC 50%, #EC4899 100%)' }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2a2f6b 0%, #16183c 100%)' }}
          >
            <span
              className="text-white font-bold select-none"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', lineHeight: 1 }}
            >
              {data.name.charAt(0)}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-bold leading-tight truncate" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '23px' }}>
            {data.name}
          </h3>
          <p className="text-white/50 text-[12px] leading-snug truncate" style={{ fontFamily: MONO }}>
            {data.handle} · {data.niche}
          </p>
        </div>
      </div>

      {/* ===== Quick-stat pills ===== */}
      <div className="flex flex-wrap gap-2 mb-3">
        {data.pills.map(({ value, label, color }) => (
          <span
            key={label}
            className="inline-flex items-baseline gap-1.5 rounded-full px-2.5 py-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="font-bold text-[12.5px]" style={{ color }}>{value}</span>
            <span className="text-white/45 text-[10.5px]">{label}</span>
          </span>
        ))}
      </div>

      {/* ===== Bio ===== */}
      <p className="text-white/90 text-[13.5px] mb-4 leading-snug">{data.bio}</p>

      {/* ===== Action buttons ===== */}
      <div className="flex flex-wrap gap-2.5 mb-4">
        <button
          className="inline-flex items-center gap-1.5 rounded-full bg-white text-[#11132f] font-semibold text-[12.5px] px-4 py-2 transition-transform hover:scale-[1.03]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
          </svg>
          Book a Collab
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-full text-white font-semibold text-[12.5px] px-4 py-2 transition-colors hover:bg-white/5"
          style={{ fontFamily: "'Outfit', sans-serif", border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* ===== Metrics grid ===== */}
      <div className="grid grid-cols-3 gap-2.5">
        {data.tiles.map(({ value, label, Icon }) => (
          <div
            key={label}
            className="relative rounded-xl px-2.5 py-4 flex flex-col justify-center"
            style={{ backgroundColor: 'rgba(40,46,112,0.30)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="absolute top-2 right-2 text-white/35"><Icon /></span>
            <div className="text-white font-bold text-[19px] leading-none mb-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {value}
            </div>
            <div className="text-[10px] leading-tight" style={{ fontFamily: MONO, color: '#A78BE8' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Scrollable media-kit sections ===== */}
      <AnalyticsSection growth={data.analytics.growth} bars={data.analytics.bars} />
      <BrandCollabSection stats={data.brandStats} />
      <PackagesSection />
      <WorkWithMeSection />
      </div>
    </div>
  )
}

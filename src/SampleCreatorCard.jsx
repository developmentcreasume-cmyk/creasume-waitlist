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

// Presentational dashboard. `data` defaults to a fresh random creator so it can
// also be rendered standalone.
export default function SampleCreatorCard({ data = randomCreator() }) {
  return (
    <div
      className="w-full min-h-full px-5 py-5"
      style={{ background: '#0A0A0E' }}
    >
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
      <div className="grid grid-cols-3 gap-2">
        {data.tiles.map(({ value, label, Icon }) => (
          <div
            key={label}
            className="relative rounded-xl px-2.5 py-2.5 flex flex-col justify-center"
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
    </div>
  )
}

// ============================================================================
// STATIC PDF DOCUMENT — a print-ready replica of the Influence Card.
//
// WHY THIS EXISTS
// The live card is a scroll-driven experience: framer-motion entrances, 3D flip
// cards, scroll-linked marquee bands, sticky carousels and backdrop-filter glass.
// html2canvas re-implements CSS from scratch and supports NONE of those, so
// rasterising the live DOM gave mirrored card-backs, giant misplaced band text,
// near-empty carousel pages and washed-out grey glass.
//
// This renders the SAME DESIGN — same palette, same hero, same #10133C tiles,
// same charts, same audience panel, same package cards, same wordmark — but as a
// plain STATIC document:
//   • no animation / transforms / flip cards / carousels / marquees
//   • no backdrop-filter — solid fills only
//   • every section is a self-contained [data-pdf-block] shorter than a page,
//     so pagination can never cut content in half
//   • ALL top posts / packages shown at once (grids, not carousels)
//
// ⚠️ NO GRADIENT TEXT. The card styles labels with `background-clip: text` +
// `-webkit-text-fill-color: transparent`. html2canvas can't do that — the text
// would come out INVISIBLE. Those labels use a solid colour here instead.
//
// Mounted OFF-SCREEN, captured, then unmounted. A4 width (794px @96dpi).
// ============================================================================

const FONT = "'Outfit', sans-serif"
const MONO = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace"

export const PDF_WIDTH = 794

// ---- The card's palette ----
const BG = '#0a0b18'
const TILE = '#10133C'
const LINE = 'rgba(255,255,255,0.08)'
const MUTED = 'rgba(255,255,255,0.55)'
const PURPLE = '#8B5CF6'
const LABEL = '#9B7BF0' // solid stand-in for the card's gradient label text
const CYAN = '#5EEAD4'
const GOLD = '#E8C55F'

const tileBox = { backgroundColor: TILE, border: `1px solid ${LINE}`, borderRadius: 16 }

// ---- Metric-tile icons — the SAME outline SVGs the live card uses (ProfileHero
// ICONS), so each PDF tile shows its icon top-right. Rendered white. `score`
// uses the Creasume logo, like the card. ----
const IP = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#ffffff', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
const TILE_ICONS = {
  chart: (<svg {...IP}><path d="M5 4v15h15" /><path d="M6.5 16l4.5-4.5 3 3 5-6" /><path d="M14.5 8.5H19V13" /></svg>),
  eye: (<svg {...IP}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>),
  camera: (<svg {...IP}><path d="M3 8h3l1.5-2h9L18 8h3v11H3Z" /><circle cx="12" cy="13" r="3.2" /></svg>),
  followers: (<svg {...IP}><circle cx="12" cy="10" r="2.6" /><path d="M7 17c0-2.5 2.2-4.2 5-4.2s5 1.7 5 4.2" /><circle cx="12" cy="12" r="9.5" strokeDasharray="2.5 3" /></svg>),
  rocket: (<svg {...IP}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>),
  heart: (<svg {...IP}><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" /></svg>),
  share: (<svg {...IP}><circle cx="18" cy="5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="19" r="2.6" /><path d="m8.3 13.3 7.4 4.3M15.7 6.4 8.3 10.7" /></svg>),
  pin: (<svg {...IP}><path d="M12 15s3.6-2.9 3.6-6a3.6 3.6 0 0 0-7.2 0c0 3.1 3.6 6 3.6 6Z" /><circle cx="12" cy="8.9" r="1.35" /><path d="M7 15.4c-1.8.4-3 1.1-3 1.9 0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5c0-.8-1.2-1.5-3-1.9" /></svg>),
  handshake: (<svg {...IP}><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" /></svg>),
  score: (<img src="/creasume-c.png" alt="" width="22" height="22" style={{ display: 'block', objectFit: 'contain' }} />),
}

function Block({ children, style }) {
  return <section data-pdf-block style={{ padding: '18px 34px', ...style }}>{children}</section>
}

// Big centered section title, like the card's.
function SectionTitle({ children, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 27, fontWeight: 700, letterSpacing: '-0.01em' }}>{children}</h2>
      {sub && (
        <p style={{ margin: '6px 0 0', fontSize: 10.5, color: MUTED, fontFamily: MONO }}>{sub}</p>
      )}
    </div>
  )
}

// The card's scalloped blue verified seal.
const SEAL_PATH = (() => {
  const N = 24, cx = 12, cy = 12, rOuter = 12, rInner = 10.4
  let d = ''
  for (let i = 0; i < N * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const a = (Math.PI / N) * i - Math.PI / 2
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)} `
  }
  return `${d}Z`
})()

// ---- Charts (plain SVG — the live ones are animated/framer-driven) ----
// Both leave a left GUTTER for the Y-axis numbers and a bottom STRIP for the
// X-axis date labels, matching the card's Follower-Growth / Engagement charts.
const AX = { fill: 'rgba(255,255,255,0.55)', fontSize: 8.5, fontFamily: MONO }
const GUTTER = 34 // left space for Y labels
const XAXIS = 16  // bottom space for X labels
const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric' }) } catch { return '' }
}
const fmtY = (v) => (v >= 1000 ? `${Math.round(v / 100) / 10}K` : String(Math.round(v)))

function LineChart({ points, width = 340, height = 140 }) {
  const vals = points.map((p) => p.followers)
  if (vals.length < 2) return null
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || 1
  const plotX0 = GUTTER
  const plotX1 = width - 6
  const plotY0 = 6
  const plotY1 = height - XAXIS
  const x = (i) => plotX0 + (i / (vals.length - 1)) * (plotX1 - plotX0)
  const y = (v) => plotY1 - ((v - min) / span) * (plotY1 - plotY0)
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const yTicks = [0, 0.25, 0.5, 0.75, 1]
  // X labels: first, a couple in the middle, last (avoid crowding).
  const xIdx = [0, Math.round((vals.length - 1) * 0.33), Math.round((vals.length - 1) * 0.66), vals.length - 1]
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {yTicks.map((f) => {
        const gy = plotY0 + f * (plotY1 - plotY0)
        const val = max - f * span
        return (
          <g key={f}>
            <line x1={plotX0} x2={plotX1} y1={gy} y2={gy} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 4" strokeWidth="1" />
            <text x={plotX0 - 6} y={gy + 3} textAnchor="end" {...AX}>{fmtY(val)}</text>
          </g>
        )
      })}
      <path d={d} fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {xIdx.map((idx, k) => (
        <text key={k} x={x(idx)} y={height - 4} textAnchor={k === 0 ? 'start' : k === xIdx.length - 1 ? 'end' : 'middle'} {...AX}>
          {fmtDate(points[idx]?.date)}
        </text>
      ))}
    </svg>
  )
}

function BarChart({ points, width = 340, height = 140 }) {
  const rows = points.slice(-Math.min(points.length, 6))
  const vals = rows.map((p) => p.rate)
  if (!vals.length) return null
  const max = Math.max(...vals, 1)
  const plotX0 = GUTTER
  const plotX1 = width - 6
  const plotY0 = 6
  const plotY1 = height - XAXIS
  const n = rows.length
  const bw = (plotX1 - plotX0) / n
  const yTicks = [0, 0.5, 1]
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {yTicks.map((f) => {
        const gy = plotY0 + f * (plotY1 - plotY0)
        const val = max - f * max
        return (
          <g key={f}>
            <line x1={plotX0} x2={plotX1} y1={gy} y2={gy} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 4" strokeWidth="1" />
            <text x={plotX0 - 6} y={gy + 3} textAnchor="end" {...AX}>{`${Math.round(val)}%`}</text>
          </g>
        )
      })}
      {rows.map((p, i) => {
        const h = Math.max(2, (p.rate / max) * (plotY1 - plotY0))
        return (
          <g key={i}>
            <rect x={plotX0 + i * bw + bw * 0.18} y={plotY1 - h} width={bw * 0.64} height={h} rx="4" fill={PURPLE} />
            <text x={plotX0 + i * bw + bw / 2} y={height - 4} textAnchor="middle" {...AX}>{fmtDate(p.date)}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function CardPdfDocument({ data }) {
  const {
    CREATOR = {},
    TOP_POSTS = [],
    PACKAGES = [],
    SOCIALS = [],
    AGE_GROUPS = [],
    TOP_COUNTRIES = [],
    TOP_LOCATIONS = [],
    GENDER_SPLIT = null,
    GROWTH_POINTS = [],
    ENG_POINTS = [],
  } = data || {}

  const tiles = (CREATOR.tiles || []).filter((t) => t && t.value != null && t.value !== '')
  const pills = (CREATOR.pills || []).filter((p) => p && p.value != null && p.value !== '')
  const avatar = CREATOR.avatar || CREATOR.avatarRaw || ''

  return (
    <div id="pdf-doc" style={{ width: PDF_WIDTH, background: BG, color: '#fff', fontFamily: FONT }}>

      {/* ============ HERO ============ */}
      <Block style={{ paddingTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 700, lineHeight: 1.05 }}>
            {CREATOR.username || CREATOR.name}
          </h1>
          {CREATOR.isFoundingCreator && (
            <span style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              color: GOLD, background: 'rgba(232,197,95,0.10)', border: `1px solid ${GOLD}`,
              whiteSpace: 'nowrap',
            }}>Founding Creator</span>
          )}
        </div>

        {/* Stat pills */}
        {pills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
            {pills.map((p) => (
              <span key={p.label} style={{
                display: 'inline-flex', alignItems: 'baseline', gap: 7,
                padding: '10px 18px', borderRadius: 999,
                background: TILE, border: `1px solid ${LINE}`,
              }}>
                <b style={{ fontSize: 17, fontWeight: 700, color: CYAN }}>{p.value}</b>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>{p.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Avatar + bio */}
        <div style={{ display: 'flex', gap: 24, marginTop: 22, alignItems: 'flex-start' }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', padding: 3, flexShrink: 0, position: 'relative',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #C04DCC 50%, #EC4899 100%)',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
              background: 'linear-gradient(135deg, #2a2f6b 0%, #16183c 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatar ? (
                <img src={avatar} alt="" crossOrigin="anonymous" referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 46, fontWeight: 700 }}>{(CREATOR.name || '?').charAt(0)}</span>
              )}
            </div>
            {CREATOR.verified && (
              <span style={{ position: 'absolute', bottom: 2, right: 2, lineHeight: 0 }}>
                <svg width="32" height="32" viewBox="0 0 24 24">
                  <path d={SEAL_PATH} fill="#1D9BF0" stroke="#0b0b1e" strokeWidth="1.2" style={{ paintOrder: 'stroke' }} />
                  <path d="M7.3 12.1 10.4 15.2 16.8 8.4" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
          {CREATOR.bio && (
            <p style={{
              margin: 0, fontSize: 13.5, lineHeight: 1.75, whiteSpace: 'pre-line',
              color: 'rgba(255,255,255,0.86)', paddingTop: 6,
            }}>
              {CREATOR.bio}
            </p>
          )}
        </div>
      </Block>

      {/* ============ METRIC TILES (3×3) ============ */}
      {tiles.length > 0 && (
        <Block>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {tiles.map((t, i) => (
              <div key={`${t.label}-${i}`} style={{
                ...tileBox, padding: '22px 12px', minHeight: 96, position: 'relative',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              }}>
                {/* Metric icon — top-right, like the card */}
                {TILE_ICONS[t.icon] && (
                  <span style={{ position: 'absolute', top: 12, right: 12, opacity: 0.85, lineHeight: 0 }}>
                    {TILE_ICONS[t.icon]}
                  </span>
                )}
                <div style={{
                  fontSize: String(t.value).length > 12 ? 15 : String(t.value).length > 7 ? 20 : 28,
                  fontWeight: 700, lineHeight: 1.1, color: t.color || '#fff',
                }}>
                  {t.value}
                </div>
                <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 11, fontWeight: 700, color: LABEL }}>
                  {t.label}
                </div>
                {/* Impressions tile's likes / comments / shares mini-row */}
                {Array.isArray(t.details) && t.details.length > 0 && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, color: 'rgba(255,255,255,0.65)', fontSize: 10 }}>
                    {t.details.map((d) => <span key={d.icon}>{d.value}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ============ LIVE ANALYTICS ============ */}
      {(GROWTH_POINTS.length > 1 || ENG_POINTS.length > 0) && (
        <Block>
          <SectionTitle>Live Analytics</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {GROWTH_POINTS.length > 1 && (
              <div style={{ ...tileBox, padding: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>Follower Growth</div>
                <LineChart points={GROWTH_POINTS.slice(-14)} />
              </div>
            )}
            {ENG_POINTS.length > 0 && (
              <div style={{ ...tileBox, padding: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>Engagement Rate</div>
                <BarChart points={ENG_POINTS} />
              </div>
            )}
          </div>
        </Block>
      )}

      {/* ============ AUDIENCE INSIGHTS ============ */}
      {(AGE_GROUPS.length > 0 || TOP_COUNTRIES.length > 0 || GENDER_SPLIT) && (
        <Block>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 12 }}>
            {AGE_GROUPS.length > 0 && (
              <div style={{ ...tileBox, padding: 18 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>Audience Insights</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '0.1em', margin: '10px 0 12px' }}>
                  AGE DISTRIBUTION
                </div>
                {AGE_GROUPS.map((a) => (
                  <div key={a.label} style={{ marginBottom: 11 }}>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.75)', marginBottom: 5 }}>{a.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.07)' }}>
                        <span style={{ display: 'block', width: `${a.value}%`, height: 8, borderRadius: 4, background: a.color || PURPLE }} />
                      </span>
                      <span style={{ width: 32, textAlign: 'right', fontSize: 11, fontWeight: 600 }}>{a.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ ...tileBox, padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {TOP_LOCATIONS.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>Top Cities</div>
                    {TOP_LOCATIONS.map((l) => (
                      <div key={l.full} style={{ fontSize: 11, fontWeight: 600, marginBottom: 9 }}>{l.full}</div>
                    ))}
                  </div>
                )}
                {TOP_COUNTRIES.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>Top Countries</div>
                    {TOP_COUNTRIES.map((c) => (
                      <div key={c.code} style={{ fontSize: 11, fontWeight: 600, marginBottom: 9 }}>{c.name}</div>
                    ))}
                  </div>
                )}
              </div>

              {GENDER_SPLIT && (
                <>
                  <div style={{ fontSize: 12.5, fontWeight: 700, margin: '16px 0 10px' }}>Gender Ratio</div>
                  <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ flex: 1, background: PURPLE, padding: '14px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: 19, fontWeight: 700 }}>{GENDER_SPLIT.female}%</div>
                      <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em' }}>FEMALE</div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
                    <div style={{ flex: 1, background: PURPLE, padding: '14px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: 19, fontWeight: 700 }}>{GENDER_SPLIT.male}%</div>
                      <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em' }}>MALE</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Block>
      )}

      {/* ============ TOP POSTS ============ */}
      {TOP_POSTS.length > 0 && (
        <Block>
          <SectionTitle>Top Posts</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, TOP_POSTS.length)}, 1fr)`, gap: 12 }}>
            {TOP_POSTS.map((p, i) => (
              <div key={i} style={{ ...tileBox, overflow: 'hidden' }}>
                {p.photo && (
                  <img src={p.photo} alt="" crossOrigin="anonymous" referrerPolicy="no-referrer"
                    style={{ display: 'block', width: '100%', height: 175, objectFit: 'cover' }} />
                )}
                <div style={{ padding: '12px 12px 13px' }}>
                  <div style={{ fontSize: 9.5, color: MUTED, marginBottom: 10, height: 24, overflow: 'hidden', lineHeight: 1.3 }}>
                    {p.caption}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {[['VIEWS', p.views], ['LIKES', p.likes], ['COMM', p.comments], ['SAVES', p.saves]].map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{v}</div>
                        <div style={{ fontFamily: MONO, fontSize: 7, color: MUTED, letterSpacing: '0.06em' }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ============ PROFESSIONAL PRESENCE ============ */}
      {SOCIALS.filter((s) => s && s.handle).length > 0 && (
        <Block>
          <SectionTitle>🌐 Professional Presence</SectionTitle>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
            {SOCIALS.filter((s) => s && s.handle).map((s, i) => (
              <div key={i} style={{ ...tileBox, padding: '12px 18px', minWidth: 190 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: MUTED, marginTop: 3 }}>{s.handle}</div>
              </div>
            ))}
          </div>
          {/* "✦ Professional presence verified" badge, like the card */}
          <div style={{
            marginTop: 12, padding: '11px 0', textAlign: 'center', borderRadius: 12,
            background: 'rgba(216,90,158,0.06)', border: '1px solid rgba(216,90,158,0.25)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#D85A9E' }}>
              ✦ Professional presence verified across Instagram
            </span>
          </div>
        </Block>
      )}

      {/* ============ OPEN TO COLLABORATIONS ============ */}
      <Block style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Paper plane, like the card */}
          <img
            src="/PLANE.png"
            alt=""
            crossOrigin="anonymous"
            style={{ width: 150, height: 'auto', flexShrink: 0, display: 'block' }}
          />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 300 }}>Open to new Collaborations in 2026.</div>
            <span style={{
              display: 'inline-block', marginTop: 14, padding: '11px 26px', borderRadius: 999,
              background: PURPLE, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
            }}>
              LET&apos;S WORK TOGETHER
            </span>
          </div>
        </div>
      </Block>

      {/* ============ PACKAGES ============ */}
      {PACKAGES.length > 0 && (
        <Block>
          <SectionTitle sub="Standard services. Exact quotes provided after alignment.">
            Collaboration Packages
          </SectionTitle>
          {/* items-stretch (grid default) + each card a flex column, so all
              cards are the SAME height and the Book Now button lines up. */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, PACKAGES.length)}, 1fr)`, gap: 12, paddingTop: 8, alignItems: 'stretch' }}>
            {PACKAGES.map((p, i) => (
              <div key={`${p.tier}-${i}`} style={{
                ...tileBox, padding: 18, position: 'relative',
                display: 'flex', flexDirection: 'column',
                minHeight: 230,
                borderColor: p.popular ? 'rgba(139,92,246,0.6)' : LINE,
                background: p.popular ? '#141142' : TILE,
              }}>
                {p.popular && (
                  <span style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: '#3B2BE0', color: '#fff', fontSize: 9, fontWeight: 700,
                    padding: '4px 11px', borderRadius: 999, whiteSpace: 'nowrap',
                  }}>Most Popular</span>
                )}
                <div style={{ fontFamily: MONO, fontSize: 10, color: LABEL, letterSpacing: '0.14em', fontWeight: 700 }}>
                  {p.tier}
                </div>
                <div style={{ fontSize: 27, fontWeight: 700, marginTop: 7 }}>{p.price}</div>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: LABEL, marginTop: 3 }}>{p.sub}</div>
                {Array.isArray(p.features) && p.features.length > 0 && (
                  <ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none' }}>
                    {p.features.map((f, fi) => (
                      <li key={fi} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', marginBottom: 6, lineHeight: 1.4 }}>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {/* Book Now — pinned to the bottom (mt:auto), like the card. */}
                <div style={{
                  marginTop: 'auto', paddingTop: 16, textAlign: 'center',
                }}>
                  <span style={{
                    display: 'block', padding: '10px 0', borderRadius: 999,
                    background: PURPLE, color: '#fff', fontSize: 12, fontWeight: 700,
                  }}>
                    Book Now
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ============ WORK WITH ME ============ */}
      {/* Two-column glass panel like the card: heading + blurb (left), the inquiry
          form (right). The form is a STATIC snapshot — the real interactive one
          isn't useful in a PDF, but showing the fields tells brands how to reach out. */}
      <Block>
        <div style={{
          ...tileBox, padding: 26, background: '#0f0f18',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, alignItems: 'start',
        }}>
          {/* Left — heading + blurb (top-aligned) */}
          <div>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, lineHeight: 1.05 }}>Work With Me.</h2>
            <p style={{ margin: '14px 0 0', fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              Looking for transparent, data-driven partnerships?<br />Drop your details and I&apos;ll get back to you.
            </p>
          </div>

          {/* Right — form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {['Brand Name', 'Agency (Optional)', 'Your Professional Email', 'Campaign Type'].map((ph) => (
              <div key={ph} style={{
                height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '0 14px',
                background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 11.5, color: 'rgba(255,255,255,0.4)',
              }}>{ph}</div>
            ))}
            <div style={{
              height: 78, borderRadius: 10, padding: '11px 14px',
              background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 11.5, color: 'rgba(255,255,255,0.4)',
            }}>Campaign Brief or Goals</div>
            <div style={{ textAlign: 'center', marginTop: 5 }}>
              <span style={{
                display: 'inline-block', padding: '11px 26px', borderRadius: 999,
                background: PURPLE, color: '#fff', fontSize: 12, fontWeight: 700,
              }}>Send Inquiry  →</span>
            </div>
          </div>
        </div>
      </Block>

      {/* ============ CREASUME WORDMARK ============ */}
      <Block style={{ paddingTop: 2, paddingBottom: 26 }}>
        <div style={{
          textAlign: 'center', fontSize: 78, fontWeight: 600,
          letterSpacing: '0.06em', lineHeight: 1, color: BG,
          // Outlined wordmark: fill matches the page, a 1px white shadow rings
          // the merged silhouette (text-shadow rasterises far more reliably than
          // -webkit-text-stroke).
          textShadow: `
            1px 0 0 rgba(255,255,255,0.5), -1px 0 0 rgba(255,255,255,0.5),
            0 1px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(255,255,255,0.5)
          `,
        }}>
          CREASUME
        </div>
      </Block>
    </div>
  )
}

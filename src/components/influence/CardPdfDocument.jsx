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
// So this renders the SAME DESIGN — same palette, same #10133C tiles, same
// gradient avatar ring, same package cards — but as a plain STATIC document:
//   • no animation / transforms / flip cards / carousels / marquees
//   • no backdrop-filter — solid fills only
//   • every section is a self-contained [data-pdf-block] shorter than a page,
//     so pagination can never cut content in half
//   • ALL top posts / collabs / packages shown at once (grids, not carousels)
//
// ⚠️ NO GRADIENT TEXT. The card styles its labels with `background-clip: text`
// + `-webkit-text-fill-color: transparent`. html2canvas can't do that — the text
// would come out INVISIBLE. So the same labels use a solid colour here (ACCENT_2)
// that matches the middle of the card's purple→pink gradient.
//
// Mounted OFF-SCREEN, captured, then unmounted — the user never sees it.
// Rendered at A4 width (794px @96dpi) so 1 document px ≈ 1 PDF px.
// ============================================================================

const FONT = "'Outfit', sans-serif"
const MONO = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace"

export const PDF_WIDTH = 794

// ---- The card's palette ----
const BG = '#08080f'
const TILE = '#10133C' // the card's metric-tile fill
const TILE_LINE = 'rgba(255,255,255,0.08)'
const PANEL = '#0d1030'
const MUTED = 'rgba(255,255,255,0.55)'
const ACCENT = '#8B5CF6'
const ACCENT_2 = '#C04DCC' // solid stand-in for the purple→pink gradient text
const RING = 'linear-gradient(135deg, #8B5CF6 0%, #C04DCC 50%, #EC4899 100%)'

const tile = {
  backgroundColor: TILE,
  border: `1px solid ${TILE_LINE}`,
  borderRadius: 16,
}

// A page-safe section: captured and placed as one unit.
function Block({ children, style }) {
  return <section data-pdf-block style={{ padding: '20px 34px', ...style }}>{children}</section>
}

// Section heading — mirrors the card's MONO gradient labels (solid here).
function Heading({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontFamily: MONO, fontSize: 13, fontWeight: 700, color: ACCENT_2,
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        {children}
      </div>
      {sub && <p style={{ margin: '5px 0 0', fontSize: 11, color: MUTED, fontFamily: FONT }}>{sub}</p>}
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

export default function CardPdfDocument({ data }) {
  const {
    CREATOR = {},
    TOP_POSTS = [],
    PACKAGES = [],
    BRAND_DEALS = [],
    SOCIALS = [],
    AGE_GROUPS = [],
    TOP_COUNTRIES = [],
    TOP_LOCATIONS = [],
    GENDER_SPLIT = null,
  } = data || {}

  const tiles = (CREATOR.tiles || []).filter((t) => t && t.value != null && t.value !== '')
  const avatar = CREATOR.avatar || CREATOR.avatarRaw || ''
  const handle = CREATOR.username ? `@${CREATOR.username}` : ''

  return (
    <div
      id="pdf-doc"
      style={{
        width: PDF_WIDTH,
        background: BG,
        color: '#fff',
        fontFamily: FONT,
      }}
    >
      {/* ===================== HERO ===================== */}
      <Block style={{ paddingTop: 34, paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {/* Avatar — 3px gradient ring, exactly like the card */}
          <div style={{
            width: 128, height: 128, borderRadius: '50%', padding: 3,
            background: RING, flexShrink: 0, position: 'relative',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
              background: 'linear-gradient(135deg, #2a2f6b 0%, #16183c 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 48, fontWeight: 700 }}>{(CREATOR.name || '?').charAt(0)}</span>
              )}
            </div>
            {CREATOR.verified && (
              <span style={{ position: 'absolute', bottom: 0, right: 0, lineHeight: 0 }}>
                <svg width="34" height="34" viewBox="0 0 24 24">
                  <path d={SEAL_PATH} fill="#1D9BF0" stroke="#0b0b1e" strokeWidth="1.2" style={{ paintOrder: 'stroke' }} />
                  <path d="M7.3 12.1 10.4 15.2 16.8 8.4" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, lineHeight: 1.05 }}>{CREATOR.name}</h1>
            {handle && (
              <p style={{ margin: '6px 0 0', fontSize: 14, color: MUTED, fontFamily: MONO }}>{handle}</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 11 }}>
              {CREATOR.niche && <Pill>{CREATOR.niche}</Pill>}
              {CREATOR.isFoundingCreator && <Pill accent>Founding Creator</Pill>}
              {TOP_LOCATIONS[0] && <Pill>{TOP_LOCATIONS[0].short || TOP_LOCATIONS[0].full}</Pill>}
            </div>
          </div>
        </div>

        {CREATOR.bio && (
          <p style={{
            margin: '18px 0 0', fontSize: 13.5, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.8)', fontWeight: 200,
          }}>
            {CREATOR.bio}
          </p>
        )}
      </Block>

      {/* ===================== METRIC TILES (card's 3-col grid) ===================== */}
      {tiles.length > 0 && (
        <Block style={{ paddingTop: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {tiles.map((t, i) => (
              <div
                key={`${t.label}-${i}`}
                style={{
                  ...tile,
                  padding: '20px 14px',
                  minHeight: 92,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: String(t.value).length > 9 ? 20 : 27,
                  fontWeight: 600, lineHeight: 1, color: t.color || '#fff',
                }}>
                  {t.value}
                </div>
                <div style={{
                  marginTop: 8, fontFamily: MONO, fontSize: 11.5, fontWeight: 700,
                  color: ACCENT_2, lineHeight: 1.2,
                }}>
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ===================== AUDIENCE ===================== */}
      {(AGE_GROUPS.length > 0 || TOP_COUNTRIES.length > 0 || GENDER_SPLIT) && (
        <Block>
          <Heading sub="Who actually sees this content.">Audience</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 12 }}>
            {AGE_GROUPS.length > 0 && (
              <div style={{ ...tile, padding: 16 }}>
                <SubLabel>Age</SubLabel>
                {AGE_GROUPS.map((a) => (
                  <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                    <span style={{ width: 46, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{a.label}</span>
                    <span style={{ flex: 1, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.09)' }}>
                      <span style={{ display: 'block', width: `${a.value}%`, height: 7, borderRadius: 4, background: a.color || ACCENT }} />
                    </span>
                    <span style={{ width: 32, textAlign: 'right', fontSize: 11, fontWeight: 700 }}>{a.value}%</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {GENDER_SPLIT && (
                <div style={{ ...tile, padding: 16 }}>
                  <SubLabel>Gender</SubLabel>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <Stat value={`${GENDER_SPLIT.female}%`} label="Female" />
                    <Stat value={`${GENDER_SPLIT.male}%`} label="Male" />
                  </div>
                </div>
              )}
              {TOP_COUNTRIES.length > 0 && (
                <div style={{ ...tile, padding: 16 }}>
                  <SubLabel>Top Countries</SubLabel>
                  {TOP_COUNTRIES.map((c) => (
                    <div key={c.code} style={{ fontSize: 12.5, marginBottom: 5 }}>{c.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Block>
      )}

      {/* ===================== TOP POSTS (grid — all of them) ===================== */}
      {TOP_POSTS.length > 0 && (
        <Block>
          <Heading sub="Best-performing content, with per-post numbers.">Top Posts</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, TOP_POSTS.length)}, 1fr)`, gap: 12 }}>
            {TOP_POSTS.map((p, i) => (
              <div key={i} style={{ ...tile, overflow: 'hidden' }}>
                {p.photo && (
                  <img
                    src={p.photo}
                    alt=""
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    style={{ display: 'block', width: '100%', height: 180, objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '11px 12px' }}>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 9, height: 26, overflow: 'hidden', lineHeight: 1.3 }}>
                    {p.caption}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {[['Views', p.views], ['Likes', p.likes], ['Comm', p.comments]].map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                        <div style={{ fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ===================== BRAND COLLABORATIONS ===================== */}
      {BRAND_DEALS.length > 0 && (
        <Block>
          <Heading sub="Previous partnerships and the reach they delivered.">Brand Collaborations</Heading>
          <div style={{ ...tile, overflow: 'hidden' }}>
            {BRAND_DEALS.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '12px 15px',
                borderTop: i === 0 ? 'none' : `1px solid ${TILE_LINE}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: PANEL, border: `1px solid ${TILE_LINE}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: ACCENT_2,
                }}>
                  {(b.brand || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{b.brand}</div>
                  {b.campaign && <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{b.campaign}</div>}
                </div>
                {b.tag && <span style={{ fontSize: 9, color: MUTED, fontFamily: MONO, letterSpacing: '0.08em' }}>{b.tag}</span>}
                {b.reach && <Stat value={b.reach} label="Reach" right />}
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ===================== PACKAGES ===================== */}
      {PACKAGES.length > 0 && (
        <Block>
          <Heading sub="Standard services. Exact quotes provided after alignment.">Collaboration Packages</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, PACKAGES.length)}, 1fr)`, gap: 12 }}>
            {PACKAGES.map((p, i) => (
              <div key={`${p.tier}-${i}`} style={{
                ...tile,
                padding: 16,
                position: 'relative',
                borderColor: p.popular ? 'rgba(139,92,246,0.6)' : TILE_LINE,
                background: p.popular ? '#171449' : TILE,
              }}>
                {p.popular && (
                  <span style={{
                    position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
                    background: ACCENT, color: '#fff', fontSize: 9, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </span>
                )}
                <div style={{ fontFamily: MONO, fontSize: 10, color: ACCENT_2, letterSpacing: '0.12em', fontWeight: 700 }}>
                  {p.tier}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{p.price}</div>
                <div style={{ fontSize: 9.5, color: MUTED, marginTop: 3, fontFamily: MONO }}>{p.sub}</div>
                {Array.isArray(p.features) && p.features.length > 0 && (
                  <ul style={{ margin: '13px 0 0', padding: 0, listStyle: 'none' }}>
                    {p.features.map((f, fi) => (
                      <li key={fi} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.82)', marginBottom: 6, paddingLeft: 13, position: 'relative', lineHeight: 1.35 }}>
                        <span style={{ position: 'absolute', left: 0, color: ACCENT }}>•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ===================== CONTACT ===================== */}
      <Block>
        <Heading sub="Looking for transparent, data-driven partnerships? Let's talk.">Work With Me</Heading>
        <div style={{ ...tile, padding: 18, display: 'flex', flexWrap: 'wrap', gap: 26 }}>
          {SOCIALS.filter((s) => s && s.handle).map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: ACCENT_2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {s.name}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{s.handle}</div>
            </div>
          ))}
        </div>
      </Block>

      {/* ===================== CREASUME WORDMARK ===================== */}
      <Block style={{ paddingTop: 4, paddingBottom: 30 }}>
        <div style={{
          textAlign: 'center',
          fontSize: 74, fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1,
          color: BG,
          // The card's outlined wordmark: fill matches the page, a 1px white
          // shadow rings the merged silhouette. (No -webkit-text-stroke — the
          // exporter renders text-shadow far more reliably.)
          textShadow: `
            1px 0 0 rgba(255,255,255,0.45), -1px 0 0 rgba(255,255,255,0.45),
            0 1px 0 rgba(255,255,255,0.45), 0 -1px 0 rgba(255,255,255,0.45)
          `,
        }}>
          CREASUME
        </div>
      </Block>
    </div>
  )
}

// ---- small shared bits ----
function Pill({ children, accent }) {
  return (
    <span style={{
      display: 'inline-block', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: accent ? 'rgba(139,92,246,0.16)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${accent ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.12)'}`,
      color: accent ? '#C9BDFF' : 'rgba(255,255,255,0.8)',
    }}>
      {children}
    </span>
  )
}

function SubLabel({ children }) {
  return (
    <div style={{
      fontFamily: MONO, fontSize: 10, color: ACCENT_2, marginBottom: 11,
      textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
    }}>
      {children}
    </div>
  )
}

function Stat({ value, label, right }) {
  return (
    <div style={{ textAlign: right ? 'right' : 'left' }}>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
    </div>
  )
}

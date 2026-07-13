// ============================================================================
// STATIC PDF DOCUMENT — a purpose-built, print-ready rendering of the Influence
// Card, used ONLY for the "Download PDF" export.
//
// WHY THIS EXISTS
// The live card is a scroll-driven experience: framer-motion entrances, 3D flip
// cards, scroll-linked marquee bands, sticky carousels and backdrop-filter glass.
// html2canvas re-implements CSS from scratch and supports NONE of those, so
// rasterising the live DOM produced mirrored card-backs, giant misplaced band
// text, near-empty carousel pages and washed-out grey glass panels.
//
// So instead of fighting the live DOM, we render THIS: the same data and the
// same visual language, laid out as a plain static document —
//   • no animation, no transforms, no flip cards, no carousels, no marquees
//   • no backdrop-filter / glass — solid fills only
//   • every section is a self-contained [data-pdf-block] shorter than a page,
//     so the exporter can paginate without ever cutting content in half
//   • ALL top posts / collabs / packages are shown at once (grids, not carousels)
//
// It is rendered OFF-SCREEN, captured, then unmounted — the user never sees it.
// Rendered at A4 width (794px @ 96dpi) so 1 document px ≈ 1 PDF px.
// ============================================================================

const FONT = "'Outfit', sans-serif"
const MONO = "'Space Mono', ui-monospace, monospace"

export const PDF_WIDTH = 794 // A4 width @96dpi

const BG = '#07070b'
const PANEL = '#101018'
const PANEL_2 = '#15151f'
const LINE = 'rgba(255,255,255,0.10)'
const MUTED = 'rgba(255,255,255,0.45)'
const ACCENT = '#7C5CFF'

// A page-safe section. Each one is captured and placed as a unit.
function Block({ children, style }) {
  return (
    <section
      data-pdf-block
      style={{ padding: '22px 30px', ...style }}
    >
      {children}
    </section>
  )
}

function Heading({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '0.02em' }}>{children}</h2>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 11, color: MUTED }}>{sub}</p>}
    </div>
  )
}

const card = {
  background: PANEL,
  border: `1px solid ${LINE}`,
  borderRadius: 12,
}

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
        // No animation/transition anywhere in this tree — it's a static document.
      }}
    >
      {/* ===================== PROFILE ===================== */}
      <Block style={{ paddingTop: 30 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {avatar ? (
            <img
              src={avatar}
              alt=""
              crossOrigin="anonymous"
              style={{
                width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
                border: `2px solid ${ACCENT}`, flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: '50%', flexShrink: 0,
              background: PANEL_2, border: `2px solid ${ACCENT}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, fontWeight: 700,
            }}>
              {(CREATOR.name || '?').charAt(0).toUpperCase()}
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{CREATOR.name}</h1>
              {CREATOR.verified && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 20, height: 20, borderRadius: '50%', background: ACCENT,
                  fontSize: 12, fontWeight: 700,
                }}>✓</span>
              )}
            </div>
            {handle && <p style={{ margin: '4px 0 0', fontSize: 13, color: MUTED, fontFamily: MONO }}>{handle}</p>}
            {CREATOR.niche && (
              <span style={{
                display: 'inline-block', marginTop: 9, padding: '4px 11px', borderRadius: 999,
                background: 'rgba(124,92,255,0.14)', border: '1px solid rgba(124,92,255,0.45)',
                color: '#C9BDFF', fontSize: 11, fontWeight: 600,
              }}>{CREATOR.niche}</span>
            )}
          </div>
        </div>

        {CREATOR.bio && (
          <p style={{ margin: '16px 0 0', fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
            {CREATOR.bio}
          </p>
        )}
      </Block>

      {/* ===================== KEY METRICS ===================== */}
      {tiles.length > 0 && (
        <Block>
          <Heading sub="Live figures pulled from the connected Instagram account.">Key Metrics</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {tiles.map((t, i) => (
              <div key={`${t.label}-${i}`} style={{ ...card, padding: '13px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{t.value}</div>
                <div style={{ marginTop: 3, fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ===================== AUDIENCE ===================== */}
      {(AGE_GROUPS.length > 0 || TOP_COUNTRIES.length > 0 || GENDER_SPLIT || TOP_LOCATIONS.length > 0) && (
        <Block>
          <Heading sub="Who actually sees this content.">Audience</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {AGE_GROUPS.length > 0 && (
              <div style={{ ...card, padding: 14 }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Age</div>
                {AGE_GROUPS.map((a) => (
                  <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span style={{ width: 44, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{a.label}</span>
                    <span style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                      <span style={{ display: 'block', width: `${a.value}%`, height: 6, borderRadius: 3, background: a.color || ACCENT }} />
                    </span>
                    <span style={{ width: 30, textAlign: 'right', fontSize: 11, fontWeight: 600 }}>{a.value}%</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GENDER_SPLIT && (
                <div style={{ ...card, padding: 14 }}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gender</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div><div style={{ fontSize: 19, fontWeight: 700 }}>{GENDER_SPLIT.female}%</div><div style={{ fontSize: 10, color: MUTED }}>Female</div></div>
                    <div><div style={{ fontSize: 19, fontWeight: 700 }}>{GENDER_SPLIT.male}%</div><div style={{ fontSize: 10, color: MUTED }}>Male</div></div>
                  </div>
                </div>
              )}
              {TOP_COUNTRIES.length > 0 && (
                <div style={{ ...card, padding: 14 }}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Countries</div>
                  {TOP_COUNTRIES.map((c) => (
                    <div key={c.code} style={{ fontSize: 12, marginBottom: 4 }}>{c.name}</div>
                  ))}
                </div>
              )}
              {TOP_LOCATIONS.length > 0 && (
                <div style={{ ...card, padding: 14 }}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Cities</div>
                  {TOP_LOCATIONS.map((l) => (
                    <div key={l.full} style={{ fontSize: 12, marginBottom: 4 }}>{l.short || l.full}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Block>
      )}

      {/* ===================== TOP POSTS (grid — ALL of them) ===================== */}
      {TOP_POSTS.length > 0 && (
        <Block>
          <Heading sub="Best-performing content, with per-post reach.">Top Posts</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, TOP_POSTS.length)}, 1fr)`, gap: 10 }}>
            {TOP_POSTS.map((p, i) => (
              <div key={i} style={{ ...card, overflow: 'hidden' }}>
                {p.photo && (
                  <img
                    src={p.photo}
                    alt=""
                    crossOrigin="anonymous"
                    style={{ display: 'block', width: '100%', height: 168, objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '10px 11px' }}>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 7, height: 26, overflow: 'hidden' }}>
                    {p.caption}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                    {[['Views', p.views], ['Likes', p.likes], ['Comm.', p.comments]].map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{v}</div>
                        <div style={{ fontSize: 8, color: MUTED, textTransform: 'uppercase' }}>{k}</div>
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
          <div style={{ ...card, overflow: 'hidden' }}>
            {BRAND_DEALS.map((b, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  borderTop: i === 0 ? 'none' : `1px solid ${LINE}`,
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: PANEL_2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: ACCENT,
                }}>
                  {(b.brand || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{b.brand}</div>
                  {b.campaign && <div style={{ fontSize: 10, color: MUTED }}>{b.campaign}</div>}
                </div>
                {b.tag && (
                  <span style={{ fontSize: 9, color: MUTED, letterSpacing: '0.08em' }}>{b.tag}</span>
                )}
                {b.reach && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{b.reach}</div>
                    <div style={{ fontSize: 8, color: MUTED, textTransform: 'uppercase' }}>Reach</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ===================== PACKAGES ===================== */}
      {PACKAGES.length > 0 && (
        <Block>
          <Heading sub="Standard services. Exact quotes provided after alignment.">Collaboration Packages</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, PACKAGES.length)}, 1fr)`, gap: 10 }}>
            {PACKAGES.map((p, i) => (
              <div
                key={`${p.tier}-${i}`}
                style={{
                  ...card,
                  padding: 14,
                  borderColor: p.popular ? 'rgba(124,92,255,0.55)' : LINE,
                  background: p.popular ? '#141026' : PANEL,
                }}
              >
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.tier}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 5 }}>{p.price}</div>
                <div style={{ fontSize: 9, color: MUTED, marginTop: 2, fontFamily: MONO }}>{p.sub}</div>
                {Array.isArray(p.features) && p.features.length > 0 && (
                  <ul style={{ margin: '11px 0 0', padding: 0, listStyle: 'none' }}>
                    {p.features.map((f, fi) => (
                      <li key={fi} style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 5, paddingLeft: 12, position: 'relative' }}>
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
      <Block style={{ paddingBottom: 34 }}>
        <Heading sub="Looking for transparent, data-driven partnerships? Let's talk.">Work With Me</Heading>
        <div style={{ ...card, padding: 16, display: 'flex', flexWrap: 'wrap', gap: 22 }}>
          {SOCIALS.filter((s) => s && s.handle).map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.name}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{s.handle}</div>
            </div>
          ))}
        </div>
      </Block>
    </div>
  )
}

// Talks to the Creasume backend (../Creasume/backend) and reshapes its public
// media-kit response into the dataset the /influence page renders. The page
// works with zero backend (it falls back to the bundled Sample.Creator demo),
// so every mapper here degrades gracefully when a field is missing.

import { summariseCampaigns } from '../components/influence/influenceData.js'

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Which creator the page loads — taken from the FIRST path segment, so the
// media kit lives at a clean `/<username>` (e.g. `/finding.rhythm`). The home
// page (`/`), the legal pages, and the app routes are reserved and return no
// creator. The SPA rewrite in vercel.json makes these deep links / refreshes
// serve index.html.
const RESERVED_PATHS = ['privacy-policy', 'terms', 'contact', 'pricing', 'how-it-works', 'influence', 'dashboard', 'waitlist', 'auth-success', 'dev-login', 'preview', 'landing']
export function resolveUsername() {
  if (typeof window === 'undefined') return ''
  const path = window.location.pathname.replace(/\/+$/, '')
  const parts = path.split('/').filter(Boolean)
  if (!parts.length || RESERVED_PATHS.includes(parts[0])) return ''
  // Card URLs are /<username>/<publicId> (username visible, unguessable id) — or
  // the legacy /<publicId>. Either way the card is resolved by the opaque
  // publicId, which is ALWAYS the LAST path segment. A bare /<username> (no id)
  // therefore resolves to the username, which the backend rejects (publicId-only)
  // → the card stays private.
  return decodeURIComponent(parts[parts.length - 1])
}

// 1234567 → "1.2M", 12500 → "12.5K". Returns null for missing/NaN so callers
// can decide whether to keep the default value.
export function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return null
  const num = Number(n)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(num)
}

// Convert the /public/lookup payload (real public IG data for ANY username, no
// login) into the same `api` shape mapInfluenceData() consumes, so the full
// Influence Card renders with the FETCHED public data. Only the fields Instagram
// exposes publicly are filled; reach/impressions/demographics stay empty (they
// need the creator's own token), so those card sections hide themselves.
function lookupToApiShape(d) {
  const media = (d.recentPosts || []).map((p) => ({
    id: p.id,
    caption: p.caption || '',
    media_type: p.isVideo ? 'VIDEO' : 'IMAGE',
    media_url: p.thumbnail,
    thumbnail_url: p.thumbnail,
    permalink: p.permalink,
    like_count: p.likes || 0,
    comments_count: p.comments || 0,
  }))
  // Sample (dummy) collaborations + packages shown ONLY in the lookup preview,
  // so a creator who isn't on Creasume yet can see what their full card would
  // look like. Real followers/likes/comments stay real; these are placeholders.
  const SAMPLE_COLLABS = [
    { brandName: 'Nykaa', campaignTitle: 'Festive Glow Campaign', category: 'Beauty', description: 'Sample brand collaboration — this is placeholder work to preview your card.' },
    { brandName: 'Myntra', campaignTitle: 'Summer Styling Reel', category: 'Fashion', description: 'Sample brand collaboration — add your real deals once you join Creasume.' },
    { brandName: 'boAt', campaignTitle: 'Everyday Audio', category: 'Tech', description: 'Sample brand collaboration to show how partnerships appear on your card.' },
  ]
  const SAMPLE_PACKAGES = [
    { title: 'Starter', pricing: 5000, deliverables: ['1 Reel', '1 Story'], turnaroundTime: '3 days' },
    { title: 'Core', pricing: 12000, deliverables: ['2 Reels', '3 Stories', '1 Post'], turnaroundTime: '5 days', isPopular: true },
    { title: 'Campaign', pricing: 30000, deliverables: ['4 Reels', '6 Stories', '2 Posts'], turnaroundTime: '10 days' },
  ]

  // ---- Dummy data for the metrics Instagram DOESN'T expose publicly ----
  // (reach, views, impressions, demographics, follower growth, engagement chart,
  // Creasume Score). Scaled to the REAL follower count so the preview looks
  // believable — these are placeholders, replaced by real numbers once the
  // creator connects their account.
  const followers = d.followers || 0
  const realLikes = media.reduce((s, m) => s + (m.like_count || 0), 0)
  const realComments = media.reduce((s, m) => s + (m.comments_count || 0), 0)
  const engRate = d.engagementRateEstimate || 4.5

  // Reach ≈ 55% of followers, views ≈ 1.6× reach, impressions = views (sample).
  const reach = Math.round(followers * 0.55) || 1200
  const views = Math.round(reach * 1.6)
  const impressions = views

  // 12-month follower growth trending up to the current real count.
  const growth = Array.from({ length: 12 }, (_, i) => {
    const monthsAgo = 11 - i
    const factor = 1 - monthsAgo * 0.045 // ~4.5% growth/month back-cast
    const date = new Date()
    date.setMonth(date.getMonth() - monthsAgo)
    return {
      date: date.toISOString(),
      followers: Math.max(1, Math.round(followers * factor)),
      engagement: Math.round((engRate + (i - 6) * 0.15) * 10) / 10,
    }
  })

  // Sample audience demographics ({key,value} arrays like the real backend).
  const demographics = {
    age: [
      { key: '18-24', value: 42 }, { key: '25-34', value: 33 },
      { key: '13-17', value: 12 }, { key: '35-44', value: 9 }, { key: '45-54', value: 4 },
    ],
    gender: [{ key: 'F', value: 58 }, { key: 'M', value: 40 }, { key: 'U', value: 2 }],
    country: [
      { key: 'IN', value: 72 }, { key: 'US', value: 9 },
      { key: 'GB', value: 5 }, { key: 'AE', value: 4 }, { key: 'CA', value: 3 },
    ],
    city: [
      { key: 'Mumbai, Maharashtra', value: 18 }, { key: 'Delhi, Delhi', value: 14 },
      { key: 'Bengaluru, Karnataka', value: 9 },
    ],
  }

  return {
    creator: {
      username: d.username,
      name: d.fullName || d.username,
      bio: d.bio || '',
      profilePicture: d.profilePicture || '',
      // Preview: show the founding badge + verified tick as a sample of the
      // full card. (Real cards derive these from the creator's admin flags.)
      isVerified: true,
      isFoundingCreator: true,
      // Preview mode: no publicId (this isn't a saved Creasume creator).
    },
    stats: {
      followersCount: d.followers,
      followsCount: d.following,
      mediaCount: d.posts,
      engagementRate: engRate,
      totalLikes: realLikes,
      totalComments: realComments,
      // Dummy — not publicly fetchable:
      reach,
      views,
      impressions,
      creasumeScore: Math.min(98, Math.max(42, Math.round(50 + engRate * 4 + Math.log10(followers + 1) * 6))),
    },
    media,
    demographics,
    collaborations: SAMPLE_COLLABS,
    packages: SAMPLE_PACKAGES,
    packagesActive: true,
    growth,
    isLookupPreview: true,
  }
}

// GET /public/:username → the raw backend payload, or null if there's no
// configured creator, the request fails, or the creator isn't found.
//
// PREVIEW MODE: when the URL carries `?lookup=<username>`, fetch REAL public data
// from /public/lookup/<username> instead and render the Influence Card with it —
// so you can open any creator's card populated by the on-the-fly fetch.
export async function fetchInfluenceData() {
  if (typeof window !== 'undefined') {
    const lookup = new URLSearchParams(window.location.search).get('lookup')
    if (lookup) {
      const res = await fetch(
        `${API_BASE}/public/lookup/${encodeURIComponent(lookup.replace(/^@/, ''))}`,
        { cache: 'no-store' },
      )
      const data = await res.json().catch(() => null)
      if (!data?.success || !data.data) return null
      return lookupToApiShape(data.data)
    }
  }

  const username = resolveUsername()
  if (!username) return null
  const res = await fetch(`${API_BASE}/public/${encodeURIComponent(username)}`, { cache: 'no-store' })
  const data = await res.json().catch(() => null)
  if (!data?.success || !data.creator) return null
  return data
}

// POST /inquiry/send/:username — used by the "Work With Me" form. The backend
// stores { brandName, email, campaignType, brief }; campaignType is sent as its
// own field, and the optional agency is folded into the brief so nothing the
// brand typed is lost. Creating the inquiry both drops it into the creator's
// dashboard AND raises their Creasume Score (brand inquiries are a scored
// funnel action on the backend).
export async function sendInquiry({ brand, agency, email, campaignType, brief }) {
  const username = resolveUsername()
  if (!username) throw new Error('No creator configured')
  const briefParts = [
    agency && `Agency: ${agency}`,
    brief,
  ].filter(Boolean)
  const res = await fetch(`${API_BASE}/inquiry/send/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandName: brand, email, campaignType, brief: briefParts.join('\n') }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) throw new Error(data.error || 'Failed to send inquiry')
  return data
}

const AGE_PALETTE = ['#8B5CF6', '#4DE0B0', '#F4C13B', '#5D65DC', '#E731A2']

// Normalise an admin-entered platform name to the display label the Professional
// Presence section uses for its icon + heading.
const PLATFORM_DISPLAY = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  'twitter / x': 'X (Twitter)', 'twitter/x': 'X (Twitter)', twitter: 'X (Twitter)', x: 'X (Twitter)',
  tiktok: 'TikTok',
  website: 'Website',
  linkedin: 'LinkedIn',
}
export const displayPlatform = (p) =>
  PLATFORM_DISPLAY[String(p || '').trim().toLowerCase()] || (p || 'Link')

// Short label shown under the platform name. For social profiles that's the
// "@handle" (last path segment); for a website it's the bare domain. Kept short
// and decoded so a pasted blob / over-long path can't blow out the card.
const clampHandle = (s, max = 24) => (s.length > max ? `${s.slice(0, max - 1)}…` : s)
export function socialHandle(url) {
  const raw = String(url || '').trim()
  let label
  let isPath = false
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    const seg = u.pathname.split('/').filter(Boolean).pop()
    if (seg) { label = seg; isPath = true }
    else label = u.hostname.replace(/^www\./, '')
  } catch {
    label = raw
  }
  // Decode %20 etc., then keep just the first token — real handles/domains have
  // no spaces, so a pasted description (or junk URL) can't leak its whole text.
  try { label = decodeURIComponent(label) } catch { /* keep as-is */ }
  label = label.trim().split(/\s+/)[0].replace(/^@/, '')
  return clampHandle(isPath ? `@${label}` : label)
}

// "2024-08-01T..." → "Aug 2024". Empty for missing/invalid dates.
function campaignDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

// A short audience line for a campaign card, derived from the creator's
// account-level demographics (Instagram has no per-post city/gender breakdown).
function campaignAudience(demo) {
  const parts = []
  const g = {}
  ;(demo.gender || []).forEach((x) => { g[x.key] = x.value })
  const f = g.F || 0
  const m = g.M || 0
  if (f + m > 0) {
    const femalePct = Math.round((f / (f + m)) * 100)
    parts.push(femalePct >= 50 ? `${femalePct}% Female` : `${100 - femalePct}% Male`)
  }
  const cities = (demo.city || []).slice(0, 3).map((c) => String(c.key).split(',')[0])
  if (cities.length) parts.push(`Top cities: ${cities.join(', ')}`)
  return parts.join('. ') || 'Audience insights available on request.'
}

// Linked-post media type → a human deliverable label.
const deliverableLabel = (mediaType) =>
  mediaType === 'VIDEO' ? 'Reel' : mediaType === 'CAROUSEL_ALBUM' ? 'Carousel' : 'Post'

// Indian state / UT → short code, so "Indore, Madhya Pradesh" → "Indore, MP".
const STATE_ABBR = {
  'andhra pradesh': 'AP', 'arunachal pradesh': 'AR', assam: 'AS', bihar: 'BR',
  chhattisgarh: 'CG', goa: 'GA', gujarat: 'GJ', haryana: 'HR',
  'himachal pradesh': 'HP', jharkhand: 'JH', karnataka: 'KA', kerala: 'KL',
  'madhya pradesh': 'MP', maharashtra: 'MH', manipur: 'MN', meghalaya: 'ML',
  mizoram: 'MZ', nagaland: 'NL', odisha: 'OD', punjab: 'PB', rajasthan: 'RJ',
  sikkim: 'SK', 'tamil nadu': 'TN', telangana: 'TG', tripura: 'TR',
  'uttar pradesh': 'UP', uttarakhand: 'UK', 'west bengal': 'WB', delhi: 'DL',
  'jammu and kashmir': 'JK', ladakh: 'LA', puducherry: 'PY', chandigarh: 'CH',
  'andaman and nicobar islands': 'AN', lakshadweep: 'LD',
}

// "City, State" → "City, ST" (known states get their code; otherwise the
// state's word-initials). Strings without a comma are returned unchanged.
export function shortenLocation(loc) {
  const parts = String(loc).split(',').map((s) => s.trim())
  if (parts.length < 2) return loc
  const city = parts[0]
  const state = parts.slice(1).join(', ')
  let abbr = STATE_ABBR[state.toLowerCase()]
  if (!abbr) {
    const words = state.split(/\s+/)
    abbr = words.length > 1
      ? words.map((w) => w[0]).join('').slice(0, 3).toUpperCase()
      : state.slice(0, 2).toUpperCase()
  }
  return `${city}, ${abbr}`
}

// Reshape the backend payload into the influence dataset, overriding only the
// pieces we have real data for and leaving the rest at their demo defaults.
export function mapInfluenceData(api, d) {
  const c = api.creator || {}
  const s = api.stats || {}
  const demo = api.demographics || {}
  const media = api.media || []

  // ---- Theme: the creator's saved color palette (JSON: { primary, secondary,
  // bg, font }). Drives the whole card's accent via CSS variables on the root.
  let THEME = null
  if (c.theme) {
    try {
      const t = typeof c.theme === 'string' ? JSON.parse(c.theme) : c.theme
      if (t && t.primary) {
        const primary = t.primary
        const secondary = t.secondary || t.primary
        THEME = {
          primary,
          secondary,
          grad: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
          bg: t.bg || 'solid',
          font: t.font || null,
        }
      }
    } catch { /* malformed theme JSON → keep the default palette */ }
  }
  // Dedupe collaborations so an accidental duplicate entry doesn't render the
  // same campaign card twice (which the looping marquee then doubles to four).
  const collabsRaw = api.collaborations || []
  const collabSeen = new Set()
  const collabs = collabsRaw.filter((x) => {
    const key = x?._id || `${x?.brandName || ''}|${x?.campaignTitle || ''}|${x?.reach || ''}`
    if (collabSeen.has(key)) return false
    collabSeen.add(key)
    return true
  })
  const packages = api.packages || []
  const growth = api.growth || []

  // For a real creator, a missing metric means "no data" → show 0, not the
  // bundled demo number. formatCount(0) is "0"; formatCount(null) is null.
  const fc0 = (v) => formatCount(v) ?? '0'
  const eng = s.engagementRate != null ? `${s.engagementRate}%` : '0%'
  // Numeric 30-day engagement rate (the headline value) — used to fill the 30D
  // chart so it reflects the real 30-day engagement instead of empty weekly buckets.
  const ENG_RATE = s.engagementRate != null ? s.engagementRate : null

  // ---- Hero pills (followers / engagement / views / reach) ----
  const pills = d.CREATOR.pills.map((p) => ({ ...p }))
  pills[0].value = fc0(s.followersCount)
  pills[1].value = eng
  pills[2].value = fc0(s.views)
  pills[3].value = fc0(s.reach)

  // ---- 3×3 metric grid (override by label, keep icons/colors) ----
  const topCity = demo.city?.[0]?.key
  // /me/media returns feed posts AND Reels combined. Count only feed posts
  // toward the likes / impressions totals (exclude Reels). Items without a
  // product type (e.g. before the backend sends `media_product_type`) are kept
  // so the totals never collapse to 0.
  const sumMedia = (key) => media.reduce((a, m) => a + (m[key] || 0), 0)
  // Last-30-day interactions the account received (account-level insights from
  // the backend) — counts engagement on all posts in the window, not just newly
  // published ones. Falls back to whole-profile / fetched-post sums if absent.
  const likeT = s.likes30d != null ? s.likes30d : (s.totalLikes != null ? s.totalLikes : sumMedia('like_count'))
  const commentT = s.comments30d != null ? s.comments30d : (s.totalComments != null ? s.totalComments : sumMedia('comments_count'))
  const shareT = s.shares30d != null ? s.shares30d : sumMedia('shares')
  const tileValues = {
    'Engagement Rate': eng,
    // Key must match the tile/pill label exactly ('Total Views'), else the
    // override never applies and the demo 43,000 shows.
    'Total Views': fc0(s.views),
    'Total Post': fc0(s.mediaCount),
    'Total Followers': fc0(s.followersCount),
    // Real impressions metric if present, otherwise the combined likes +
    // comments + shares total (each is also shown in the mini-row below).
    'Total Impressions': fc0(s.impressions || likeT + commentT + shareT),
    Reach: fc0(s.reach),
    'Top City': topCity || null,
    'Brand Deals Done': String(collabs.length),
    // Real Creasume Score from the backend (0–100, 2 decimals). Falls back to
    // the bundled demo value only when the backend doesn't supply one.
    'Creasume Score': s.creasumeScore != null ? String(s.creasumeScore) : null,
  }
  // The Impressions tile shows likes / comments / shares as a mini-row beneath.
  const impressionDetails = [
    { icon: 'heart', value: fc0(likeT) },
    { icon: 'comment', value: fc0(commentT) },
    { icon: 'share', value: fc0(shareT) },
  ]
  const tilesAll = d.CREATOR.tiles.map((t) => {
    const nt = tileValues[t.label] != null ? { ...t, value: tileValues[t.label] } : t
    return t.label === 'Total Impressions' ? { ...nt, details: impressionDetails } : nt
  })

  // ---- Per-metric visibility (dashboard stat-card toggles) ----
  // `metricVisibility` maps a metric key → boolean. A missing/true key shows the
  // metric; false hides its hero pill AND its grid tile from the public card.
  const VIS = c.metricVisibility || {}
  const isOn = (key) => !key || VIS[key] !== false
  const PILL_KEY = { Followers: 'followers', 'Eng. Rate': 'engagement', 'Total Views': 'views', 'Total Reach': 'reach' }
  const TILE_KEY = {
    'Total Followers': 'followers', 'Engagement Rate': 'engagement', 'Total Views': 'views',
    Reach: 'reach', 'Total Post': 'posts', 'Total Impressions': 'impressions',
    'Creasume Score': 'creasumeScore', 'Brand Deals Done': 'brandDeals', 'Top City': 'topCity',
  }
  const visiblePills = pills.filter((p) => isOn(PILL_KEY[p.label]))
  const tiles = tilesAll.filter((t) => isOn(TILE_KEY[t.label]))

  const CREATOR = {
    ...d.CREATOR,
    name: c.name || c.username || d.CREATOR.name,
    username: c.username || d.CREATOR.username,
    bio: c.bio || d.CREATOR.bio,
    niche: c.niche || d.CREATOR.niche,
    // Admin-managed badges. A Founding Creator is always verified.
    isFoundingCreator: !!c.isFoundingCreator,
    verified: !!(c.isVerified || c.isFoundingCreator),
    // Load the avatar through our backend proxy (the raw Instagram CDN URL is
    // hotlink-blocked and expires); ProfileHero falls back to the initial if
    // even the proxy can't serve it. Keyed by the opaque publicId (falling back
    // to username) so the request doesn't leak the @handle and still resolves.
    avatar: c.profilePicture && (c.publicId || c.username)
      ? `${API_BASE}/public/avatar/${encodeURIComponent(c.publicId || c.username)}`
      : '',
    // Raw Instagram CDN URL — used as a fallback if the proxy isn't deployed yet
    // (ProfileHero tries it with referrerPolicy=no-referrer before the initial).
    avatarRaw: c.profilePicture || '',
    pills: visiblePills,
    tiles,
  }

  // ---- Follower growth line (need ≥2 daily points to draw a trend) ----
  // Real data only — empty until the creator has snapshots.
  let GROWTH = []
  let MONTHS = []
  if (growth.length >= 2) {
    const pts = growth.slice(-7)
    GROWTH = pts.map((g) => g.followers / 1000)
    MONTHS = pts.map((g) => new Date(g.date).toLocaleString('en-US', { month: 'short' }))
  }

  // ---- Engagement-rate chart is WHOLE-PROFILE only (never per-post). Real
  // series built below from snapshots; empty until data exists.
  const ENGAGEMENT_BARS = []
  const ENG_MONTHS = MONTHS

  // Dated raw series so the 30D / 90D / 1Y toggle can filter by time window in
  // the component. Followers + engagement come from the backend's daily
  // snapshots (growth[]), so both charts read the SAME real history.
  const GROWTH_POINTS = growth.map((g) => ({ date: g.date, followers: g.followers }))
  // Whole-profile engagement rate over time, bucketed by month by the backend
  // (avg interactions per post that month ÷ followers × 100). This varies month
  // to month and is available immediately. Falls back to daily snapshot history,
  // then to the current whole-profile rate flat — never per-post.
  const engHistory = Array.isArray(api.engagementHistory) ? api.engagementHistory : []
  const ENG_POINTS = engHistory.length
    ? engHistory.map((e) => ({ date: e.date, rate: e.rate }))
    : growth.some((g) => g.engagement > 0)
      ? growth
          .filter((g) => g.engagement > 0)
          .map((g) => ({ date: g.date, rate: g.engagement }))
      : s.engagementRate != null
        ? [
            { date: new Date(Date.now() - 365 * 86400000).toISOString(), rate: s.engagementRate },
            { date: new Date().toISOString(), rate: s.engagementRate },
          ]
        : []
  // Weekly buckets so the 30-day view varies week-to-week; falls back to the
  // monthly series when the backend doesn't supply weekly data.
  const engWeekly = Array.isArray(api.engagementWeekly) ? api.engagementWeekly : []
  const ENG_POINTS_WEEKLY = engWeekly.length
    ? engWeekly.map((e) => ({ date: e.date, rate: e.rate }))
    : ENG_POINTS
  // True when the series is real per-post-month/week data (so the chart should
  // show each period's actual value — 0 where there were no posts — instead of
  // carrying the previous value forward and looking falsely flat).
  const ENG_FROM_POSTS = engHistory.length > 0

  // ---- Audience: age distribution, top cities, gender split ----
  // Real data only — each stays empty until Instagram demographics arrive.
  let AGE_GROUPS = []
  if (demo.age?.length) {
    const total = demo.age.reduce((a, x) => a + (x.value || 0), 0) || 1
    AGE_GROUPS = demo.age.slice(0, 5).map((x, i) => ({
      label: x.key,
      value: Math.round((x.value / total) * 100),
      color: AGE_PALETTE[i % AGE_PALETTE.length],
    }))
  }

  let TOP_LOCATIONS = []
  if (demo.city?.length) {
    TOP_LOCATIONS = demo.city.slice(0, 3).map((x) => ({ full: x.key, short: shortenLocation(x.key) }))
  }

  // Country breakdown comes back as ISO codes (IN, US, …) — turn them into
  // readable names ("India", "United States") via Intl, falling back to the code.
  let TOP_COUNTRIES = []
  if (demo.country?.length) {
    let regionNames = null
    try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }) } catch { regionNames = null }
    TOP_COUNTRIES = demo.country.slice(0, 3).map((x) => {
      let name
      try { name = regionNames?.of(x.key) || x.key } catch { name = x.key }
      return { code: String(x.key).toLowerCase(), name }
    })
  }

  let GENDER_SPLIT = null
  if (demo.gender?.length) {
    const g = {}
    demo.gender.forEach((x) => { g[x.key] = x.value })
    const f = g.F || 0
    const m = g.M || 0
    if (f + m > 0) {
      GENDER_SPLIT = {
        female: Math.round((f / (f + m)) * 100),
        male: Math.round((m / (f + m)) * 100),
      }
    }
  }

  // ---- Professional presence rows ----
  // Instagram is the connected account, so it's ALWAYS shown and pinned to the
  // CENTRE. Admin-managed social links (any platform except Instagram) flank it,
  // split evenly to its left and right.
  // At most 5 admin-added links flank Instagram.
  const otherRows = (Array.isArray(c.socialLinks) ? c.socialLinks : [])
    .filter((l) => l && l.platform && l.url && l.enabled !== false && displayPlatform(l.platform) !== 'Instagram')
    .slice(0, 5)
    .map((l) => ({
      name: displayPlatform(l.platform),
      handle: socialHandle(l.url),
      status: '',
      url: l.url,
    }))
  const instagramRow = {
    name: 'Instagram',
    handle: c.username ? `@${c.username}` : (d.SOCIALS.find((x) => x.name === 'Instagram')?.handle || ''),
    // Show the follower count ONLY when Instagram is the sole card; once other
    // links are added, drop it so the row stays clean.
    status: otherRows.length === 0 && s.followersCount != null
      ? `${formatCount(s.followersCount)} followers`
      : '',
    url: c.username
      ? `https://instagram.com/${c.username}`
      : c.socials?.instagram || undefined,
  }
  // Flank the centred Instagram: 1st extra link → right, 2nd → left, 3rd →
  // right, … so it stays balanced around the middle as more are added.
  const leftRows = []
  const rightRows = []
  otherRows.forEach((row, i) => {
    if (i % 2 === 0) rightRows.push(row)
    else leftRows.unshift(row)
  })
  const SOCIALS = [...leftRows, instagramRow, ...rightRows]

  // ---- Brand collaboration summary + deal list ----
  // The brand-summary card aggregates the campaign showcase cards (TOTAL REACH /
  // ENGAGEMENT % / CAMPAIGNS / ENGAGEMENT), so keep the campaign-derived default
  // rather than recomputing it from live account stats.
  // Campaign showcase cards are built from the admin's collaborations — each
  // carries the per-post metrics fetched from the creator's linked IG post.
  // Real creator with no collaborations → hide the whole Brand Collaborations
  // section (heading + summary card + showcase cards). No demo fallback here:
  // the demo only shows on a bare `/influence` (which never reaches this mapper).
  let CAMPAIGNS = []
  let BRAND_SUMMARY = []
  let BRAND_DEALS = []
  if (collabs.length) {
    CAMPAIGNS = collabs.map((x) => {
      const interactions = (x.likes || 0) + (x.comments || 0) + (x.saves || 0) + (x.shares || 0)
      const deliverables = [deliverableLabel(x.mediaType)]
      if (x.category) deliverables.push(x.category)
      return {
        brand: x.brandName || 'Brand',
        subtitle: x.campaignTitle || '',
        category: (x.category || '').toUpperCase(),
        metric: fc0(x.reach),
        date: campaignDate(x.metricsFetchedAt || x.createdAt),
        // Manual overview written in admin (not the post caption).
        overview: x.description || '',
        reach: fc0(x.reach),
        engagement: fc0(interactions),
        views: fc0(x.views),
        engRate: `${x.engagementRate || 0}%`,
        audience: campaignAudience(demo),
        thumbnail: x.postImage || x.campaignImage || x.logo || '',
        // Uploaded brand logo/photo — used as the modal header avatar.
        logo: x.logo || x.campaignImage || x.postImage || '',
        deliverables,
        link: x.link || x.instagramUrl || '',
      }
    })
    // Keep the brand-summary aggregate in sync with the live campaign cards.
    BRAND_SUMMARY = summariseCampaigns(CAMPAIGNS)
    BRAND_DEALS = collabs.map((x) => ({
      brand: x.brandName || 'Brand',
      campaign: x.campaignTitle || x.description || '',
      reach: fc0(x.reach),
      tag: (x.category || '').toUpperCase(),
    }))
  }

  // ---- Collaboration packages (page lays out up to 3 side by side) ----
  // For a REAL creator we never show the demo placeholders: the section appears
  // only when the admin has the toggle on AND has actually added packages.
  // Empty → [] → the Packages component auto-hides the whole section.
  const packagesActive = api.packagesActive !== false
  let PACKAGES = []
  if (packagesActive && packages.length) {
    const sliced = packages.slice(0, 3)
    // Honour the admin's "Most Popular" choice (isPopular from the backend).
    // Only fall back to a default (middle, or the sole card) if none is flagged.
    const hasFlagged = sliced.some((p) => p.isPopular)
    PACKAGES = sliced.map((p, i) => ({
      tier: (p.title || `Tier ${i + 1}`).toUpperCase(),
      price: p.pricing != null ? `₹${Number(p.pricing).toLocaleString('en-IN')}` : 'Custom',
      sub: p.turnaroundTime ? `${p.turnaroundTime} turnaround` : 'starting price',
      popular: hasFlagged
        ? !!p.isPopular
        : sliced.length >= 2
        ? i === 1
        : i === 0,
      // Deliverables should be a string[], but tolerate a legacy comma/newline
      // string so a single bad record can't crash the whole Packages section
      // (PackageCard maps over this). Fall back to the description if empty.
      features: (() => {
        const dl = p.deliverables
        const list = Array.isArray(dl)
          ? dl
          : typeof dl === 'string'
          ? dl.split(/[,\n]/).map((x) => x.trim()).filter(Boolean)
          : []
        return list.length ? list : [p.description].filter(Boolean)
      })(),
    }))

    // Move the "most popular" card to the centre of the row.
    const popIdx = PACKAGES.findIndex((p) => p.popular)
    if (popIdx !== -1 && PACKAGES.length >= 3) {
      const mid = Math.floor(PACKAGES.length / 2)
      const [pop] = PACKAGES.splice(popIdx, 1)
      PACKAGES.splice(mid, 0, pop)
    }
  }

  // ---- Top posts + photo pool ---- (real data only)
  let PHOTOS = []
  let TOP_POSTS = []
  const postImg = (m) =>
    m.media_type === 'VIDEO' ? m.thumbnail_url || m.media_url : m.media_url
  if (media.length) {
    const imgs = media.map(postImg).filter(Boolean)
    if (imgs.length) PHOTOS = imgs
  }
  // Prefer the backend's `topPosts` — ranked across the WHOLE profile by the
  // top-posts cron (likes + comments + views). Falls back to ranking the live
  // recent media if the backend hasn't computed them yet.
  const apiTop = api.topPosts || []
  const ranked = apiTop.length
    ? apiTop.map((p) => ({
        photo: p.photo,
        permalink: p.permalink,
        caption: p.caption,
        type: p.type || 'POST',
        likes: p.likes, comments: p.comments, saves: p.saves, shares: p.shares, views: p.views,
      }))
    : [...media]
        .sort(
          (a, b) =>
            (b.like_count || 0) + (b.comments_count || 0) + (b.views || 0) -
            ((a.like_count || 0) + (a.comments_count || 0) + (a.views || 0)),
        )
        .map((m) => ({
          photo: postImg(m),
          permalink: m.permalink,
          caption: m.caption,
          type: m.media_type === 'VIDEO' ? 'REEL' : 'POST',
          likes: m.like_count, comments: m.comments_count, saves: m.saved, shares: m.shares, views: m.views,
        }))
  if (ranked.length) {
    TOP_POSTS = ranked.slice(0, 3).map((p) => ({
      photo: p.photo,
      permalink: p.permalink || '',
      caption: p.caption ? p.caption.slice(0, 60) : 'Top post',
      type: p.type,
      // Per-post stats (this post only, not account totals).
      views: formatCount(p.views) ?? '0',
      likes: formatCount(p.likes) ?? '0',
      comments: formatCount(p.comments) ?? '0',
      saves: formatCount(p.saves) ?? '0',
      shares: formatCount(p.shares) ?? '0',
      likeCount: p.likes || 0,
    }))
  }

  const FEATURED = {
    totalViews: fc0(s.views),
    reach: fc0(s.reach),
    engage: eng,
    interact: fc0(s.interactions),
  }

  return {
    ...d,
    THEME,
    CREATOR,
    GROWTH,
    MONTHS,
    ENGAGEMENT_BARS,
    ENG_MONTHS,
    GROWTH_POINTS,
    ENG_POINTS,
    ENG_POINTS_WEEKLY,
    ENG_FROM_POSTS,
    ENG_RATE,
    AGE_GROUPS,
    TOP_LOCATIONS,
    TOP_COUNTRIES,
    GENDER_SPLIT,
    SOCIALS,
    CAMPAIGNS,
    BRAND_SUMMARY,
    BRAND_DEALS,
    PACKAGES,
    PACKAGES_ACTIVE: packagesActive,
    PHOTOS,
    TOP_POSTS,
    FEATURED,
  }
}

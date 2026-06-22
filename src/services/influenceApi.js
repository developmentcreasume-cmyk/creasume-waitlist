// Talks to the Creasume backend (../Creasume/backend) and reshapes its public
// media-kit response into the dataset the /influence page renders. The page
// works with zero backend (it falls back to the bundled Sample.Creator demo),
// so every mapper here degrades gracefully when a field is missing.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Which creator the page loads — taken ONLY from a clean `/influence/<username>`
// path. A bare `/influence` has no creator, so it renders the bundled demo;
// real data shows only at `/influence/<username>`. The SPA rewrite in
// vercel.json makes those deep links / refreshes serve index.html.
export function resolveUsername() {
  if (typeof window === 'undefined') return ''
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path.startsWith('/influence/')) {
    const seg = path.slice('/influence/'.length).split('/')[0]
    if (seg) return decodeURIComponent(seg)
  }
  return ''
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

// GET /public/:username → the raw backend payload, or null if there's no
// configured creator, the request fails, or the creator isn't found.
export async function fetchInfluenceData() {
  const username = resolveUsername()
  if (!username) return null
  const res = await fetch(`${API_BASE}/public/${encodeURIComponent(username)}`)
  const data = await res.json().catch(() => null)
  if (!data?.success || !data.creator) return null
  return data
}

// POST /inquiry/send/:username — used by the "Work With Me" form. The backend
// stores { brandName, email, brief }; we fold the optional agency/campaign-type
// fields into the brief so nothing the brand typed is lost.
export async function sendInquiry({ brand, agency, email, campaignType, brief }) {
  const username = resolveUsername()
  if (!username) throw new Error('No creator configured')
  const briefParts = [
    campaignType && `Campaign type: ${campaignType}`,
    agency && `Agency: ${agency}`,
    brief,
  ].filter(Boolean)
  const res = await fetch(`${API_BASE}/inquiry/send/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandName: brand, email, brief: briefParts.join('\n') }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) throw new Error(data.error || 'Failed to send inquiry')
  return data
}

const AGE_PALETTE = ['#8B5CF6', '#4DE0B0', '#F4C13B', '#5D65DC', '#E731A2']

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
  const collabs = api.collaborations || []
  const packages = api.packages || []
  const growth = api.growth || []

  // For a real creator, a missing metric means "no data" → show 0, not the
  // bundled demo number. formatCount(0) is "0"; formatCount(null) is null.
  const fc0 = (v) => formatCount(v) ?? '0'
  const eng = s.engagementRate != null ? `${s.engagementRate}%` : '0%'

  // ---- Hero pills (followers / engagement / views / reach) ----
  const pills = d.CREATOR.pills.map((p) => ({ ...p }))
  pills[0].value = fc0(s.followersCount)
  pills[1].value = eng
  pills[2].value = fc0(s.views)
  pills[3].value = fc0(s.reach)

  // ---- 3×3 metric grid (override by label, keep icons/colors) ----
  const topCity = demo.city?.[0]?.key
  const tileValues = {
    'Engagement Rate': eng,
    'Total Views': fc0(s.views),
    'Total Post': fc0(s.mediaCount),
    'Total Followers': fc0(s.followersCount),
    'Total Impressions': fc0(s.impressions),
    Reach: fc0(s.reach),
    'Top City': topCity || null,
    'Brand Deals Done': String(collabs.length),
  }
  const tiles = d.CREATOR.tiles.map((t) =>
    tileValues[t.label] != null ? { ...t, value: tileValues[t.label] } : t,
  )

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
    // even the proxy can't serve it. Keyed by the creator's own username so it's
    // correct no matter how the page resolved which creator to show.
    avatar: c.profilePicture && c.username
      ? `${API_BASE}/public/avatar/${encodeURIComponent(c.username)}`
      : '',
    // Raw Instagram CDN URL — used as a fallback if the proxy isn't deployed yet
    // (ProfileHero tries it with referrerPolicy=no-referrer before the initial).
    avatarRaw: c.profilePicture || '',
    pills,
    tiles,
  }

  // ---- Follower growth line (need ≥2 daily points to draw a trend) ----
  let GROWTH = d.GROWTH
  let MONTHS = d.MONTHS
  if (growth.length >= 2) {
    const pts = growth.slice(-7)
    GROWTH = pts.map((g) => Math.max(1, Math.round(g.followers / 1000)))
    MONTHS = pts.map((g) => new Date(g.date).toLocaleString('en-US', { month: 'short' }))
  }

  // ---- Audience: age distribution, top cities, gender split ----
  let AGE_GROUPS = d.AGE_GROUPS
  if (demo.age?.length) {
    const total = demo.age.reduce((a, x) => a + (x.value || 0), 0) || 1
    AGE_GROUPS = demo.age.slice(0, 5).map((x, i) => ({
      label: x.key,
      value: Math.round((x.value / total) * 100),
      color: AGE_PALETTE[i % AGE_PALETTE.length],
    }))
  }

  let TOP_LOCATIONS = d.TOP_LOCATIONS
  if (demo.city?.length) {
    TOP_LOCATIONS = demo.city.slice(0, 3).map((x) => ({ full: x.key, short: shortenLocation(x.key) }))
  }

  // Country breakdown comes back as ISO codes (IN, US, …) — turn them into
  // readable names ("India", "United States") via Intl, falling back to the code.
  let TOP_COUNTRIES = d.TOP_COUNTRIES
  if (demo.country?.length) {
    let regionNames = null
    try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }) } catch { regionNames = null }
    TOP_COUNTRIES = demo.country.slice(0, 3).map((x) => {
      let name
      try { name = regionNames?.of(x.key) || x.key } catch { name = x.key }
      return { code: String(x.key).toLowerCase(), name }
    })
  }

  let GENDER_SPLIT = d.GENDER_SPLIT
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
  const SOCIALS = d.SOCIALS.map((soc) => {
    if (soc.name === 'Instagram') {
      return {
        ...soc,
        handle: c.username ? `@${c.username}` : soc.handle,
        status: s.followersCount != null ? `${formatCount(s.followersCount)} followers` : soc.status,
      }
    }
    if (soc.name === 'YouTube' && c.socials?.youtube) {
      return { ...soc, handle: c.socials.youtube, status: 'Active' }
    }
    return soc
  })

  // ---- Brand collaboration summary + deal list ----
  // Total engagement across the fetched posts (likes + comments + saves + shares).
  const totalEngagement = media.reduce(
    (sum, m) =>
      sum + (m.like_count || 0) + (m.comments_count || 0) + (m.saved || 0) + (m.shares || 0),
    0,
  )
  const BRAND_SUMMARY = [
    { value: s.reach ? fc0(s.reach) : d.BRAND_SUMMARY[0].value, label: 'TOTAL REACH' },
    { value: eng, label: 'ENGAGEMENT %' },
    { value: collabs.length ? String(collabs.length) : d.BRAND_SUMMARY[2].value, label: 'CAMPAIGNS' },
    { value: media.length ? fc0(totalEngagement) : d.BRAND_SUMMARY[3].value, label: 'ENGAGEMENT' },
  ]
  let BRAND_DEALS = d.BRAND_DEALS
  if (collabs.length) {
    BRAND_DEALS = collabs.map((x) => ({
      brand: x.brandName || 'Brand',
      campaign: x.campaignTitle || x.description || '',
      reach: '',
      tag: (x.niche || '').toUpperCase(),
    }))
  }

  // ---- Collaboration packages (page lays out up to 3 side by side) ----
  let PACKAGES = d.PACKAGES
  if (packages.length) {
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
      features:
        p.deliverables?.length ? p.deliverables : [p.description].filter(Boolean),
    }))

    // Move the "most popular" card to the centre of the row.
    const popIdx = PACKAGES.findIndex((p) => p.popular)
    if (popIdx !== -1 && PACKAGES.length >= 3) {
      const mid = Math.floor(PACKAGES.length / 2)
      const [pop] = PACKAGES.splice(popIdx, 1)
      PACKAGES.splice(mid, 0, pop)
    }
  }

  // ---- Top posts + photo pool ----
  let PHOTOS = d.PHOTOS
  let TOP_POSTS = d.TOP_POSTS
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
    CREATOR,
    GROWTH,
    MONTHS,
    AGE_GROUPS,
    TOP_LOCATIONS,
    TOP_COUNTRIES,
    GENDER_SPLIT,
    SOCIALS,
    BRAND_SUMMARY,
    BRAND_DEALS,
    PACKAGES,
    PHOTOS,
    TOP_POSTS,
    FEATURED,
  }
}

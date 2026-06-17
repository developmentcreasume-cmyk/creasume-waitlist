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

  // ---- Hero pills (followers / engagement / views / reach) ----
  const pills = d.CREATOR.pills.map((p) => ({ ...p }))
  if (s.followersCount != null) pills[0].value = formatCount(s.followersCount)
  if (s.engagementRate != null) pills[1].value = `${s.engagementRate}%`
  if (s.views) pills[2].value = formatCount(s.views)
  if (s.reach) pills[3].value = formatCount(s.reach)

  // ---- 3×3 metric grid (override by label, keep icons/colors) ----
  const topCity = demo.city?.[0]?.key
  const tileValues = {
    'Engagement Rate': s.engagementRate != null ? `${s.engagementRate}%` : null,
    'Total Views': s.views ? formatCount(s.views) : null,
    'Total Post': s.mediaCount != null ? formatCount(s.mediaCount) : null,
    'Total Followers': s.followersCount != null ? formatCount(s.followersCount) : null,
    Reach: s.reach ? formatCount(s.reach) : null,
    'Top City': topCity || null,
    'Brand Deals Done': collabs.length ? String(collabs.length) : null,
  }
  const tiles = d.CREATOR.tiles.map((t) =>
    tileValues[t.label] != null ? { ...t, value: tileValues[t.label] } : t,
  )

  const CREATOR = {
    ...d.CREATOR,
    name: c.name || c.username || d.CREATOR.name,
    bio: c.bio || d.CREATOR.bio,
    niche: c.niche || d.CREATOR.niche,
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
  if (demo.city?.length) TOP_LOCATIONS = demo.city.slice(0, 3).map((x) => x.key)

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
  let BRAND_SUMMARY = d.BRAND_SUMMARY
  let BRAND_DEALS = d.BRAND_DEALS
  if (collabs.length) {
    const brands = new Set(collabs.map((x) => x.brandName).filter(Boolean)).size
    BRAND_SUMMARY = [
      { value: s.reach ? formatCount(s.reach) : d.BRAND_SUMMARY[0].value, label: 'TOTAL REACH' },
      { value: String(brands || collabs.length), label: 'BRANDS' },
      { value: String(collabs.length), label: 'CAMPAIGNS' },
      { value: '100%', label: 'ON TIME' },
    ]
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
    PACKAGES = packages.slice(0, 3).map((p, i) => ({
      tier: (p.title || `Tier ${i + 1}`).toUpperCase(),
      price: p.pricing != null ? `₹${Number(p.pricing).toLocaleString('en-IN')}` : 'Custom',
      sub: p.turnaroundTime ? `${p.turnaroundTime} turnaround` : 'starting price',
      popular: packages.length >= 2 ? i === 1 : i === 0,
      features:
        p.deliverables?.length ? p.deliverables : [p.description].filter(Boolean),
    }))
  }

  // ---- Recent posts + photo pool ----
  let PHOTOS = d.PHOTOS
  let TOP_POSTS = d.TOP_POSTS
  const postImg = (m) =>
    m.media_type === 'VIDEO' ? m.thumbnail_url || m.media_url : m.media_url
  if (media.length) {
    const imgs = media.map(postImg).filter(Boolean)
    if (imgs.length) PHOTOS = imgs
    TOP_POSTS = media.slice(0, 3).map((m) => ({
      photo: postImg(m),
      caption: m.caption ? m.caption.slice(0, 60) : 'Recent post',
      likes: formatCount(m.like_count) || '0',
      type: m.media_type === 'VIDEO' ? 'REEL' : 'POST',
      likeCount: m.like_count || 0,
      comments: m.comments_count || 0,
    }))
  }

  const FEATURED = {
    totalViews: s.views ? formatCount(s.views) : d.FEATURED.totalViews,
    reach: s.reach ? formatCount(s.reach) : d.FEATURED.reach,
    engage: s.engagementRate != null ? `${s.engagementRate}%` : d.FEATURED.engage,
    interact: d.FEATURED.interact,
  }

  return {
    ...d,
    CREATOR,
    GROWTH,
    MONTHS,
    AGE_GROUPS,
    TOP_LOCATIONS,
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

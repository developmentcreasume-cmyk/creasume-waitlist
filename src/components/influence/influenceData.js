// Single source of truth for the public Influence Card (media-kit) page.
// One creator's data drives every section so the numbers stay consistent
// across the hero tiles, analytics, brand reach, etc. Edit here to re-skin
// the whole page.

export const FONT = "'Outfit', sans-serif"
export const MONO = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace"

// Shared dark panel surface, matching the metric tiles on the live demo card.
export const PANEL = {
  backgroundColor: 'rgba(40,46,112,0.30)',
  border: '1px solid rgba(255,255,255,0.08)',
}

// Purple→magenta→pink gradient used on the small caption labels page-wide
// (metric tiles, package tiers, post-type tags). Applied as clipped text.
export const LABEL_GRADIENT = {
  background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

export const CREATOR = {
  name: 'Sample.Creator',
  username: 'sample.creator',
  tagline: "Here's what's happening with your creator business today.",
  bio: 'Mindful living for the modern gen. Brand deals open 🤍',
  niche: 'Lifestyle',
  // Admin-managed badges. Off in the demo — they only show for real creators
  // whose flags an admin has set (so testing reflects the actual data).
  isFoundingCreator: false,
  verified: false,
  // Headline pills shown next to the name.
  pills: [
    { value: '125K', label: 'Followers', color: '#89DFEC', labelColor: '#ffffff' },
    { value: '3.46%', label: 'Eng. Rate', color: '#89DFEC', labelColor: '#ffffff' },
    { value: '43,000', label: 'Total Views', color: '#89DFEC', labelColor: '#ffffff' },
    { value: '17,000', label: 'Total Reach', color: '#89DFEC', labelColor: '#ffffff' },
  ],
  // 3×3 metric grid (icons resolved in ProfileHero).
  tiles: [
    { value: '3.46%', label: 'Engagement Rate', icon: 'chart' },
    { value: '43,000', label: 'Total Views', icon: 'eye' },
    { value: '184', label: 'Total Post', icon: 'camera' },
    { value: '125K', label: 'Total Followers', icon: 'followers' },
    { value: '87', label: 'Creasume Score', icon: 'score' },
    { value: '2.4M', label: 'Total Impressions', icon: 'heart' },
    { value: '17,000', label: 'Reach', icon: 'rocket' },
    { value: 'Mumbai', label: 'Top City', icon: 'pin' },
    { value: '12', label: 'Brand Deals Done', icon: 'handshake' },
  ],
}

// Follower-growth line: 7 monthly points trending up (in thousands).
export const GROWTH = [62, 74, 88, 101, 112, 119, 125]
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

// Engagement-rate bars (last one is the "today" highlight).
export const ENGAGEMENT_BARS = [42, 55, 48, 61, 53, 70]

// Audience age distribution.
export const AGE_GROUPS = [
  { label: '13-17', value: 12, color: '#8B5CF6' },
  { label: '18-24', value: 48, color: '#4DE0B0' },
  { label: '25-34', value: 31, color: '#F4C13B' },
  { label: '35+', value: 9, color: '#5D65DC' },
]

// `full` shows on desktop, `short` (abbreviated state) on mobile.
export const TOP_LOCATIONS = [
  { full: 'Mumbai, Maharashtra', short: 'Mumbai, MH' },
  { full: 'Delhi, Delhi', short: 'Delhi, DL' },
  { full: 'Bengaluru, Karnataka', short: 'Bengaluru, KA' },
]
// Each country carries an ISO code so the Top Countries chips can show a flag
// (https://flagcdn.com/w40/<code>.png). Cities stay plain text.
export const TOP_COUNTRIES = [
  { code: 'in', name: 'India' },
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
]
export const GENDER_SPLIT = { female: 58, male: 42 }

// Brand presence header.
export const SOCIALS = [
  { name: 'YouTube', handle: '@sample.creator', status: 'Coming Soon', color: '#FF0000' },
  { name: 'Instagram', handle: '@sample.creator', status: '144k followers', color: '#E1306C' },
  { name: 'X (Twitter)', handle: '@sample.creator', status: 'Coming Soon', color: '#FFFFFF' },
]

export const BRAND_SUMMARY = [
  { value: '8.1M', label: 'TOTAL REACH' },
  { value: '3.46%', label: 'ENGAGEMENT %' },
  { value: '12+', label: 'CAMPAIGNS' },
  { value: '2.4M', label: 'ENGAGEMENT' },
]

// Brand collaborations timeline (BrandReach section).
export const BRAND_DEALS = [
  { brand: 'Nike', campaign: 'Running shoe launch campaign', reach: '2.4M', tag: 'FITNESS' },
  { brand: 'Adidas', campaign: 'Trail collection lookbook', reach: '2.1M', tag: 'FASHION' },
  { brand: 'Sephora', campaign: 'Holiday makeup tutorial', reach: '1.8M', tag: 'BEAUTY' },
  { brand: 'Airbnb', campaign: 'Hidden gems travel guide', reach: '1.4M', tag: 'TRAVEL' },
]

export const PACKAGES = [
  {
    tier: 'STARTER',
    price: '₹25,000',
    sub: 'starting price',
    features: ['1× Instagram Reel (60s)', '3× Stories + link', '2 revision rounds', 'Usage rights: 90 days', 'Strategy call included'],
  },
  {
    tier: 'CORE',
    price: '₹75,000',
    sub: 'starting price',
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

// Photos that ship in /public — reused for top-post and creator cards.
export const PHOTOS = ['1 (2).jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'].map(
  (f) => `/${encodeURIComponent(f)}`,
)

// Featured "Top Posts" carousel (TopPosts section). Each entry carries its OWN
// per-post stats (views/likes/comments/saves/shares), shown beside that post.
export const TOP_POSTS = [
  { photo: PHOTOS[0], caption: 'A day in my creative routine', type: 'REEL', views: '1.2M', likes: '128K', comments: '1.9K', saves: '24K', shares: '8.1K', likeCount: 128000 },
  { photo: PHOTOS[1], caption: 'Festive looks for the season', type: 'POST', views: '540K', likes: '96K', comments: '1.2K', saves: '15K', shares: '4.3K', likeCount: 96000 },
  { photo: PHOTOS[5], caption: 'Mindful morning rituals ☀️', type: 'REEL', views: '430K', likes: '84K', comments: '980', saves: '11K', shares: '3.2K', likeCount: 84000 },
]

// Account-wide numbers (kept for back-compat; the TopPosts card now uses
// per-post stats from TOP_POSTS instead of these).
export const FEATURED = { totalViews: '1.2M', reach: '540K', engage: '4.2%', interact: '32K' }

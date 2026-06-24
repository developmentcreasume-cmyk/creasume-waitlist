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
  // 3×3 metric grid (icons resolved in ProfileHero). `source` drives the
  // flip-card back face: where each metric comes from. type ∈
  // 'instagram' | 'calculated' | 'creasume'.
  tiles: [
    { value: '3.46%', label: 'Engagement Rate', icon: 'chart', source: { type: 'calculated', text: 'Total interactions ÷ total accounts reached × 100 (last 30 days).' } },
    { value: '43,000', label: 'Total Views', icon: 'eye', source: { type: 'instagram', text: 'Pulled live from Instagram Insights — views (last 30 days).' } },
    { value: '184', label: 'Total Post', icon: 'camera', source: { type: 'instagram', text: 'Your total media count, straight from Instagram.' } },
    { value: '125K', label: 'Total Followers', icon: 'followers', source: { type: 'instagram', text: 'Live follower count from Instagram.' } },
    {
      value: '87', label: 'Creasume Score', icon: 'score',
      source: {
        type: 'creasume',
        text: 'Your credibility score out of 100, built from your influence card activity, brand inquiries, and deals you actually close.',
        more: {
          title: 'How to build your Creasume Score',
          intro: 'Your Creasume Score grows every time you put your Influence Card to work. Build it by:',
          bullets: [
            'Completing your profile and verifying your identity',
            'Adding your past campaigns and keeping your card fresh',
            'Sharing your card link in your bio, pitches, and DMs',
            'Attracting brand inquiries through your card',
            'Accepting and closing deals through Creasume (biggest boost)',
          ],
          outro: 'The more you share and close deals, the higher your score climbs. A higher score means brands trust you more. It also pushes your card higher when brands search for creators. So keep sharing, keep closing, and keep climbing.',
        },
      },
    },
    {
      value: '934.8K', label: 'Total Impressions', icon: 'heart',
      // Likes / comments / shares shown as a mini-row inside this tile.
      details: [
        { icon: 'heart', value: '892K' },
        { icon: 'comment', value: '24.6K' },
        { icon: 'share', value: '18.2K' },
      ],
      source: { type: 'instagram', text: 'Pulled live from Instagram Insights — total impressions across your posts (last 30 days).' },
    },
    { value: '17,000', label: 'Reach', icon: 'rocket', source: { type: 'instagram', text: 'Accounts reached (last 30 days), from Instagram Insights.' } },
    { value: 'Mumbai', label: 'Top City', icon: 'pin', source: { type: 'instagram', text: 'Your top audience city, from Instagram audience demographics.' } },
    { value: '12', label: 'Brand Deals Done', icon: 'handshake', source: { type: 'creasume', text: 'Collaborations recorded on your Creasume profile.' } },
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

// Campaign case-study cards shown in the CampaignShowcase carousel. The brand
// summary card (ProfessionalPresence) aggregates its numbers from this list, so
// the two always stay in sync.
export const CAMPAIGNS = [
  {
    brand: 'Spotify', subtitle: 'Wrapped promotion campaign', metric: '3.1M', category: 'TECH',
    date: 'Dec 2023',
    overview: 'Partnered with Spotify to launch their year-end Wrapped campaign. Created a personality-driven Reel unpacking listening stats, followed by a carousel breaking down the data story.',
    reach: '3.1M', engagement: '410K', engRate: '13.2%',
    audience: '58% Female, 18–29 years old. Top cities: London, Berlin, Toronto.',
    deliverables: ['Reel', 'Carousel', '4 Stories'],
  },
  {
    brand: 'Nike', subtitle: 'Run club launch series', metric: '2.4M', category: 'SPORT',
    date: 'Oct 2023',
    overview: "Partnered with Nike to launch their new React Infinity Run shoes. Created a high-energy Reel showcasing the shoe's durability through a 10K run, followed by a 3-part Story series breaking down the technology.",
    reach: '2.4M', engagement: '350K', engRate: '14.5%',
    audience: '65% Female, 18–34 years old. Top cities: New York, London, Los Angeles.',
    deliverables: ['Reel', '3 Stories'],
  },
  {
    brand: 'Glossier', subtitle: 'Skin-first product drop', metric: '1.8M', category: 'BEAUTY',
    date: 'Aug 2023',
    overview: 'Collaborated with Glossier on a skin-first product drop. Produced an honest get-ready-with-me Reel and a tutorial carousel highlighting the dewy, low-effort routine.',
    reach: '1.8M', engagement: '290K', engRate: '16.1%',
    audience: '72% Female, 18–27 years old. Top cities: New York, Los Angeles, Miami.',
    deliverables: ['Reel', 'Tutorial', '3 Stories'],
  },
  {
    brand: 'Airbnb', subtitle: 'City weekender feature', metric: '2.0M', category: 'TRAVEL',
    date: 'Jun 2023',
    overview: 'Teamed up with Airbnb for a city-weekender feature. Filmed a cinematic travel Reel across three stays and a Story series with bookable links to each property.',
    reach: '2.0M', engagement: '260K', engRate: '13.0%',
    audience: '54% Female, 25–40 years old. Top cities: Paris, Lisbon, Barcelona.',
    deliverables: ['Reel', '5 Stories'],
  },
  {
    brand: 'Notion', subtitle: 'Creator workflow showcase', metric: '1.2M', category: 'TECH',
    date: 'Apr 2023',
    overview: 'Worked with Notion to showcase a creator workflow. Built a screen-recorded Reel walking through a content-planning template, paired with a post breaking down the setup.',
    reach: '1.2M', engagement: '180K', engRate: '15.0%',
    audience: '49% Female, 22–35 years old. Top cities: San Francisco, London, Bangalore.',
    deliverables: ['Reel', 'Post', '2 Stories'],
  },
  {
    brand: 'Chipotle', subtitle: 'Limited menu teaser', metric: '3.6M', category: 'FOOD',
    date: 'Feb 2023',
    overview: 'Partnered with Chipotle to tease a limited menu item. Created a fast-cut taste-test Reel and a post with a promo code that drove in-app orders during launch week.',
    reach: '3.6M', engagement: '520K', engRate: '14.4%',
    audience: '51% Male, 18–30 years old. Top cities: Austin, Chicago, Denver.',
    deliverables: ['Reel', 'Post', '3 Stories'],
  },
]

// "3.1M" → 3_100_000, "410K" → 410_000, "13.2%" → 13.2. Used to aggregate the
// campaign cards into the brand summary.
const parseMetric = (s) => {
  const str = String(s).trim()
  const num = parseFloat(str.replace('%', ''))
  if (Number.isNaN(num)) return 0
  if (/m$/i.test(str)) return num * 1_000_000
  if (/k$/i.test(str)) return num * 1_000
  return num
}
const formatMetric = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(Math.round(n))
}

// Aggregate of the campaign cards: total reach, average eng. rate, campaign
// count, and total engagement.
export function summariseCampaigns(campaigns) {
  const list = campaigns || []
  const totalReach = list.reduce((a, c) => a + parseMetric(c.reach), 0)
  const totalEngagement = list.reduce((a, c) => a + parseMetric(c.engagement), 0)
  const avgRate = list.length
    ? list.reduce((a, c) => a + parseMetric(c.engRate), 0) / list.length
    : 0
  return [
    { value: formatMetric(totalReach), label: 'TOTAL REACH' },
    { value: `${avgRate.toFixed(1)}%`, label: 'ENGAGEMENT %' },
    { value: String(list.length), label: 'CAMPAIGNS' },
    { value: formatMetric(totalEngagement), label: 'ENGAGEMENT' },
  ]
}

export const BRAND_SUMMARY = summariseCampaigns(CAMPAIGNS)

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

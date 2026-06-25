// Shared sample data for the brand-inquiry list (/dashboard/inquiries) and the
// inquiry detail page (/dashboard/inquiries/:id). Replace with live data once
// the backend is wired.

export const INQUIRIES = [
  {
    id: 'inq-sample-v2-1',
    status: 'PENDING',
    date: '25/06/2026',
    detail: 'Summer Glow Collection • Reel + Story',
    brand: {
      name: 'Lumina Cosmetics',
      email: 'partnerships@lumina.example.com',
      type: 'Beauty / Skincare',
      website: 'https://lumina.example.com',
      social: '@luminacosmetics',
      description: 'Clean, radiant beauty products made for everyday glow.',
    },
    campaign: {
      name: 'Summer Glow Collection',
      type: 'Reel + Story',
      message:
        "Hi! We're launching our Summer Glow Collection and would love to feature you. We can offer product gifting plus a paid partnership.",
    },
  },
  {
    id: 'inq-sample-v2-2',
    status: 'PENDING',
    date: '24/06/2026',
    detail: 'Activewear Launch • Dedicated Post',
    brand: {
      name: 'FitLife Apparel',
      email: 'collabs@fitlife.example.com',
      type: 'Fashion / Fitness',
      website: 'https://fitlife.example.com',
      social: '@fitlifeapparel',
      description: 'Sustainable, high-performance activewear designed for movement.',
    },
    campaign: {
      name: 'Activewear Launch',
      type: 'Dedicated Post',
      message:
        'Hey! We are launching a new line of sustainable activewear and think you would be a perfect fit. We can offer a $500 flat rate + free gear.',
    },
  },
  {
    id: 'inq-sample-v2-3',
    status: 'ACCEPTED',
    date: '23/06/2026',
    detail: 'Smart Home Review • YouTube Video',
    brand: {
      name: 'Tech Haven',
      email: 'creators@techhaven.example.com',
      type: 'Technology / Smart Home',
      website: 'https://techhaven.example.com',
      social: '@techhaven',
      description: 'Smart home devices that make everyday living effortless.',
    },
    campaign: {
      name: 'Smart Home Review',
      type: 'YouTube Video',
      message:
        "We'd love for you to review our new smart home lineup. We'll send the full kit plus a $1,200 fee.",
    },
  },
]

export function getInquiry(id) {
  return INQUIRIES.find((q) => q.id === id) || null
}

// The creator's own contact, shared with a brand when an inquiry is accepted.
export const CREATOR_CONTACT = {
  instagram: '@sample.creator',
  email: 'sample.creator@example.com',
}

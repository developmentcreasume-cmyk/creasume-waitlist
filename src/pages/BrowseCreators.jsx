import { useEffect, useMemo, useState } from 'react'
import SiteNav from '../components/SiteNav.jsx'
import Footer from '../components/Footer.jsx'
import { goToPath } from '../router.js'
import { fetchCreators, formatCount } from '../services/influenceApi.js'

// "Discover Top Creators" — public directory of live creator cards. Fetches the
// published creators from GET /public/creators and renders a searchable grid.

const FONT = "'Outfit', sans-serif"
const MONO = "'DM Mono', monospace"

const BUDGETS = [
  { id: 'all', label: 'All Budgets', test: () => true },
  { id: 'lt2k', label: 'Under ₹2,000', test: (p) => p != null && p < 2000 },
  { id: '2to5', label: '₹2,000 – ₹5,000', test: (p) => p != null && p >= 2000 && p <= 5000 },
  { id: 'gt5k', label: 'Over ₹5,000', test: (p) => p != null && p > 5000 },
]

// ---- Small inline icons ----
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.5" /></svg>
)
const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 3.5a3 3 0 0 1 0 5.8" /></svg>
)
const ExtIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>
)
const VerifiedTick = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-label="Verified"><circle cx="12" cy="12" r="10" fill="#8B5CF6" /><path d="M7.8 12.4l2.6 2.6 5.4-5.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function CreatorCard({ c }) {
  const cardUrl = c.publicId
    ? `/${encodeURIComponent(c.username)}/${encodeURIComponent(c.publicId)}`
    : `/${encodeURIComponent(c.username)}`
  return (
    <div className="rounded-2xl overflow-hidden border transition-transform hover:-translate-y-1" style={{ background: '#0e0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
      {/* Banner + avatar */}
      <div className="relative h-24" style={{ background: 'linear-gradient(135deg,#3a2a63 0%, #241d3f 55%, #14121e 100%)' }}>
        <div className="absolute -bottom-9 left-6">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden border-4" style={{ borderColor: '#0e0e14', background: '#1a1a22' }}>
            {c.avatar
              ? <img src={c.avatar} alt={c.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              : <div className="w-full h-full grid place-items-center text-white/60 text-2xl font-bold" style={{ fontFamily: FONT }}>{(c.name || c.username || '?').charAt(0).toUpperCase()}</div>}
          </div>
        </div>
      </div>

      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-1.5">
          <h3 className="text-white font-bold text-[19px] leading-tight" style={{ fontFamily: FONT }}>{c.name}</h3>
          {c.verified && <VerifiedTick />}
        </div>
        <p className="text-white/45 text-[14px] mt-0.5" style={{ fontFamily: MONO }}>@{c.username}</p>

        {c.location && (
          <p className="mt-3 flex items-center gap-1.5 text-white/55 text-[13px]" style={{ fontFamily: FONT }}>
            <PinIcon /> {c.location}
          </p>
        )}
        {c.niche && (
          <span className="inline-block mt-3 rounded-md px-3 py-1 text-[12px] font-semibold" style={{ fontFamily: FONT, color: '#4ADE80', background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)' }}>
            {c.niche}
          </span>
        )}

        <div className="mt-5 flex items-center gap-10">
          <div>
            <p className="text-white/45 text-[12px] flex items-center gap-1.5" style={{ fontFamily: FONT }}><UsersIcon /> Followers</p>
            <p className="text-white font-bold text-[18px] mt-1" style={{ fontFamily: FONT }}>{formatCount(c.followers) ?? '0'}</p>
          </div>
          {c.startingPrice != null && (
            <div>
              <p className="text-white/45 text-[12px] flex items-center gap-1" style={{ fontFamily: FONT }}>₹ Starting at</p>
              <p className="text-white font-bold text-[18px] mt-1" style={{ fontFamily: FONT }}>₹{Number(c.startingPrice).toLocaleString()}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => goToPath(cardUrl)}
          className="mt-5 w-full rounded-xl py-3 text-[14px] font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors hover:bg-white/10"
          style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          View Card <ExtIcon />
        </button>
      </div>
    </div>
  )
}

export default function BrowseCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [budget, setBudget] = useState('all')

  useEffect(() => {
    window.scrollTo(0, 0)
    let alive = true
    fetchCreators()
      .then((list) => { if (alive) setCreators(list) })
      .catch((e) => { if (alive) setError(e.message || 'Failed to load creators') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(creators.map((c) => c.niche).filter(Boolean)))],
    [creators],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const budgetTest = (BUDGETS.find((b) => b.id === budget) || BUDGETS[0]).test
    return creators.filter((c) => {
      if (cat !== 'All' && c.niche !== cat) return false
      if (!budgetTest(c.startingPrice)) return false
      if (!q) return true
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.username || '').toLowerCase().includes(q) ||
        (c.niche || '').toLowerCase().includes(q)
      )
    })
  }, [creators, query, cat, budget])

  const selectStyle = { fontFamily: FONT, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.10)', color: '#fff' }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip bg-black text-white">
      <div className="starfield" />
      <SiteNav active="browse" />

      {/* ============ HERO ============ */}
      <section className="relative z-10 px-6 sm:px-12 md:px-20 pt-6 md:pt-10 pb-6 text-center">
        <h1 className="font-bold leading-tight" style={{ fontFamily: FONT, fontSize: 'clamp(36px, 6vw, 60px)' }}>Discover Top Creators</h1>
        <p className="mt-4 text-white/55 mx-auto max-w-2xl text-[15px] md:text-[18px] leading-relaxed" style={{ fontFamily: FONT }}>
          Browse verified influence cards, compare transparent pricing, and connect directly with creators for your next campaign.
        </p>
      </section>

      {/* ============ SEARCH + FILTERS ============ */}
      <section className="relative z-10 px-6 sm:px-10 md:px-20 lg:px-28 mb-10">
        <div className="mx-auto max-w-6xl rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, handle, or tags…"
              className="w-full rounded-xl h-12 pl-11 pr-4 text-[15px] text-white outline-none placeholder:text-white/35"
              style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl h-12 px-4 text-[15px] outline-none cursor-pointer sm:w-52" style={selectStyle}>
            {categories.map((c) => <option key={c} value={c} style={{ color: '#000' }}>{c}</option>)}
          </select>
          <select value={budget} onChange={(e) => setBudget(e.target.value)} className="rounded-xl h-12 px-4 text-[15px] outline-none cursor-pointer sm:w-52" style={selectStyle}>
            {BUDGETS.map((b) => <option key={b.id} value={b.id} style={{ color: '#000' }}>{b.label}</option>)}
          </select>
        </div>
      </section>

      {/* ============ GRID ============ */}
      <section className="relative z-10 px-6 sm:px-10 md:px-20 lg:px-28 pb-20 flex-1">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border animate-pulse" style={{ background: '#0e0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="relative h-24" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="absolute -bottom-9 left-6 w-[76px] h-[76px] rounded-full border-4" style={{ borderColor: '#0e0e14', background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                  <div className="px-6 pt-12 pb-6">
                    <div className="h-5 w-32 rounded bg-white/10" />
                    <div className="mt-2 h-3 w-24 rounded bg-white/[0.06]" />
                    <div className="mt-5 h-3 w-40 rounded bg-white/[0.06]" />
                    <div className="mt-5 h-10 w-full rounded-xl bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-[#FB7185] text-center py-16" style={{ fontFamily: FONT }}>{error}</p>
          ) : (
            <>
              <p className="text-white/70 font-semibold mb-6" style={{ fontFamily: FONT }}>
                Showing {filtered.length} creator{filtered.length === 1 ? '' : 's'}
              </p>
              {filtered.length === 0 ? (
                <p className="text-white/45 text-center py-16" style={{ fontFamily: FONT }}>No creators match your search.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((c) => <CreatorCard key={c.username || c.publicId} c={c} />)}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

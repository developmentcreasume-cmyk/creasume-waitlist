// All Brand Inquiries — full list page reached from the dashboard's "View All"
// (route: /<username>/dashboard/inquiries). Live data from GET
// /inquiry/my-inquiries (the logged-in creator's inquiries).
import { useState, useEffect } from 'react'
import { FONT, MONO } from '../influence/influenceData.js'
import { goToPath } from '../../router.js'
import UpgradeModal, { showUpgrade } from './UpgradeModal.jsx'
import {
  fetchMyInquiries,
  mapInquiry,
  isLoggedIn,
  loginUrl,
  clearAuth,
  dashboardUsername,
  dashboardBase,
  inquiryDetailPath,
} from '../../services/dashboardApi.js'

const ic = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  inbox: (<svg {...ic} width="22" height="22"><path d="M4 13h4l1.5 2.5h5L16 13h4" /><path d="M5 5h14l2 8v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z" /></svg>),
  back: (<svg {...ic} width="18" height="18"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>),
  external: (<svg {...ic} width="15" height="15"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>),
}

function StatusBadge({ status }) {
  const accepted = status === 'ACCEPTED'
  const declined = status === 'DECLINED'
  const color = accepted ? '#4DE0B0' : declined ? '#F4607A' : '#F4C13B'
  const bg = accepted ? 'rgba(77,224,176,0.12)' : declined ? 'rgba(244,96,122,0.12)' : 'rgba(244,193,59,0.12)'
  const border = accepted ? 'rgba(77,224,176,0.35)' : declined ? 'rgba(244,96,122,0.35)' : 'rgba(244,193,59,0.35)'
  return (
    <span
      className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-full"
      style={{ fontFamily: MONO, color, background: bg, border: `1px solid ${border}` }}
    >
      {status}
    </span>
  )
}

export default function InfluenceInquiries({ username }) {
  const handle = username || dashboardUsername()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Brands can always SEND an inquiry — reading them is the paid feature. When
  // the plan doesn't include it the backend returns { locked, count } instead of
  // the content, so we can tell the creator exactly how many are waiting.
  const [locked, setLocked] = useState(false)
  const [lockedCount, setLockedCount] = useState(0)

  useEffect(() => {
    let alive = true
    if (!isLoggedIn()) { setLoading(false); return }
    fetchMyInquiries()
      .then((res) => {
        if (!alive) return
        if (res.locked) {
          setLocked(true)
          setLockedCount(res.count || 0)
          return
        }
        setInquiries((res.inquiries || []).map(mapInquiry))
      })
      .catch((e) => {
        if (e.status === 401) { clearAuth(); window.location.reload(); return }
        if (alive) setError(e.message || 'Failed to load inquiries')
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div className="relative min-h-screen text-white" style={{ background: '#05060f' }}>
      {/* Plan-gate prompt (this page is its own route, so it mounts its own). */}
      <UpgradeModal />

      {/* ===== Top bar ===== */}
      <header
        className="flex items-center justify-between px-6 md:px-10 h-18"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          type="button"
          onClick={() => goToPath(dashboardBase(handle))}
          className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
        >
          <img src="/creasumelogo.png" alt="Creasume" className="h-8 w-auto" style={{ objectFit: 'contain' }} />
        </button>
        <button
          type="button"
          onClick={() => goToPath(dashboardBase(handle))}
          className="flex items-center gap-2 text-[15px] font-medium text-white/70 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
          style={{ fontFamily: FONT }}
        >
          {ICONS.back} Back to Dashboard
        </button>
      </header>

      {/* ===== Content ===== */}
      <main className="max-w-300 mx-auto px-6 md:px-10 py-10 md:py-14">
        {/* Page heading */}
        <div className="flex items-start gap-4 mb-10">
          <span
            className="shrink-0 grid place-items-center rounded-xl"
            style={{ width: '52px', height: '52px', color: '#9C7CF0', background: 'rgba(124,92,240,0.12)', border: '1px solid rgba(124,92,240,0.3)' }}
          >
            {ICONS.inbox}
          </span>
          <div>
            <h1 className="font-bold leading-tight text-[28px] md:text-[34px]" style={{ fontFamily: FONT }}>
              All Brand Inquiries
            </h1>
            <p className="text-white/55 text-base md:text-lg mt-1" style={{ fontFamily: FONT }}>
              Manage your collaboration requests from brands.
            </p>
          </div>
        </div>

        {!isLoggedIn() ? (
          <div className="rounded-2xl px-6 py-12 text-center" style={{ background: 'rgba(13,16,45,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/70 text-[16px] mb-5" style={{ fontFamily: FONT }}>Sign in to view your brand inquiries.</p>
            <a href={loginUrl()} className="inline-flex rounded-xl px-6 py-3 text-[15px] font-semibold text-white no-underline" style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)' }}>Connect Instagram</a>
          </div>
        ) : loading ? (
          <div className="text-white/50 text-[15px]" style={{ fontFamily: FONT }}>Loading inquiries…</div>
        ) : error ? (
          <div className="rounded-xl px-5 py-4 text-[14px]" style={{ fontFamily: FONT, color: '#FB7185', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>
        ) : locked ? (
          /* Paid feature. The inquiries EXIST — brands can always send them — the
             creator just can't read them on this plan. Show the real count so the
             upgrade is concrete ("3 brands are waiting") rather than abstract. */
          <div className="rounded-2xl px-6 py-14 text-center" style={{ background: 'rgba(13,16,45,0.55)', border: '1px solid rgba(139,92,246,0.30)' }}>
            <div
              className="mx-auto mb-5 grid place-items-center rounded-2xl"
              style={{ width: 56, height: 56, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round">
                <rect x="4" y="10.5" width="16" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
              </svg>
            </div>

            {lockedCount > 0 ? (
              <>
                <h2 className="text-white font-bold text-[26px] md:text-[30px] mb-2" style={{ fontFamily: FONT }}>
                  {lockedCount} brand {lockedCount === 1 ? 'inquiry is' : 'inquiries are'} waiting for you
                </h2>
                <p className="text-white/60 text-[15px] max-w-md mx-auto mb-7" style={{ fontFamily: FONT }}>
                  {lockedCount === 1 ? 'A brand has' : 'Brands have'} reached out through your Influence Card.
                  Upgrade to read {lockedCount === 1 ? 'it' : 'them'} and reply.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-white font-bold text-[24px] md:text-[28px] mb-2" style={{ fontFamily: FONT }}>
                  Brand inquiries are a paid feature
                </h2>
                <p className="text-white/60 text-[15px] max-w-md mx-auto mb-7" style={{ fontFamily: FONT }}>
                  Your card is already collecting inquiries — brands can reach out any time.
                  Upgrade to read and reply to them here.
                </p>
              </>
            )}

            <button
              type="button"
              onClick={() => showUpgrade('brandInquiryButton')}
              className="inline-flex rounded-xl px-6 py-3 text-[15px] font-semibold transition-transform hover:scale-[1.02]"
              style={{ fontFamily: FONT, color: '#0B0B27', background: 'linear-gradient(180deg, #C9C4F0 0%, #A79FE6 100%)' }}
            >
              Upgrade to unlock
            </button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="rounded-2xl px-6 py-12 text-center text-white/45 text-[15px]" style={{ fontFamily: FONT, background: 'rgba(13,16,45,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
            No brand inquiries yet. Share your Influence Card to start receiving them.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {inquiries.map((q) => (
              <div
                key={q.id}
                className="group rounded-2xl px-6 md:px-8 py-6 transition-colors"
                style={{ background: 'rgba(13,16,45,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <StatusBadge status={q.status} />
                      <span className="text-white/45 text-sm font-medium" style={{ fontFamily: MONO }}>{q.date}</span>
                    </div>
                    <h3
                      className="text-xl md:text-2xl font-bold mb-1 truncate"
                      style={{ fontFamily: FONT, color: q.status === 'PENDING' ? '#B89DF5' : '#fff' }}
                    >
                      {q.brand.name}
                    </h3>
                    <p className="text-white/55 text-[15px] md:text-base truncate" style={{ fontFamily: FONT }}>
                      {q.detail}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToPath(inquiryDetailPath(handle, q.id))}
                    className="shrink-0 flex items-center gap-2 text-[15px] font-semibold text-white/65 hover:text-white transition-colors bg-transparent border-0 cursor-pointer mt-1"
                    style={{ fontFamily: FONT }}
                  >
                    View Details {ICONS.external}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Brand Inquiry detail page (route: /<username>/dashboard/inquiries/:id). Shows
// the brand + campaign details and lets the creator accept (opens the "Accept
// Collaboration" modal → marks the inquiry actioned) or decline. Live data from
// GET /inquiry/my-inquiries; status writes via PUT /inquiry/update-status/:id.
import { useState, useEffect } from 'react'
import { FONT, MONO } from '../influence/influenceData.js'
import { goToPath } from '../../router.js'
import {
  fetchMyInquiries,
  fetchMe,
  setInquiryStatus,
  updateProfile,
  mapInquiry,
  isLoggedIn,
  loginUrl,
  clearAuth,
  dashboardUsername,
  dashboardBase,
  inquiriesPath,
} from '../../services/dashboardApi.js'

const ic = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  back: (<svg {...ic} width="18" height="18"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>),
  building: (<svg {...ic} width="20" height="20"><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" /><path d="M15 9h4a1 1 0 0 1 1 1v11M3 21h18" /><path d="M8 7h1M8 11h1M8 15h1M11 7h1M11 11h1M11 15h1" /></svg>),
  tag: (<svg {...ic} width="20" height="20"><path d="M20 12.5 12.5 20a1.5 1.5 0 0 1-2.1 0L3 12.6V3h9.6L20 10.4a1.5 1.5 0 0 1 0 2.1Z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>),
  mail: (<svg {...ic} width="16" height="16"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>),
  message: (<svg {...ic} width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>),
  check: (<svg {...ic} width="18" height="18" strokeWidth="2.2"><path d="M20 6 9 17l-5-5" /></svg>),
  close: (<svg {...ic} width="18" height="18" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>),
}

function StatusPill({ status }) {
  const accepted = status === 'ACCEPTED'
  const label = accepted ? 'Accepted' : status === 'DECLINED' ? 'Declined' : 'Pending'
  const color = accepted ? '#4DE0B0' : status === 'DECLINED' ? '#F4607A' : '#F4C13B'
  const bg = accepted ? 'rgba(77,224,176,0.12)' : status === 'DECLINED' ? 'rgba(244,96,122,0.12)' : 'rgba(244,193,59,0.12)'
  const border = accepted ? 'rgba(77,224,176,0.35)' : status === 'DECLINED' ? 'rgba(244,96,122,0.35)' : 'rgba(244,193,59,0.45)'
  return (
    <span
      className="text-[15px] font-bold px-5 py-2 rounded-full"
      style={{ fontFamily: FONT, color, background: bg, border: `1px solid ${border}` }}
    >
      {label}
    </span>
  )
}

// A label + value pair used throughout the brand/campaign cards.
function Field({ label, children }) {
  return (
    <div>
      <p className="text-white/45 text-[15px] mb-1.5" style={{ fontFamily: FONT }}>{label}</p>
      <div className="text-white text-lg font-semibold" style={{ fontFamily: FONT }}>{children}</div>
    </div>
  )
}

function SectionHeader({ icon, label, color }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span style={{ color }}>{icon}</span>
      <h2 className="text-xl font-bold" style={{ fontFamily: FONT, color }}>{label}</h2>
    </div>
  )
}

// ===== Accept Collaboration modal =====
function AcceptModal({ onClose, onSend, contact, setContact, sending }) {
  const [message, setMessage] = useState(
    "Hi, I'd love to collaborate. You can reach me on Instagram.\nLooking forward to discussing details.",
  )
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-2xl p-7"
        style={{ background: '#15171f', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-bold" style={{ fontFamily: FONT }}>Accept Collaboration</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/55 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-1"
          >
            {ICONS.close}
          </button>
        </div>

        <label className="block text-white/55 text-[15px] mb-3" style={{ fontFamily: FONT }}>
          Add a message for the brand (optional):
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-[15px] text-white/90 outline-none resize-y focus:border-white/25 transition-colors"
          style={{ fontFamily: FONT, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
        />

        <div
          className="rounded-xl px-5 py-4 mt-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-white font-bold text-[15px] mb-3" style={{ fontFamily: FONT }}>Preferred Contact:</p>
          <label className="block text-white/55 text-[13px] mb-1.5" style={{ fontFamily: FONT }}>Instagram</label>
          <input
            value={contact.instagram}
            onChange={(e) => setContact((c) => ({ ...c, instagram: e.target.value }))}
            placeholder="@yourhandle"
            className="w-full rounded-lg px-3.5 h-11 text-[15px] text-white/90 outline-none focus:border-white/25 transition-colors mb-3"
            style={{ fontFamily: FONT, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <label className="block text-white/55 text-[13px] mb-1.5" style={{ fontFamily: FONT }}>Email</label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
            placeholder="you@email.com"
            className="w-full rounded-lg px-3.5 h-11 text-[15px] text-white/90 outline-none focus:border-white/25 transition-colors"
            style={{ fontFamily: FONT, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <p className="text-white/45 text-[13px] mt-3 leading-snug" style={{ fontFamily: FONT }}>
            This contact information will be shared with the brand so you can continue the conversation outside.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSend(message)}
          disabled={sending}
          className="w-full rounded-xl py-4 mt-6 text-white font-bold text-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
          style={{ fontFamily: FONT, background: '#1FBF57' }}
        >
          {sending ? 'Sending…' : 'Send & Share Contact'}
        </button>
      </div>
    </div>
  )
}

export default function InfluenceInquiryDetail({ username, id }) {
  const handle = username || dashboardUsername()
  const [inquiry, setInquiry] = useState(null)
  const [contact, setContact] = useState({ instagram: '', email: '' })
  const [status, setStatus] = useState('PENDING')
  const [showAccept, setShowAccept] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    if (!isLoggedIn()) { setLoading(false); return }
    Promise.all([fetchMyInquiries(), fetchMe().catch(() => null)])
      .then(([inqRes, meRes]) => {
        if (!alive) return
        const found = (inqRes.inquiries || []).map(mapInquiry).find((q) => q.id === id) || null
        setInquiry(found)
        if (found) setStatus(found.status)
        const creator = meRes?.creator || {}
        setContact({
          instagram: creator.username ? `@${creator.username}` : (handle ? `@${handle}` : ''),
          email: creator.email || '',
        })
      })
      .catch((e) => {
        if (e.status === 401) { clearAuth(); window.location.reload(); return }
        if (alive) setError(e.message || 'Failed to load inquiry')
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id, handle])

  const accept = async (message) => {
    setSaving(true)
    try {
      // Persist the (possibly edited) email back to the profile so it's saved
      // for next time and shows on the card. Non-fatal if it fails.
      if (contact.email) {
        try { await updateProfile({ email: contact.email }) } catch { /* ignore */ }
      }
      // Share the creator's contact + message with the accept call — the backend
      // emails these to the brand's submitted address.
      await setInquiryStatus(id, 'actioned', {
        contact: { instagram: contact.instagram, email: contact.email },
        message: message || '',
      })
      setStatus('ACCEPTED')
      setShowAccept(false)
    } catch (e) {
      setError(e.message || 'Failed to accept inquiry')
    } finally {
      setSaving(false)
    }
  }

  const decline = async () => {
    setSaving(true)
    try {
      await setInquiryStatus(id, 'declined')
      setStatus('DECLINED')
    } catch (e) {
      setError(e.message || 'Failed to decline inquiry')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoggedIn()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-5" style={{ background: '#05060f' }}>
        <p className="text-white text-xl font-semibold" style={{ fontFamily: FONT }}>Sign in to view this inquiry.</p>
        <a href={loginUrl()} className="rounded-xl px-6 py-3 text-[15px] font-semibold text-white no-underline" style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)' }}>Connect Instagram</a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#05060f' }}>
        <p className="text-white/50 text-[15px]" style={{ fontFamily: FONT }}>Loading inquiry…</p>
      </div>
    )
  }

  // Unknown id → simple not-found state with a way back to the list.
  if (!inquiry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: '#05060f' }}>
        <p className="text-white text-xl font-semibold mb-4" style={{ fontFamily: FONT }}>Inquiry not found.</p>
        <button
          type="button"
          onClick={() => goToPath(inquiriesPath(handle))}
          className="text-[#9C7CF0] font-medium bg-transparent border-0 cursor-pointer"
          style={{ fontFamily: FONT }}
        >
          ← Back to all inquiries
        </button>
      </div>
    )
  }

  const { brand, campaign, date } = inquiry

  return (
    <div className="relative min-h-screen text-white" style={{ background: '#05060f' }}>
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
          onClick={() => goToPath(inquiriesPath(handle))}
          className="flex items-center gap-2 text-[15px] font-medium text-white/70 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
          style={{ fontFamily: FONT }}
        >
          {ICONS.back} Back to Inquiries
        </button>
      </header>

      {/* ===== Content card ===== */}
      <main className="max-w-300 mx-auto px-4 md:px-10 py-8 md:py-12">
        <div
          className="rounded-3xl p-6 md:p-10"
          style={{ background: 'rgba(13,16,45,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Heading */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-[40px] font-bold leading-tight" style={{ fontFamily: FONT }}>Brand Inquiry</h1>
              <p className="text-white/50 text-base md:text-lg mt-2" style={{ fontFamily: FONT }}>Received on {date}</p>
            </div>
            <StatusPill status={status} />
          </div>

          <div className="h-px w-full mb-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {error && (
            <div className="rounded-xl px-5 py-4 mb-8 text-[14px]" style={{ fontFamily: FONT, color: '#FB7185', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>
          )}

          {/* Brand Details */}
          <SectionHeader icon={ICONS.building} label="Brand Details" color="#8B5CF6" />
          <div
            className="rounded-2xl p-6 md:p-7 mb-10"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
              <Field label="Brand Name">{brand.name}</Field>
              {brand.email && (
                <Field label="Contact Email">
                  <a
                    href={`mailto:${brand.email}`}
                    className="inline-flex items-center gap-2 no-underline break-all"
                    style={{ color: '#3DDC84' }}
                  >
                    {ICONS.mail} {brand.email}
                  </a>
                </Field>
              )}
              {brand.type && <Field label="Brand Type">{brand.type}</Field>}
              {brand.website && (
                <Field label="Website">
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" className="no-underline break-all" style={{ color: '#E731A2' }}>
                    {brand.website}
                  </a>
                </Field>
              )}
              {brand.social && <Field label="Social Links">{brand.social}</Field>}
              {brand.description && (
                <div className="md:col-span-2">
                  <Field label="Brand Description">
                    <span className="font-medium text-white/90">{brand.description}</span>
                  </Field>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <SectionHeader icon={ICONS.tag} label="Campaign Details" color="#E731A2" />
          <div
            className="rounded-2xl p-6 md:p-7 mb-8"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-col gap-6">
              {campaign.name && <Field label="Campaign Name">{campaign.name}</Field>}
              {campaign.type && (
                <div>
                  <p className="text-white/45 text-[15px] mb-2" style={{ fontFamily: FONT }}>Campaign Type</p>
                  <span
                    className="inline-block text-white font-semibold text-[15px] px-4 py-2 rounded-lg"
                    style={{ fontFamily: FONT, background: '#0a0b14', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {campaign.type}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2 text-white/45" style={{ fontFamily: FONT }}>
                  {ICONS.message} <span className="text-[15px]">Message from Brand</span>
                </div>
                <div
                  className="rounded-xl px-5 py-4 text-white/90 text-[15px] md:text-base leading-relaxed whitespace-pre-line"
                  style={{ fontFamily: FONT, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {campaign.message || 'No message provided.'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="h-px w-full my-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {status === 'ACCEPTED' ? (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span style={{ color: '#1FBF57' }}>{ICONS.check}</span>
                <h3 className="text-xl font-bold" style={{ fontFamily: FONT, color: '#1FBF57' }}>Creator Accepted</h3>
              </div>
              <div
                className="rounded-2xl px-6 py-5"
                style={{ background: 'rgba(31,191,87,0.06)', border: '1px solid rgba(31,191,87,0.35)' }}
              >
                <p className="text-white/45 text-[15px] mb-3" style={{ fontFamily: FONT }}>Contact Shared</p>
                <p className="text-[17px] mb-2" style={{ fontFamily: FONT }}>
                  <span style={{ color: '#9EA5E2' }}>Instagram: </span>
                  <span className="text-white font-bold">{contact.instagram}</span>
                </p>
                <p className="text-[17px]" style={{ fontFamily: FONT }}>
                  <span style={{ color: '#9EA5E2' }}>Email: </span>
                  <span className="text-white font-bold">{contact.email}</span>
                </p>
              </div>
            </div>
          ) : status === 'DECLINED' ? (
            <div
              className="rounded-xl px-5 py-4 flex items-center gap-3"
              style={{ background: 'rgba(244,96,122,0.1)', border: '1px solid rgba(244,96,122,0.35)' }}
            >
              <span className="text-white font-medium" style={{ fontFamily: FONT }}>You have declined this inquiry.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShowAccept(true)}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl py-4 text-white font-bold text-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
                style={{ fontFamily: FONT, background: '#1FBF57' }}
              >
                {ICONS.check} Accept Inquiry
              </button>
              <button
                type="button"
                onClick={decline}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl py-4 text-white font-bold text-lg transition-colors hover:bg-white/5 disabled:opacity-60"
                style={{ fontFamily: FONT, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                {ICONS.close} Decline
              </button>
            </div>
          )}
        </div>
      </main>

      {showAccept && <AcceptModal onClose={() => setShowAccept(false)} onSend={accept} contact={contact} setContact={setContact} sending={saving} />}
    </div>
  )
}

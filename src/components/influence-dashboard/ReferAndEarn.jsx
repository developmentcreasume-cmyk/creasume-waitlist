// Refer & Earn — the creator's referral panel inside the dashboard. Shows their
// unique invite link, how many 50%-off coupons they hold, who they've invited,
// and one-tap copy / share. Data comes from GET /creator/referrals.
import { useEffect, useState } from 'react'
import { fetchReferrals } from '../../services/dashboardApi.js'

const FONT = "'Outfit', sans-serif"

function StatCard({ value, label, accent }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex-1 min-w-[140px]"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <div className="text-[26px] font-bold leading-none mb-1" style={{ fontFamily: FONT, color: accent || '#fff' }}>{value}</div>
      <div className="text-white/55 text-[13px]" style={{ fontFamily: FONT }}>{label}</div>
    </div>
  )
}

export default function ReferAndEarn() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    let alive = true
    fetchReferrals()
      .then((res) => { if (alive) setData(res.referral) })
      .catch((e) => { if (alive) setErr(e.message || 'Could not load your referrals.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(''), 1600)
    } catch { /* clipboard blocked — user can select manually */ }
  }

  const share = async () => {
    if (!data?.link) return
    const shareData = {
      title: 'Join me on Creasume',
      text: `Build your verified creator media kit on Creasume — use my link and we both get ${data.discountPercent}% off.`,
      url: data.link,
    }
    try {
      if (navigator.share) await navigator.share(shareData)
      else copy(data.link, 'link')
    } catch { /* user cancelled the share sheet */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-9 w-9 rounded-full animate-spin" style={{ border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#9B93E8' }} />
      </div>
    )
  }

  if (err || !data) {
    return <p className="text-white/60 text-[14px] py-16 text-center" style={{ fontFamily: FONT }}>{err || 'No referral data.'}</p>
  }

  const pct = data.discountPercent

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Hero */}
      <div
        className="rounded-3xl p-7 md:p-9 mb-6 relative overflow-hidden"
        style={{ background: 'radial-gradient(120% 120% at 0% 0%, #2a3a8f 0%, #16205e 45%, #0a0f30 100%)' }}
      >
        <h1 className="font-semibold mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.4vw, 34px)', color: '#fff' }}>
          Give {pct}%, get {pct}%
        </h1>
        <p className="text-white/70 max-w-md text-[15px]" style={{ fontFamily: FONT }}>
          Share your link. When a creator signs up through it, <b className="text-white">you both</b> get {pct}% off your Creasume plan. There's no limit — every friend is another coupon.
        </p>
      </div>

      {!data.enabled && (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-[13px] font-medium"
          style={{ fontFamily: FONT, color: '#FBBF24', background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.30)' }}
        >
          The referral program is paused right now. Your link still works and will credit once it's re-enabled.
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatCard value={data.referralCount} label="Friends referred" accent="#C9C4F0" />
        <StatCard value={data.credits} label={`Coupons ready (${pct}% off each)`} accent="#4DE0B0" />
        <StatCard value={data.friends?.filter((f) => f.redeemed).length || 0} label="Friends subscribed" accent="#F472B6" />
      </div>

      {/* Invite link */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <label className="block text-white text-[13px] font-semibold mb-2" style={{ fontFamily: FONT }}>Your invite link</label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            readOnly
            value={data.link}
            onFocus={(e) => e.target.select()}
            className="flex-1 rounded-lg px-3.5 py-2.5 text-[14px] text-white/90 outline-none"
            style={{ fontFamily: FONT, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.14)' }}
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => copy(data.link, 'link')}
              className="rounded-lg px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-transform hover:scale-[1.02]"
              style={{ fontFamily: FONT, color: '#0B0B27', background: 'linear-gradient(180deg, #C9C4F0 0%, #A79FE6 100%)' }}
            >
              {copied === 'link' ? 'Copied!' : 'Copy link'}
            </button>
            <button
              type="button"
              onClick={share}
              className="rounded-lg px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors"
              style={{ fontFamily: FONT, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)' }}
            >
              Share
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[13px] text-white/50" style={{ fontFamily: FONT }}>
          <span>Referral code:</span>
          <button
            type="button"
            onClick={() => copy(data.code, 'code')}
            className="font-semibold tracking-wider px-2 py-0.5 rounded"
            style={{ color: '#C9C4F0', background: 'rgba(155,147,232,0.12)' }}
          >
            {data.code}{copied === 'code' ? ' ✓' : ''}
          </button>
        </div>
      </div>

      {/* Invited friends */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <h3 className="text-white text-[15px] font-semibold mb-4" style={{ fontFamily: FONT }}>People you've invited</h3>
        {(!data.friends || data.friends.length === 0) ? (
          <p className="text-white/45 text-[14px] py-6 text-center" style={{ fontFamily: FONT }}>
            No one yet — share your link to start earning coupons.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {data.friends.map((f, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div
                  className="h-9 w-9 rounded-full bg-cover bg-center shrink-0 grid place-items-center text-[13px] font-semibold text-white/80"
                  style={{ backgroundImage: f.profilePicture ? `url(${f.profilePicture})` : 'none', background: f.profilePicture ? undefined : 'rgba(255,255,255,0.10)' }}
                >
                  {!f.profilePicture && (f.name?.[0]?.toUpperCase() || '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[14px] font-medium truncate" style={{ fontFamily: FONT }}>{f.name}</div>
                  <div className="text-white/40 text-[12px]" style={{ fontFamily: FONT }}>
                    {f.joinedAt ? new Date(f.joinedAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <span
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    fontFamily: FONT,
                    color: f.redeemed ? '#4DE0B0' : '#C9C4F0',
                    background: f.redeemed ? 'rgba(77,224,176,0.12)' : 'rgba(155,147,232,0.12)',
                  }}
                >
                  {f.redeemed ? 'Subscribed' : 'Joined'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

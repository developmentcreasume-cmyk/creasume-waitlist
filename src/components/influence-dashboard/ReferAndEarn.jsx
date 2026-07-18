// Refer & Earn — the creator's referral panel inside the dashboard. Shows their
// unique invite link, their cash earnings (a commission on every friend who buys
// a plan), a withdraw/payout flow, who they've invited, and one-tap copy / share.
// Data comes from GET /creator/referrals.
import { useEffect, useState } from 'react'
import { fetchReferrals, savePayoutDetails, requestPayout } from '../../services/dashboardApi.js'

const FONT = "'Outfit', sans-serif"

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

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

  // Payout-details form state.
  const [method, setMethod] = useState('upi')
  const [form, setForm] = useState({ upiId: '', accountName: '', accountNumber: '', ifsc: '', bankName: '' })
  const [savingDetails, setSavingDetails] = useState(false)
  const [detailsMsg, setDetailsMsg] = useState(null) // { text, error }
  const [requesting, setRequesting] = useState(false)
  const [payoutMsg, setPayoutMsg] = useState(null) // { text, error }

  const load = () => {
    fetchReferrals()
      .then((res) => {
        setData(res.referral)
        const d = res.referral?.earnings?.details
        if (d) {
          if (d.method) setMethod(d.method)
          setForm({
            upiId: d.upiId || '',
            accountName: d.accountName || '',
            accountNumber: d.accountNumber || '',
            ifsc: d.ifsc || '',
            bankName: d.bankName || '',
          })
        }
      })
      .catch((e) => setErr(e.message || 'Could not load your referrals.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

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
      text: `Build your verified creator media kit on Creasume — use my link and get ${data.discountPercent}% off your plan.`,
      url: data.link,
    }
    try {
      if (navigator.share) await navigator.share(shareData)
      else copy(data.link, 'link')
    } catch { /* user cancelled the share sheet */ }
  }

  async function onSaveDetails(e) {
    e.preventDefault()
    setSavingDetails(true)
    setDetailsMsg(null)
    try {
      const body = method === 'upi'
        ? { method, upiId: form.upiId }
        : { method, accountName: form.accountName, accountNumber: form.accountNumber, ifsc: form.ifsc, bankName: form.bankName }
      await savePayoutDetails(body)
      setDetailsMsg({ text: 'Payout details saved.' })
      load()
    } catch (e2) {
      setDetailsMsg({ text: e2.message || 'Could not save.', error: true })
    } finally {
      setSavingDetails(false)
    }
  }

  async function onRequestPayout() {
    setRequesting(true)
    setPayoutMsg(null)
    try {
      const res = await requestPayout()
      setPayoutMsg({ text: `Payout of ${inr(res.payout.amountInr)} requested — you'll be paid soon.` })
      load()
    } catch (e2) {
      setPayoutMsg({ text: e2.message || 'Could not request payout.', error: true })
    } finally {
      setRequesting(false)
    }
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

  const discPct = data.discountPercent
  const commPct = data.commissionPercent
  const e = data.earnings || {}
  const hasDetails = Boolean(e.details?.method)

  const badgeColor = (status) =>
    status === 'paid' ? '#4DE0B0' : status === 'rejected' ? '#F87171' : '#FBBF24'

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Hero */}
      <div
        className="rounded-3xl p-7 md:p-9 mb-6 relative overflow-hidden"
        style={{ background: 'radial-gradient(120% 120% at 0% 0%, #2a3a8f 0%, #16205e 45%, #0a0f30 100%)' }}
      >
        <h1 className="font-semibold mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.4vw, 34px)', color: '#fff' }}>
          Refer friends, earn {commPct}% cash
        </h1>
        <p className="text-white/70 max-w-md text-[15px]" style={{ fontFamily: FONT }}>
          Share your link. Your friend gets <b className="text-white">{discPct}% off</b> their Creasume plan, and when they pay you earn a <b className="text-white">{commPct}% commission</b> — real money you can withdraw. No limit on how much you earn.
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

      {/* Earnings */}
      <div className="flex flex-wrap gap-3 mb-4">
        <StatCard value={inr(e.availableInr)} label="Available to withdraw" accent="#4DE0B0" />
        <StatCard value={inr(e.earnedInr)} label="Total earned" accent="#C9C4F0" />
        <StatCard value={inr(e.paidInr)} label="Paid out" accent="#89DFEC" />
      </div>

      {/* Withdraw box */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <h3 className="text-white text-[15px] font-semibold" style={{ fontFamily: FONT }}>Withdraw your earnings</h3>
            <p className="text-white/45 text-[13px]" style={{ fontFamily: FONT }}>
              Minimum {inr(e.minPayoutInr)}. {e.pendingInr > 0 ? `${inr(e.pendingInr)} is in a pending request.` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestPayout}
            disabled={!e.canRequest || requesting}
            className="rounded-lg px-5 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-transform enabled:hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: FONT, color: '#06210f', background: 'linear-gradient(180deg, #6FE8B0 0%, #3FCB92 100%)' }}
          >
            {requesting ? 'Requesting…' : `Withdraw ${inr(e.availableInr)}`}
          </button>
        </div>
        {!hasDetails && (
          <p className="text-[13px]" style={{ fontFamily: FONT, color: '#FBBF24' }}>Add your payout details below before you can withdraw.</p>
        )}
        {!e.canRequest && hasDetails && data.enabled && (
          <p className="text-white/45 text-[13px]" style={{ fontFamily: FONT }}>
            You need at least {inr(e.minPayoutInr)} available to withdraw.
          </p>
        )}
        {payoutMsg && (
          <p className="text-[13px] mt-2" style={{ fontFamily: FONT, color: payoutMsg.error ? '#F87171' : '#4DE0B0' }}>{payoutMsg.text}</p>
        )}

        {/* Payout details form */}
        <form onSubmit={onSaveDetails} className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex gap-2 mb-3">
            {['upi', 'bank'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className="rounded-lg px-3.5 py-1.5 text-[13px] font-semibold"
                style={{
                  fontFamily: FONT,
                  color: method === m ? '#0B0B27' : '#fff',
                  background: method === m ? 'linear-gradient(180deg, #C9C4F0 0%, #A79FE6 100%)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                {m === 'upi' ? 'UPI' : 'Bank transfer'}
              </button>
            ))}
          </div>

          {method === 'upi' ? (
            <input
              value={form.upiId}
              onChange={(ev) => setForm({ ...form, upiId: ev.target.value })}
              placeholder="yourname@bank"
              className="w-full rounded-lg px-3.5 py-2.5 text-[14px] text-white/90 outline-none"
              style={{ fontFamily: FONT, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.14)' }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { k: 'accountName', ph: 'Account holder name' },
                { k: 'accountNumber', ph: 'Account number' },
                { k: 'ifsc', ph: 'IFSC code' },
                { k: 'bankName', ph: 'Bank name (optional)' },
              ].map(({ k, ph }) => (
                <input
                  key={k}
                  value={form[k]}
                  onChange={(ev) => setForm({ ...form, [k]: ev.target.value })}
                  placeholder={ph}
                  className="w-full rounded-lg px-3.5 py-2.5 text-[14px] text-white/90 outline-none"
                  style={{ fontFamily: FONT, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.14)' }}
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={savingDetails}
              className="rounded-lg px-4 py-2 text-[14px] font-semibold disabled:opacity-50"
              style={{ fontFamily: FONT, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)' }}
            >
              {savingDetails ? 'Saving…' : hasDetails ? 'Update payout details' : 'Save payout details'}
            </button>
            {detailsMsg && (
              <span className="text-[13px]" style={{ fontFamily: FONT, color: detailsMsg.error ? '#F87171' : '#4DE0B0' }}>{detailsMsg.text}</span>
            )}
          </div>
        </form>

        {/* Payout history */}
        {e.history?.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 className="text-white/70 text-[13px] font-semibold mb-2.5" style={{ fontFamily: FONT }}>Withdrawal history</h4>
            <ul className="flex flex-col gap-2">
              {e.history.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 text-[13px]" style={{ fontFamily: FONT }}>
                  <span className="text-white/80">{inr(p.amountInr)} <span className="text-white/40">· {p.method.toUpperCase()}</span></span>
                  <span className="flex items-center gap-2">
                    <span className="text-white/35">{p.requestedAt ? new Date(p.requestedAt).toLocaleDateString() : ''}</span>
                    <span className="font-semibold px-2 py-0.5 rounded-full capitalize" style={{ color: badgeColor(p.status), background: 'rgba(255,255,255,0.06)' }}>{p.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Invite link */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <label className="block text-white text-[13px] font-semibold mb-2" style={{ fontFamily: FONT }}>Your invite link</label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            readOnly
            value={data.link}
            onFocus={(ev) => ev.target.select()}
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
            No one yet — share your link to start earning.
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
                {f.redeemed && f.commissionInr > 0 ? (
                  <span
                    className="text-[12px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ fontFamily: FONT, color: '#4DE0B0', background: 'rgba(77,224,176,0.12)' }}
                  >
                    +{inr(f.commissionInr)}
                  </span>
                ) : (
                  <span
                    className="text-[12px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ fontFamily: FONT, color: f.redeemed ? '#4DE0B0' : '#C9C4F0', background: f.redeemed ? 'rgba(77,224,176,0.12)' : 'rgba(155,147,232,0.12)' }}
                  >
                    {f.redeemed ? 'Subscribed' : 'Joined'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

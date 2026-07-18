import { goToPath } from '../../router.js'
import { billingUrl } from '../../services/dashboardApi.js'

// "Upgrade to unlock" overlay shown ONLY to the card owner (free/starter plans)
// where a premium section would normally sit. Renders a blurred placeholder
// (children) behind a lock + CTA. Public visitors never see this — the caller
// gates on IS_OWNER before rendering it. The CTA deep-links to the owner's
// dashboard Plan & Billing tab.

const FONT = "'Outfit', sans-serif"

export default function LockedFeature({ title = 'Premium feature', note, children, minHeight = 170, className = '' }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      {/* Blurred, non-interactive placeholder so the lock reads as "there's real
          content here you can't see yet". */}
      <div className="pointer-events-none select-none" style={{ filter: 'blur(7px)', opacity: 0.35, minHeight }} aria-hidden="true">
        {children}
      </div>

      {/* Lock overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 px-6"
        style={{ background: 'rgba(8,8,14,0.55)', backdropFilter: 'blur(1px)' }}
      >
        <span
          className="grid place-items-center rounded-full shrink-0"
          style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </span>
        <div>
          <p className="text-white font-semibold text-[15px]" style={{ fontFamily: FONT }}>{title}</p>
          {note && <p className="text-white/55 text-[13px] mt-1 max-w-xs" style={{ fontFamily: FONT }}>{note}</p>}
        </div>
        <button
          type="button"
          onClick={() => goToPath(billingUrl())}
          className="rounded-full px-5 py-2 text-[13px] font-bold text-white transition-transform hover:scale-[1.03]"
          style={{ fontFamily: FONT, background: 'var(--theme-grad, linear-gradient(90deg,#7C5CFF,#C04DCC))' }}
        >
          Upgrade to unlock
        </button>
      </div>
    </div>
  )
}

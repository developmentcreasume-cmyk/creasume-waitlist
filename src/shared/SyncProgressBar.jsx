import { useEffect, useState } from 'react'

// Inject the shimmer keyframes once (module-level) so the bar has a continuous
// moving highlight — it never looks frozen even while it waits near the top.
if (typeof document !== 'undefined' && !document.getElementById('sync-progress-kf')) {
  const el = document.createElement('style')
  el.id = 'sync-progress-kf'
  el.textContent = '@keyframes syncShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}'
  document.head.appendChild(el)
}

// Indeterminate "syncing" progress bar for full-screen load states. There's no
// real percentage to report (we're waiting on the data fetches), so it keeps
// creeping upward — fast early, slow near the top — and the fill carries a
// continuously-sweeping highlight so it never appears stuck. It caps at 99 and
// the screen unmounts the moment data lands (a slow hold near the top means the
// backend is still responding — e.g. a Render cold start).
export default function SyncProgressBar() {
  const [pct, setPct] = useState(6)
  useEffect(() => {
    const id = setInterval(() => {
      setPct((p) => {
        if (p >= 99) return 99
        const step = p < 40 ? 4 : p < 65 ? 2.5 : p < 80 ? 1.2 : p < 92 ? 0.6 : 0.28
        return Math.min(99, p + step)
      })
    }, 180)
    return () => clearInterval(id)
  }, [])
  const shown = Math.round(pct)
  return (
    <div className="w-64 max-w-[72vw] flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #7C5CFF, #A78BFA, #C9C4F0)',
            boxShadow: '0 0 12px rgba(124,92,255,0.55)',
            transition: 'width 200ms linear',
          }}
        >
          {/* Sweeping highlight — always moving, so the bar never looks stuck. */}
          <span
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)',
              animation: 'syncShimmer 1.1s linear infinite',
            }}
          />
        </div>
      </div>
      <span
        className="text-[12px] font-semibold tabular-nums"
        style={{ fontFamily: "'Outfit', sans-serif", color: '#C4B5FD', minWidth: 34, textAlign: 'right' }}
      >
        {shown}%
      </span>
    </div>
  )
}

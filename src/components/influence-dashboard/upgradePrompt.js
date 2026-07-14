// The bridge that raises the dashboard's upgrade prompt.
//
// Kept out of UpgradeModal.jsx so that file only exports a component (React Fast
// Refresh requires that). Two producers fire this event:
//
//   • services/dashboardApi.js — automatically, on any HTTP 402 from a backend
//     plan gate, so a blocked action needs no special handling at the call site.
//   • showUpgrade(...) — manually, for controls that are locked in the UI and
//     never reach the API.
//
// UpgradeModal.jsx is the single consumer.

export const UPGRADE_EVENT = 'creasume:upgrade'

/**
 * Pop the upgrade modal.
 * @param {string} feature - a key from backend config/planFeatures.js
 *                           (e.g. 'packagesSection', 'brandInquiryButton')
 * @param {string} [message] - fallback copy when the feature isn't in the map
 * @param {string} [plan] - the creator's current plan slug, if known
 */
export function showUpgrade(feature, message, plan) {
  try {
    window.dispatchEvent(
      new CustomEvent(UPGRADE_EVENT, { detail: { feature, message, plan } })
    )
  } catch { /* no window (SSR) */ }
}

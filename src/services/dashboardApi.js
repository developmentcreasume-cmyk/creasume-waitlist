// Talks to the Creasume backend for the creator-facing Influence Dashboard
// (/<username>/dashboard). Two kinds of calls:
//   • PUBLIC  — GET /public/:username, the same payload the live card reads. No
//     auth; used for the display stats, posts, platforms and card link.
//   • PRIVATE — the creator's own data + writes (/creator, /inquiry, /packages,
//     /collaborations). These need the JWT issued by the Instagram login flow,
//     which /auth-success stores in localStorage.
//
// Editing here writes through the SAME models the public card renders, so a save
// shows up on the card on its next load (the card refetches on window focus).

import { API_BASE, formatCount, shortenLocation } from './influenceApi.js'
import { showUpgrade } from '../components/influence-dashboard/upgradePrompt.js'

const TOKEN_KEY = 'creasume_token'
const USERNAME_KEY = 'creasume_username'

// ---- Auth token (set by /auth-success after Instagram login) ----
export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
export function setToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token) } catch { /* storage unavailable */ }
}
export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
  } catch { /* storage unavailable */ }
}
export function setStoredUsername(username) {
  try { localStorage.setItem(USERNAME_KEY, username) } catch { /* storage unavailable */ }
}
export function getStoredUsername() {
  try { return localStorage.getItem(USERNAME_KEY) || '' } catch { return '' }
}
export function isLoggedIn() {
  return Boolean(getToken())
}

// Begin the Instagram login flow on the backend. It returns here via
// /auth-success?token=…&username=… once the creator authorises.
export function loginUrl() {
  return `${API_BASE}/auth/instagram`
}

// Begin the Facebook connect flow (Facebook Page → linked Instagram Business
// account). When a creator is signed in (the dashboard "Connect Facebook"
// button), use the SELF-CONNECT route and pass their token so the Meta data
// attaches to THEIR account — otherwise the callback would re-identify them by
// whichever Instagram account sits behind the connected Page and switch them
// into a different creator. Falls back to the plain flow when not logged in.
export function facebookLoginUrl() {
  const token = getToken()
  return token
    ? `${API_BASE}/auth/facebook/connect?token=${encodeURIComponent(token)}`
    : `${API_BASE}/auth/facebook`
}

// ---- Email / password account auth (backend routes/authAccount.js) ----
// Create/authenticate a creator account and store the JWT. The creator then
// connects Instagram from the Connect page (see connectInstagramUrl).
async function postAuth(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong')
  if (data.token) setToken(data.token)
  if (data.creator?.username) setStoredUsername(data.creator.username)
  return data
}
export const registerAccount = (body) => postAuth('/auth/register', { ...body, referralCode: getReferralCode() })
export const loginAccount = (body) => postAuth('/auth/login', body)

// Phone OTP via the MSG91 widget: the widget already verified the OTP and gave
// us an access token; the backend confirms it and returns { token, creator }.
export const verifyPhoneWidget = (accessToken, name) =>
  postAuth('/auth/phone/verify-widget', { accessToken, name, referralCode: getReferralCode() })

// Google Sign-In. `credential` is the signed ID token from Google Identity
// Services (see components/GoogleSignInButton.jsx). The backend verifies it,
// then finds/links/creates the matching creator and returns the SAME
// { token, creator } shape as email login — so callers can route on
// instagramConnected / publicId exactly like loginAccount does.
export const loginWithGoogle = (credential) => postAuth('/auth/google', { credential, referralCode: getReferralCode() })

// ---- Refer & Earn ----
// The referral code from a ?ref=CODE signup link is captured on first visit and
// kept until the user actually signs up (survives the Google popup / page
// switches), then forwarded to whichever signup method they use.
const REFERRAL_KEY = 'creasume_ref'
export function captureReferralCode() {
  try {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref && ref.trim()) localStorage.setItem(REFERRAL_KEY, ref.trim())
  } catch { /* storage unavailable */ }
}
export function getReferralCode() {
  try { return localStorage.getItem(REFERRAL_KEY) || '' } catch { return '' }
}
// Set/replace the pending code (used by the typed "referral code" field on the
// signup form). Uppercased to match how codes are stored/looked up.
export function setReferralCode(code) {
  try {
    const c = (code || '').trim().toUpperCase()
    if (c) localStorage.setItem(REFERRAL_KEY, c)
    else localStorage.removeItem(REFERRAL_KEY)
  } catch { /* storage unavailable */ }
}
export function clearReferralCode() {
  try { localStorage.removeItem(REFERRAL_KEY) } catch { /* storage unavailable */ }
}

// The signed-in creator's Refer & Earn panel data (code, link, coupons, friends).
export const fetchReferrals = () => dapi.get('/creator/referrals')

// Password reset. forgotPassword always resolves (the backend never reveals
// whether the email exists). resetPassword logs the creator in on success.
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return res.json().catch(() => ({ success: true }))
}
export const resetPassword = (body) => postAuth('/auth/reset-password', body)

// Start Instagram OAuth to LINK it to the currently-signed-in account (instead
// of creating a brand-new Instagram-only creator). Carries the JWT so the
// backend's /auth/instagram/connect route knows which creator to attach it to.
export function connectInstagramUrl() {
  const t = getToken()
  return t
    ? `${API_BASE}/auth/instagram/connect?token=${encodeURIComponent(t)}`
    : `${API_BASE}/auth/instagram`
}

// Which dashboard we're on: the FIRST path segment (e.g. `/hetvi/dashboard` →
// "hetvi"). Falls back to the logged-in creator's stored username.
export function dashboardUsername() {
  if (typeof window === 'undefined') return getStoredUsername()
  const parts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  if (parts[0] && parts[0] !== 'dashboard') return decodeURIComponent(parts[0])
  return getStoredUsername()
}

// Path helpers so navigation always carries the username segment.
export const dashboardBase = (username) => `/${encodeURIComponent(username)}/dashboard`
export const inquiriesPath = (username) => `${dashboardBase(username)}/inquiries`
export const inquiryDetailPath = (username, id) => `${dashboardBase(username)}/inquiries/${id}`

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Authenticated JSON request. Throws on failure; a 401 is tagged so callers can
// show the "sign in again" state instead of a generic error.
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) {
    // The stored token is invalid/expired, or the account no longer exists.
    // Drop it so the app falls back to the logged-out state instead of looping
    // on a token that will never work again.
    clearAuth()
    const err = new Error(data.error || 'Not authorized')
    err.status = 401
    throw err
  }
  // 402 = the creator's PLAN doesn't include this. Every backend plan gate
  // answers this way ({ requiredFeature, currentPlan }), so raising the upgrade
  // prompt here means ANY blocked action — creating a package, a 6th collab
  // logo, saving a custom theme, opening a brand inquiry — pops the same modal
  // without each caller needing to know anything about plans.
  // (components/influence-dashboard/UpgradeModal.jsx listens for this.)
  if (res.status === 402) {
    const err = new Error(data.error || 'Upgrade your plan to use this feature.')
    err.status = 402
    err.requiredFeature = data.requiredFeature || ''
    err.currentPlan = data.currentPlan || ''
    showUpgrade(err.requiredFeature, err.message, err.currentPlan)
    throw err
  }
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export const dapi = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
}

// DEV CONVENIENCE: when running `npm run dev` and there's no token yet, grab one
// for the given creator from the backend's dev-login (which is disabled in
// production, so this is a no-op there). This makes Save / Fetch work locally
// without the manual /dev-login step or the localhost-vs-127.0.0.1 origin dance.
export async function ensureDevToken(username) {
  if (getToken()) return getToken()
  if (!username || !import.meta.env.DEV) return ''
  try {
    const res = await fetch(`${API_BASE}/auth/dev-login?username=${encodeURIComponent(username)}`)
    const data = await res.json().catch(() => ({}))
    if (data?.success && data.token) {
      setToken(data.token)
      setStoredUsername(data.username)
      return data.token
    }
  } catch { /* backend offline / dev-login disabled — ignore */ }
  return ''
}

// ---- Public display data ----
// Sends the auth token when present so the OWNER can read their own card payload
// (stats, posts, demographics) even before an admin sets the card live; visitors
// without a token still get the public-only behaviour.
export async function fetchPublic(username) {
  if (!username) return null
  const res = await fetch(`${API_BASE}/public/${encodeURIComponent(username)}`, {
    cache: 'no-store',
    headers: { ...authHeaders() },
  })
  const data = await res.json().catch(() => null)
  if (!data?.success) return null
  return data
}

// ---- Creator (private) ----
export const fetchMe = () => dapi.get('/creator/me')
// Re-pull LIVE Instagram data (followers, media, reach, bio, demographics…) and
// persist it, so the dashboard/card reflect the latest numbers. This is what the
// "Refresh Stats" button calls — a plain reload only re-reads the cached data.
export const refreshStats = () => dapi.post('/creator/refresh')
// Set or change the account password (signed in). { currentPassword?, newPassword }
export const setPassword = (body) => dapi.post('/auth/set-password', body)
export const fetchDashboardStats = () => dapi.get('/creator/dashboard-stats')
export const updateProfile = (body) => dapi.put('/creator/update', body)
export const deleteAccount = () => dapi.del('/creator/me')

// ---- Inquiries (private) ----
export const fetchMyInquiries = () => dapi.get('/inquiry/my-inquiries')
// On accept (status 'actioned') the backend emails the brand the creator's
// shared contact + optional message, so pass them through here.
export const setInquiryStatus = (id, status, share = {}) =>
  dapi.put(`/inquiry/update-status/${id}`, { status, ...share })

// ---- Packages (private) ----
export const fetchMyPackages = () => dapi.get('/packages/my-packages')
export const createPackage = (body) => dapi.post('/packages/create', body)
export const updatePackage = (id, body) => dapi.put(`/packages/update/${id}`, body)
export const deletePackage = (id) => dapi.del(`/packages/delete/${id}`)

// ---- Billing (Razorpay) ----
export const fetchPlans = () => dapi.get('/billing/plans')
export const fetchBillingStatus = () => dapi.get('/billing/status')
export const cancelSubscription = () => dapi.post('/billing/cancel', {})
// Switch DOWN to a cheaper plan mid-cycle. No charge (they already paid more) and
// no refund; the expiry date is unchanged, only the features drop.
export const downgradePlan = (planId) => dapi.post('/billing/downgrade', { planId })
// Check a typed referral code before checkout → { valid, discountPercent, reason }.
export const validateReferralCode = (code) => dapi.post('/billing/referral/validate', { code })

let _rzpScript = null
function loadRazorpay() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(true)
  if (_rzpScript) return _rzpScript
  _rzpScript = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('Failed to load Razorpay checkout.'))
    document.body.appendChild(s)
  })
  return _rzpScript
}

// Buy a plan: create the checkout on the backend, open Razorpay (order OR
// subscription), verify. Resolves { plan, status } on success.
export async function buyPlan(planId, referralCode = '') {
  await loadRazorpay()
  const res = await dapi.post('/billing/checkout', { planId, referralCode })
  return new Promise((resolve, reject) => {
    const common = {
      key: res.keyId,
      name: 'Creasume',
      description: `${res.plan.name} — ₹${res.plan.priceInr}`,
      prefill: res.prefill || {},
      theme: { color: '#7C5CFF' },
      // Access is granted by the Razorpay WEBHOOK (source of truth), not here.
      // On checkout success we just resolve; the UI then re-fetches
      // /billing/status (the webhook flips the plan to active server-side).
      handler: () => resolve({ pending: true }),
      modal: { ondismiss: () => reject(new Error('Checkout closed before payment.')) },
    }
    const options = res.type === 'subscription'
      ? { ...common, subscription_id: res.subscriptionId }
      : { ...common, order_id: res.orderId, amount: res.amount, currency: res.currency }
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp) => reject(new Error(resp.error?.description || 'Payment failed.')))
    rzp.open()
  })
}

// ---- Collaborations / Portfolio (private) ----
export const fetchMyCollaborations = () => dapi.get('/collaborations/my-collaborations')
export const createCollaboration = (body) => dapi.post('/collaborations/create', body)
export const deleteCollaboration = (id) => dapi.del(`/collaborations/delete/${id}`)
// Resolve an Instagram post/reel URL (one of the creator's own) to its live
// per-post metrics + thumbnail. Returns { post }. Does not persist.
export const fetchCollabMetrics = (url) => dapi.post('/collaborations/fetch-metrics', { url })

// ---- Mappers: backend payloads → the shapes the dashboard renders ----

// "2024-08-01T…" → "01/08/2024" (the inquiry list/detail date format).
export function inquiryDate(d) {
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`
}

// Backend inquiry status → the UI's PENDING / ACCEPTED / DECLINED.
export function inquiryStatusLabel(status) {
  if (status === 'actioned') return 'ACCEPTED'
  if (status === 'declined') return 'DECLINED'
  return 'PENDING'
}

// One backend inquiry → the brand/campaign shape the inquiry pages render. The
// backend stores { brandName, email, brief, campaignType }; the brief carries
// any campaign-type / agency lines the brand typed (see influenceApi.sendInquiry).
export function mapInquiry(q) {
  const brief = q.brief || ''
  const firstLine = brief.split('\n').map((l) => l.trim()).find(Boolean) || 'Brand inquiry'
  return {
    id: q._id,
    status: inquiryStatusLabel(q.status),
    rawStatus: q.status,
    date: inquiryDate(q.createdAt),
    detail: firstLine,
    brand: {
      name: q.brandName || 'Brand',
      email: q.email || '',
      type: q.campaignType || '',
      website: '',
      social: '',
      description: '',
    },
    campaign: {
      name: q.campaignType || firstLine,
      type: q.campaignType || '',
      message: brief,
    },
  }
}

export { formatCount, API_BASE, shortenLocation }

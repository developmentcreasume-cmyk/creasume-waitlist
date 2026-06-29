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
    const err = new Error(data.error || 'Not authorized')
    err.status = 401
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
export const fetchDashboardStats = () => dapi.get('/creator/dashboard-stats')
export const updateProfile = (body) => dapi.put('/creator/update', body)
export const deleteAccount = () => dapi.del('/creator/me')

// ---- Inquiries (private) ----
export const fetchMyInquiries = () => dapi.get('/inquiry/my-inquiries')
export const setInquiryStatus = (id, status) =>
  dapi.put(`/inquiry/update-status/${id}`, { status })

// ---- Packages (private) ----
export const fetchMyPackages = () => dapi.get('/packages/my-packages')
export const createPackage = (body) => dapi.post('/packages/create', body)
export const updatePackage = (id, body) => dapi.put(`/packages/update/${id}`, body)
export const deletePackage = (id) => dapi.del(`/packages/delete/${id}`)

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

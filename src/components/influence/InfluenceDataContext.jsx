/* eslint-disable react-refresh/only-export-components -- context module intentionally exports the provider component and its hook together */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CREATOR } from './influenceData.js'
import { fetchInfluenceData, mapInfluenceData } from '../../services/influenceApi.js'

// Real data only — no demo placeholders. Every section starts EMPTY and is
// filled by mapInfluenceData() once the backend returns the creator; sections
// with no data hide themselves. CREATOR keeps the pills/tiles SHAPE so the hero
// renders, but its values are overridden with real numbers (or 0) by the mapper.
const DEFAULTS = {
  CREATOR,
  GROWTH: [], MONTHS: [], ENGAGEMENT_BARS: [], AGE_GROUPS: [], TOP_LOCATIONS: [],
  TOP_COUNTRIES: [], GENDER_SPLIT: null, SOCIALS: [], CAMPAIGNS: [],
  BRAND_SUMMARY: [], BRAND_DEALS: [], PACKAGES: [], PHOTOS: [], TOP_POSTS: [],
  FEATURED: {}, THEME: null,
}

const InfluenceContext = createContext({ ...DEFAULTS, ready: false })

// After the card loads, normalise the address bar to /<username>/<publicId> so
// the @username is visible even when opened via a legacy /<publicId> link or a
// wrong username. The publicId (last segment) is what actually resolved it, so
// this is purely cosmetic. Skipped in the Edit-Profile preview iframe.
function canonicalizeCardUrl(creator) {
  try {
    if (typeof window === 'undefined' || !creator || !creator.publicId || !creator.username) return
    if (new URLSearchParams(window.location.search).has('preview')) return
    const want = `/${encodeURIComponent(creator.username)}/${creator.publicId}`
    const current = window.location.pathname.replace(/\/+$/, '')
    if (current !== want) {
      window.history.replaceState({}, '', want + window.location.search + window.location.hash)
    }
  } catch { /* ignore */ }
}

// Every influence section reads its data through this hook, so swapping demo
// data for the live creator is a single fetch at the provider.
export function useInfluence() {
  return useContext(InfluenceContext)
}

export function InfluenceDataProvider({ children }) {
  const [value, setValue] = useState(DEFAULTS)
  // `ready` stays false until the FIRST fetch resolves, so the page can wait and
  // never flash the empty/placeholder hero before real data lands.
  const [ready, setReady] = useState(false)
  // True when the handle in the URL doesn't resolve to a creator (e.g. someone
  // typed a @username instead of the card's unguessable publicId link). The card
  // then shows a "not available" page instead of an empty placeholder.
  const [notFound, setNotFound] = useState(false)
  // Live-preview overrides: when the card is loaded inside the dashboard's Edit
  // Profile preview iframe (`?preview=…`), the editor postMessages the CURRENT
  // (unsaved) edits and we apply them on top of the fetched data so the card
  // updates as the creator types / picks a colour, with no save needed.
  const [preview, setPreview] = useState(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!new URLSearchParams(window.location.search).has('preview')) return
    const onMsg = (e) => {
      if (e.data && e.data.source === 'creasume-edit') setPreview(e.data.payload)
    }
    window.addEventListener('message', onMsg)
    // Tell the editor we're mounted so it sends the current edit state now.
    try { window.parent?.postMessage({ source: 'creasume-preview-ready' }, '*') } catch { /* cross-origin */ }
    return () => window.removeEventListener('message', onMsg)
  }, [])

  useEffect(() => {
    let alive = true
    const load = () =>
      fetchInfluenceData()
        .then((api) => {
          if (!alive) return
          if (api) {
            setValue(mapInfluenceData(api, DEFAULTS)); setNotFound(false)
            canonicalizeCardUrl(api.creator) // show /<username>/<publicId> in the bar
          }
          else setNotFound(true) // handle didn't resolve (blocked username / bad link)
        })
        .catch(() => {}) // keep the current data on any failure
        .finally(() => { if (alive) setReady(true) })

    load()

    // Refetch when the page regains focus (e.g. switching back from the admin
    // after editing social links) so changes show without a manual reload.
    const onFocus = () => { if (document.visibilityState !== 'hidden') load() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      alive = false
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  // Merge the live-preview overrides (theme colour + profile text) onto the data.
  const merged = useMemo(() => {
    if (!preview) return value
    const next = { ...value }
    const t = preview.theme
    if (t && t.primary) {
      const secondary = t.secondary || t.primary
      next.THEME = {
        primary: t.primary,
        secondary,
        grad: `linear-gradient(90deg, ${t.primary} 0%, ${secondary} 100%)`,
        bg: t.bg || null,
        font: t.font || null,
      }
    }
    const p = preview.profile
    if (p) {
      next.CREATOR = {
        ...value.CREATOR,
        name: p.name || value.CREATOR.name,
        bio: p.bio || value.CREATOR.bio,
        niche: p.niche || value.CREATOR.niche,
      }
    }
    return next
  }, [value, preview])

  return <InfluenceContext.Provider value={{ ...merged, ready, notFound }}>{children}</InfluenceContext.Provider>
}

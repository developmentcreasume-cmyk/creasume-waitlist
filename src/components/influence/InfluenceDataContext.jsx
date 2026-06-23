/* eslint-disable react-refresh/only-export-components -- context module intentionally exports the provider component and its hook together */
import { createContext, useContext, useEffect, useState } from 'react'
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
  FEATURED: {},
}

const InfluenceContext = createContext({ ...DEFAULTS, ready: false })

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

  useEffect(() => {
    let alive = true
    const load = () =>
      fetchInfluenceData()
        .then((api) => {
          if (api && alive) setValue(mapInfluenceData(api, DEFAULTS))
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

  return <InfluenceContext.Provider value={{ ...value, ready }}>{children}</InfluenceContext.Provider>
}

/* eslint-disable react-refresh/only-export-components -- context module intentionally exports the provider component and its hook together */
import { createContext, useContext, useEffect, useState } from 'react'
import {
  CREATOR, GROWTH, MONTHS, ENGAGEMENT_BARS, AGE_GROUPS, TOP_LOCATIONS,
  TOP_COUNTRIES, GENDER_SPLIT, SOCIALS, BRAND_SUMMARY, BRAND_DEALS, PACKAGES,
  PHOTOS, TOP_POSTS, FEATURED,
} from './influenceData.js'
import { fetchInfluenceData, mapInfluenceData } from '../../services/influenceApi.js'

// The bundled Sample.Creator dataset. Shown immediately on load, on a bare
// `/influence` (no username in the URL), and as the fallback if the backend is
// unreachable or the creator isn't found.
const DEFAULTS = {
  CREATOR, GROWTH, MONTHS, ENGAGEMENT_BARS, AGE_GROUPS, TOP_LOCATIONS,
  TOP_COUNTRIES, GENDER_SPLIT, SOCIALS, BRAND_SUMMARY, BRAND_DEALS, PACKAGES,
  PHOTOS, TOP_POSTS, FEATURED,
}

const InfluenceContext = createContext(DEFAULTS)

// Every influence section reads its data through this hook, so swapping demo
// data for the live creator is a single fetch at the provider.
export function useInfluence() {
  return useContext(InfluenceContext)
}

export function InfluenceDataProvider({ children }) {
  const [value, setValue] = useState(DEFAULTS)

  useEffect(() => {
    let alive = true
    fetchInfluenceData()
      .then((api) => {
        if (api && alive) setValue(mapInfluenceData(api, DEFAULTS))
      })
      .catch(() => {}) // keep the demo data on any failure
    return () => { alive = false }
  }, [])

  return <InfluenceContext.Provider value={value}>{children}</InfluenceContext.Provider>
}

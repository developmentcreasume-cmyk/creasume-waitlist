import { useEffect } from 'react'

// Dependency-free per-route SEO. The app is a client-rendered SPA, so instead of
// a library we imperatively update the document head on mount / when props
// change. Tags are UPSERTED (reuse the existing tag if present, else create it),
// so the static tags baked into index.html get REPLACED rather than duplicated —
// every route ends up with exactly one <title>, one description, one canonical,
// etc. Google renders JS, so it picks these up; social scrapers that don't run
// JS still get the sensible index.html defaults.

const SITE = 'https://creasume.com'

// Update (or create) a <meta> keyed by name/property.
function upsertMeta(attr, key, content) {
  if (content == null || content === '') return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Update (or create) a <link rel="..."> (used for canonical).
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function Seo({ title, description, keywords, path, image, jsonLd, noindex = false }) {
  // Serialise jsonLd for the dep array so a changed object re-runs the effect.
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    if (title) {
      document.title = title
      upsertMeta('property', 'og:title', title)
      upsertMeta('name', 'twitter:title', title)
    }
    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
      upsertMeta('name', 'twitter:description', description)
    }
    if (keywords) upsertMeta('name', 'keywords', keywords)

    // Canonical + og:url. Default to the current path when none is passed.
    const rel = path || (typeof window !== 'undefined' ? window.location.pathname : '/')
    const url = SITE + (rel.startsWith('/') ? rel : `/${rel}`)
    upsertLink('canonical', url)
    upsertMeta('property', 'og:url', url)

    // Only override the share image when a page supplies one; otherwise keep the
    // default og-image.png from index.html.
    if (image) {
      upsertMeta('property', 'og:image', image)
      upsertMeta('name', 'twitter:image', image)
    }

    upsertMeta(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    // Structured data (JSON-LD). One shared <script id="seo-jsonld"> we rewrite
    // per route, removed when a route has none.
    let script = document.getElementById('seo-jsonld')
    if (jsonLdKey) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = 'seo-jsonld'
        document.head.appendChild(script)
      }
      script.textContent = jsonLdKey
    } else if (script) {
      script.remove()
    }
  }, [title, description, keywords, path, image, noindex, jsonLdKey])

  return null
}

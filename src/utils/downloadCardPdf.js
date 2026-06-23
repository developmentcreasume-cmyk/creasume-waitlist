// Render the whole Influence Card to a multi-page PDF.
//
// Gotchas this handles:
//  1. Sections animate in with framer-motion `whileInView` — anything that never
//     scrolled into view is still at opacity 0. Instead of scrolling the page
//     (jarring), we reveal those elements only in html2canvas's cloned DOM.
//  2. Tailwind v4 emits oklch() colours, which classic html2canvas can't parse —
//     so we use html2canvas-pro.
//  3. Browsers cap canvas size (~16k px / side). A long media kit at high scale
//     overflows that and comes back BLANK, so we cap the scale to fit.
//  Both libs are imported lazily (heavy) so they only load on download.

// Reveal framer-motion entrance state inside the CLONE: anything left at
// opacity:0 (never entered the viewport) is shown, and its entrance transform
// (translate/scale) is cleared so it lands at its final position.
function revealInClone(clonedDoc) {
  const root = clonedDoc.getElementById('influence-card-root')
  if (!root) return
  root.querySelectorAll('*').forEach((node) => {
    const st = node.style
    if (!st) return
    if (st.opacity === '0' || parseFloat(st.opacity) === 0) {
      st.opacity = '1'
      st.transform = 'none'
    }
  })
}

// Convert every <img> under `root` to a same-origin data URL so html2canvas
// never taints the canvas on a cross-origin image (the avatar is proxied from
// the backend on another port). Returns a restore() that puts the originals
// back. The backend sends `Access-Control-Allow-Origin: *`, so the fetch works.
async function inlineImages(root) {
  const restore = []
  await Promise.all(
    Array.from(root.querySelectorAll('img')).map(async (img) => {
      const src = img.currentSrc || img.src
      if (!src || src.startsWith('data:')) return
      try {
        const res = await fetch(src, { mode: 'cors', cache: 'force-cache' })
        if (!res.ok) return
        const blob = await res.blob()
        const dataUrl = await new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result)
          fr.onerror = reject
          fr.readAsDataURL(blob)
        })
        restore.push([img, img.getAttribute('src')])
        img.setAttribute('src', dataUrl)
      } catch {
        /* leave the original src; html2canvas will try useCORS */
      }
    }),
  )
  return () => restore.forEach(([img, src]) => (src == null ? img.removeAttribute('src') : img.setAttribute('src', src)))
}

export async function downloadCardPdf(name = 'creator') {
  const el = document.getElementById('influence-card-root')
  if (!el) return

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  // Cap the scale so the rendered canvas height stays under the browser's
  // ~16384px limit — otherwise html2canvas returns a blank canvas.
  const fullHeight = el.scrollHeight
  const MAX_CANVAS = 15000
  const scale = Math.max(0.6, Math.min(1.6, MAX_CANVAS / Math.max(fullHeight, 1)))

  const restoreImages = await inlineImages(el)
  let canvas
  try {
    canvas = await html2canvas(el, {
      scale,
      backgroundColor: '#05050b',
      useCORS: true,
      logging: false,
      imageTimeout: 0,
      windowWidth: el.scrollWidth,
      windowHeight: fullHeight,
      // Drop interactive-only bits (Book a Collab / Download PDF) from the export.
      ignoreElements: (node) => node.nodeType === 1 && node.hasAttribute('data-pdf-hide'),
      // Reveal not-yet-animated sections in the clone (no page scroll needed).
      onclone: revealInClone,
    })
  } finally {
    restoreImages()
  }

  if (!canvas || !canvas.width || !canvas.height) {
    throw new Error('Capture produced an empty canvas')
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4', compress: true })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgW = pageW
  const imgH = (canvas.height * imgW) / canvas.width
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  // Slice the tall capture across A4 pages by shifting the image up each page.
  let heightLeft = imgH
  let position = 0
  pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH)
  heightLeft -= pageH
  while (heightLeft > 0) {
    position -= pageH
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH)
    heightLeft -= pageH
  }

  const safe = String(name || 'creator').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '')
  pdf.save(`${safe || 'creator'}-media-kit.pdf`)
}

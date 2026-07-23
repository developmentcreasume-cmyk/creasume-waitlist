const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WAITLIST_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzoFsnidF5uEzdTRf6g86w8rWv0we-KLNHkEVdDezA33hLH11C8AjRUJtVL8L75r6JYww/exec'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed.' })
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const payload = {
      name: String(data?.name || '').trim(),
      email: String(data?.email || '').trim().toLowerCase(),
      phone: String(data?.phone || '').trim(),
      handle: String(data?.handle || '').trim(),
      followers: data?.followers ?? '',
      posts: data?.posts ?? '',
    }

    if (!payload.name || !EMAIL_PATTERN.test(payload.email) || !payload.handle) {
      return res.status(400).json({ ok: false, error: 'Name, valid email, and Instagram handle are required.' })
    }

    const googleResponse = await fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    })
    const result = await googleResponse.json().catch(() => null)

    if (!googleResponse.ok || !result?.ok) {
      throw new Error(result?.error || `Google Sheets returned HTTP ${googleResponse.status}.`)
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Waitlist submission failed:', error)
    return res.status(502).json({ ok: false, error: 'Google Sheets did not save the submission.' })
  }
}

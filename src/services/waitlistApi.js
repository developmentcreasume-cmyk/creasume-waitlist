const SHEET_ENDPOINT = import.meta.env.VITE_SHEET_ENDPOINT

export async function submitWaitlist(payload) {
  if (!SHEET_ENDPOINT) {
    throw new Error('The waitlist endpoint is not configured.')
  }

  const target = import.meta.env.PROD ? '/api/waitlist' : SHEET_ENDPOINT
  const response = await fetch(target, {
    method: 'POST',
    ...(import.meta.env.PROD ? {} : { mode: 'no-cors' }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })

  if (import.meta.env.PROD) {
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.ok) {
      throw new Error(result?.error || 'The waitlist submission could not be saved.')
    }
  }
}

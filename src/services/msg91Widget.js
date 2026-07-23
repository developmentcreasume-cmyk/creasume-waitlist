// MSG91 OTP Widget loader + thin promise wrappers.
//
// The widget (verify.msg91.com/otp-provider.js) sends and verifies the OTP on
// the client and returns a signed access token. We hand that token to our
// backend (/auth/phone/verify-widget) which confirms it with the secret authkey
// and logs the creator in. widgetId + tokenAuth are PUBLIC client values.

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID || '366766694976393939353035'
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH || '547947TfkVB2RYE6a4b780cP1'
const SCRIPT_SRC = 'https://verify.msg91.com/otp-provider.js'
const REQUEST_TIMEOUT_MS = 20000

let loadPromise = null

const errorMessage = (error, fallback) => {
  if (typeof error === 'string') return error
  return error?.message || error?.error || error?.data?.message || fallback
}

const waitForMethods = (resolve, reject, attempts = 40) => {
  if (typeof window.sendOtp === 'function' &&
      typeof window.verifyOtp === 'function' &&
      typeof window.retryOtp === 'function') {
    window.__msg91Inited = true
    resolve()
    return
  }
  if (attempts <= 0) {
    loadPromise = null
    reject(new Error('OTP service did not initialize. Please refresh and try again.'))
    return
  }
  window.setTimeout(() => waitForMethods(resolve, reject, attempts - 1), 100)
}

const widgetCall = (method, args, fallback) => new Promise((resolve, reject) => {
  if (typeof window[method] !== 'function') {
    reject(new Error('OTP service is not ready. Please refresh and try again.'))
    return
  }

  let settled = false
  const finish = (callback) => (value) => {
    if (settled) return
    settled = true
    window.clearTimeout(timer)
    callback(value)
  }
  const timer = window.setTimeout(
    finish(reject),
    REQUEST_TIMEOUT_MS,
    new Error('OTP service timed out. Please check your connection and try again.')
  )

  window[method](
    ...args,
    finish(resolve),
    finish((error) => reject(new Error(errorMessage(error, fallback))))
  )
})

// Load the provider script once and init the widget with exposeMethods:true so
// window.sendOtp / verifyOtp / retryOtp are available (no MSG91 popup UI).
export function loadMsg91Widget() {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.__msg91Inited) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const init = () => {
      try {
        window.initSendOTP({
          widgetId: WIDGET_ID,
          tokenAuth: TOKEN_AUTH,
          exposeMethods: true,
          success: () => {},   // handled per-call in widgetVerifyOtp
          failure: () => {},
        })
        waitForMethods(resolve, reject)
      } catch (e) {
        loadPromise = null
        reject(e)
      }
    }

    if (window.initSendOTP) return init()

    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.onload = init
    s.onerror = () => {
      loadPromise = null // allow a retry on the next attempt
      reject(new Error('Could not load the OTP widget. Check your connection.'))
    }
    document.body.appendChild(s)
  })

  return loadPromise
}

// Send an OTP to a phone (country code, no +) or email.
export function widgetSendOtp(identifier) {
  return widgetCall('sendOtp', [identifier], 'Failed to send OTP.')
}

// Verify the code the user typed. On success MSG91 returns the access token
// (in `message`) that our backend verifies.
export function widgetVerifyOtp(otp) {
  return widgetCall('verifyOtp', [otp], 'Invalid or expired OTP.')
    .then((data) => data?.message || data?.accessToken || data)
}

// Resend. channel: null = default; '11' SMS, '4' voice, '3' email, '12' WhatsApp.
export function widgetRetryOtp(channel = null) {
  return widgetCall('retryOtp', [channel], 'Failed to resend OTP.')
}

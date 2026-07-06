// MSG91 OTP Widget loader + thin promise wrappers.
//
// The widget (verify.msg91.com/otp-provider.js) sends and verifies the OTP on
// the client and returns a signed access token. We hand that token to our
// backend (/auth/phone/verify-widget) which confirms it with the secret authkey
// and logs the creator in. widgetId + tokenAuth are PUBLIC client values.

const WIDGET_ID = '366766694976393939353035'
const TOKEN_AUTH = '547947TfkVB2RYE6a4b780cP1'
const SCRIPT_SRC = 'https://verify.msg91.com/otp-provider.js'

let loadPromise = null

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
        window.__msg91Inited = true
        resolve()
      } catch (e) {
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
  return new Promise((resolve, reject) => {
    window.sendOtp(
      identifier,
      (data) => resolve(data),
      (err) => reject(new Error(err?.message || 'Failed to send OTP.'))
    )
  })
}

// Verify the code the user typed. On success MSG91 returns the access token
// (in `message`) that our backend verifies.
export function widgetVerifyOtp(otp) {
  return new Promise((resolve, reject) => {
    window.verifyOtp(
      otp,
      (data) => resolve(data?.message || data?.accessToken || data),
      (err) => reject(new Error(err?.message || 'Invalid or expired OTP.'))
    )
  })
}

// Resend. channel: null = default; '11' SMS, '4' voice, '3' email, '12' WhatsApp.
export function widgetRetryOtp(channel = null) {
  return new Promise((resolve, reject) => {
    window.retryOtp(
      channel,
      (data) => resolve(data),
      (err) => reject(new Error(err?.message || 'Failed to resend OTP.'))
    )
  })
}

// Alternate footer — a rounded 3-column card (Creasume / Company / Follow us)
// with a blue→pink gradient border. Used only on the How it Works and Contact
// pages; the rest of the site uses the standard Footer with the CREASUME
// wordmark.

const FONT = "'Outfit', sans-serif"

const CREASUME = [
  ['Home', '#home'], ['Work', '#work'], ['Service', '#service'], ['Insights', '#insights'],
  ['Plans', '#/pricing'], ['Testimonial', '#testimonial'], ['Achievements', '#achievements'],
]
const COMPANY = [
  ['Terms and Conditions', '#/terms'], ['Refund Policy', '#/refund-policy'],
]
const SOCIAL = [
  ['Instagram', '#'], ['LinkedIn', '#'], ['X', '#'],
]

function Column({ title, links }) {
  return (
    <div>
      <h4 className="font-bold text-lg mb-5" style={{ fontFamily: FONT }}>{title}</h4>
      <ul className="space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-white text-[15px] no-underline hover:underline underline-offset-4 decoration-1 decoration-white" style={{ fontFamily: FONT }}>{label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FooterCard() {
  return (
    <footer className="relative z-10 mt-auto px-6 sm:px-10 md:px-20 lg:px-28 pt-28 md:pt-40 pb-12">
      <div
        className="mx-auto w-full max-w-[860px] min-h-[200px] flex flex-col justify-between rounded-3xl px-7 sm:px-10 md:px-12 py-5 md:py-6"
        style={{
          // Solid dark-navy fill (padding-box) + #2E267E→#EC3434 gradient border.
          // The fill is a flat gradient so it's valid as a non-final bg layer.
          background:
            'linear-gradient(#000000, #000000) padding-box, ' +
            'linear-gradient(135deg, rgba(46,38,126,0.35) 0%, rgba(236,52,52,0.35) 100%) border-box',
          border: '1px solid transparent',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-6 md:pl-24">
          <Column title="Creasume" links={CREASUME} />
          <Column title="Company" links={COMPANY} />
          <Column title="Follow us" links={SOCIAL} />
        </div>
        <div className="mt-10 pt-5 border-t border-white/12 flex items-center justify-between gap-4">
          <span className="text-white text-[13px]" style={{ fontFamily: FONT }}>© 2026 Creasume. All rights reserved.</span>
          <a href="#/contact" className="text-white hover:text-white text-[13px] transition-colors" style={{ fontFamily: FONT }}>contact</a>
        </div>
      </div>
    </footer>
  )
}

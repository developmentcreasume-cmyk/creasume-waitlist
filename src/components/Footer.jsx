// Shared site footer. Used by the home page and the legal pages so the
// columns, links and giant CREASUME wordmark stay identical everywhere.
//
// Section links use `#home` / `#vision` / … which resolve to the home route
// (see router.js) and scroll to the matching section. Legal links use the
// `#/privacy-policy` and `#/terms` hash routes.
function Footer() {
  return (
    <footer className="relative z-10 px-6 md:px-16 lg:px-24 pt-12 md:pt-16 pb-8 border-t-2 border-white/20 overflow-hidden">
      {/* Ambient glow band behind the footer columns (top region) */}
      <img
        src="/Ellipse%2025%20(1).png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none left-1/2 -translate-x-1/2 top-0"
        style={{ width: '42%', height: '220px', opacity: 0.7, zIndex: 0 }}
      />
      <img
        src="/Ellipse%2024%20(2).png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ left: '-80px', top: '82px', width: '45%', height: '260px', opacity: 0.7, zIndex: 0 }}
      />
      <img
        src="/Ellipse%2024%20(2).png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ right: '-80px', top: '82px', width: '45%', height: '260px', opacity: 0.7, zIndex: 0 }}
      />

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mb-16">
        <div>
          <h4 className="font-semibold text-2xl mb-6">Creasume</h4>
          <ul className="space-y-4 text-lg text-white font-normal">
            <li><a href="#home" className="hover:text-white transition">Home</a></li>
            <li><a href="#vision" className="hover:text-white transition">Vision</a></li>
            <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
            <li><a href="#waitlist" className="hover:text-white transition">Join the Waitlist</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-2xl mb-6">Follow us</h4>
          <ul className="space-y-4 text-lg text-white">
            <li><a href="#" className="hover:text-white transition">Instagram</a></li>
            <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
            <li><a href="#" className="hover:text-white transition">X</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-2xl mb-6">Work with Us</h4>
          <ul className="space-y-4 text-sm md:text-lg text-white">
            <li><a href="mailto:partnerships@creasume.com" className="hover:text-white transition break-words">partnerships@creasume.com</a></li>
          </ul>
          <h4 className="font-semibold text-2xl mt-8 mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm md:text-lg text-white">
            <li><a href="mailto:support@creasume.com" className="hover:text-white transition break-words">support@creasume.com</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-2xl mb-6">Legal</h4>
          <ul className="space-y-4 text-lg text-white">
            <li><a href="#/privacy-policy" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#/terms" className="hover:text-white transition">Terms and Conditions</a></li>
          </ul>
        </div>
      </div>

      {/* Full-width divider line below the footer links */}
      <div className="relative z-10 border-t-2 border-white/20 -mx-6 md:-mx-16 lg:-mx-24 mb-8" />

      <div className="relative z-10 text-right text-base text-white/75 mb-20 md:mb-28">
        © 2026 Creasume. All rights reserved.
      </div>

      {/* Giant CREASUME text — hollow outline of the real font */}
      <div className="relative z-10 overflow-hidden -mb-8 -mx-6 md:-mx-16 lg:-mx-24">
        <h1 className="giant-text text-center select-none whitespace-nowrap">
          CREASUME
        </h1>
      </div>
    </footer>
  )
}

export default Footer

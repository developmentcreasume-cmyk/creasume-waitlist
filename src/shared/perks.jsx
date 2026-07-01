// Founding Creator perk cards (order = reveal order in the coverflow).
// Kept in its own module (no component export) so both the waitlist page and the
// landing page can import it without tripping Fast Refresh's
// "only export components" rule.
export const PERKS = [
  { icon: <img src="/image/Vector.png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Early Access to Creasume' },
  { icon: <img src="/image/Vector%20(1).png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Exclusive Founding Creator Badge' },
  { icon: <img src="/image/Vector%20(3).png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Lifetime Access to Premium Version' },
  { icon: <img src="/image/Vector%20(4).png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Priority listing to brands' },
  { icon: <img src="/image/Vector%20(2).png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Chance to work with us as a partner and get paid' },
]

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, staggerParent } from '../motion-variants.js'

// FAQ accordion. Questions mirror the landing design; answers are kept short and
// sensible (placeholder-grade) so the section reads complete without inventing
// long marketing copy.
const FAQS = [
  {
    q: 'What is Creasume?',
    a: (
      <>
        Creasume is a platform that turns your content into a professional creator profile and media kit.
        It helps you showcase:
        <ul className="mt-3 space-y-1 list-disc list-inside text-white/70">
          <li>Your best content</li>
          <li>Your performance (views, engagement)</li>
          <li>Your creator identity</li>
        </ul>
        <span className="block mt-3">All in one clean, shareable link you can send to brands, clients, or recruiters.</span>
      </>
    ),
  },
  {
    q: 'How is Creasume different from a normal resume or portfolio?',
    a: 'A resume is static and a portfolio is manual. Creasume pulls live, verified stats from your social accounts and builds a profile that updates itself — so brands always see your current reach, not a screenshot from months ago.',
  },
  {
    q: 'Is my data safe on Creasume?',
    a: 'Yes. Your data is provided directly through official Meta APIs with view-only access to your public statistics. We never post on your behalf and never share your personal data with third parties.',
  },
  {
    q: 'What data does Creasume access?',
    a: 'Only the public-facing metrics you consent to share — follower counts, reach, engagement and your published content. We do not access private messages, passwords, or anything you have not approved.',
  },
  {
    q: 'How does Creasume help me get brand deals?',
    a: 'Creasume packages your numbers into a brand-ready media kit and surfaces you to brands actively looking for creators. Structured inquiry requests replace messy DMs, so collaborations move faster.',
  },
  {
    q: 'Will brands be able to discover me on Creasume?',
    a: 'Yes. Verified creator profiles are discoverable by brands browsing for partners in your niche, giving you visibility you would not get from a private feed alone.',
  },
]

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <motion.div variants={fadeUp} className="border-b border-white/12 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 text-left py-5 md:py-6 px-3 -mx-3 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-white/3"
      >
        <span className="text-white font-medium text-base md:text-lg pr-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {item.q}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 text-white/70 transition-transform duration-350"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="pb-6 text-sm md:text-base text-white/70 leading-relaxed pr-8"
              style={{ fontFamily: "'Gelion', 'Outfit', sans-serif" }}
            >
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Faq() {
  // First item open by default to match the design's expanded state.
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-16 md:py-28 overflow-hidden">
      <div className="text-center mb-12 md:mb-20 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-5" style={{ color: '#FFFFFF' }}>
          Frequently Asked Questions
        </h2>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Got questions? We've got answers. Find everything you need to know about using our platform, plans, and features.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Soft ambient glows behind the panel */}
        <img src="/Ellipse%20883.png" alt="" aria-hidden="true" className="absolute -left-24 top-4 h-[420px] w-[260px] opacity-70 pointer-events-none select-none" />
        <img src="/Ellipse%20883.png" alt="" aria-hidden="true" className="absolute -right-24 bottom-4 h-[420px] w-[260px] opacity-70 pointer-events-none select-none" />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="relative z-10 rounded-[28px] px-6 md:px-10 py-2 md:py-4"
          style={{
            background: 'rgba(10, 12, 28, 0.72)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 90px rgba(0,0,0,0.5)',
          }}
        >
          {FAQS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

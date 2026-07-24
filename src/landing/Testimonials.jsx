import { motion } from 'framer-motion'
import { formatCount } from '../services/influenceApi.js'
import { goToPath } from '../router.js'

const PLACEHOLDERS = Array.from({ length: 6 })
const MARQUEE_MIN = 5

function CreatorPlaceholder() {
  return (
    <div className="shrink-0 w-63 md:w-72 h-105 md:h-120 rounded-3xl mx-3 overflow-hidden border border-white/8 bg-white/5 animate-pulse">
      <div className="h-full bg-linear-to-b from-white/4 to-white/10" />
    </div>
  )
}

function CreatorCard({ creator }) {
  const username = creator.username || String(creator.handle || '').replace(/^@+/, '')
  const name = creator.name || username
  const score = Number.isFinite(Number(creator.score)) ? Math.round(Number(creator.score)) : null
  const followers = formatCount(creator.followers)
  const href = `/preview?lookup=${encodeURIComponent(username)}`

  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        goToPath(href)
      }}
      aria-label={`Open ${name}'s Influence Card`}
      className="group relative shrink-0 w-63 md:w-72 h-105 md:h-120 rounded-3xl mx-3 overflow-hidden border border-white/12 bg-[#12131a] text-white no-underline shadow-[0_18px_50px_rgba(0,0,0,.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d96ff]"
    >
      {creator.profilePicture ? (
        <img
          src={creator.profilePicture}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-[#36377a] to-[#111225] text-7xl font-semibold text-white/70">
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-b from-black/55 via-transparent to-black/85" />

      {creator.isFoundingCreator && (
        <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] backdrop-blur-md">
          Founding Creator
        </span>
      )}

      {score != null && (
        <div className="absolute right-3 top-3 flex h-11 w-11 flex-col items-center justify-center rounded-full border border-white/25 bg-black/50 leading-none backdrop-blur-md">
          <strong className="text-sm">{score}</strong>
          <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[.08em] text-white/70">Score</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="truncate text-xl font-bold">{name}</p>
        <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
          <span className="truncate">@{username}</span>
          {followers && (
            <>
              <span aria-hidden="true">•</span>
              <span className="shrink-0">{followers} followers</span>
            </>
          )}
        </div>
      </div>
    </a>
  )
}

export default function Testimonials({ items = [] }) {
  const hasCreators = items.length > 0
  const cards = hasCreators ? items : PLACEHOLDERS
  const useMarquee = !hasCreators || items.length >= MARQUEE_MIN

  const row = (hidden) => (
    <div className="flex shrink-0" aria-hidden={hidden}>
      {cards.map((creator, index) => (
        hasCreators
          ? <CreatorCard key={creator._id || creator.username || index} creator={creator} />
          : <CreatorPlaceholder key={index} />
      ))}
    </div>
  )

  return (
    <section className="relative z-10 overflow-hidden py-16 md:py-24">
      <div className="relative z-10 mb-12 px-6 text-center md:mb-16">
        <h2 className="mb-4 text-4xl font-bold md:text-5xl">Meet Our Founding Creators</h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
          Discover the creators building their professional identity with Creasume.
        </p>
      </div>

      {useMarquee ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="lp-marquee-group flex w-full overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
            maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
          }}
        >
          <div className="lp-marquee" style={{ animationDuration: '44s' }}>
            {row(undefined)}
            {row(true)}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-wrap justify-center gap-y-6 px-6"
        >
          {items.map((creator, index) => (
            <CreatorCard key={creator._id || creator.username || index} creator={creator} />
          ))}
        </motion.div>
      )}
    </section>
  )
}

import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import SlidingTitle from '@/components/SlidingTitle'

const taglines = [
  "From kernel to cloud — understanding what actually runs the world.",
  "Simplicity isn't optional; it's the foundation of reliability.",
  "What I cannot create, I do not understand. — Richard Feynman",
  "Have the courage to play the fool today, so you can be the genius tomorrow.",
]

function NavCard({
  to,
  glyph,
  title,
  description,
}: {
  to: string
  glyph: string
  title: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="group relative block rounded-2xl border border-gray-200 dark:border-stone-800 bg-white/60 dark:bg-stone-950/60 backdrop-blur-sm p-6 hover:border-gray-300 dark:hover:border-stone-700 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-stone-950/50 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="text-3xl mb-3 transition-transform group-hover:scale-110">
        {glyph}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-stone-100 mb-1 font-sans">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-stone-400 leading-relaxed">
        {description}
      </p>
      <span className="absolute top-5 right-5 text-gray-400 dark:text-stone-500 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all">
        →
      </span>
    </Link>
  )
}

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Stupid Notes</title>
      </Helmet>

      {/* Full-page subtle gradient wash */}
      <div className="home-bg" aria-hidden="true">
        <div className="home-blob b1" />
        <div className="home-blob b2" />
      </div>

      {/* Hero */}
      <section className="relative px-5 sm:px-8 pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="home-fade-up text-xs font-mono uppercase tracking-[0.25em] text-green-700 dark:text-green-400 mb-6">
            stupidnotes.in
          </p>

          <h1
            className="home-fade-up text-2xl sm:text-3xl md:text-4xl font-bold not-italic font-sans text-gray-900 dark:text-stone-100 tracking-tight min-h-[5.5rem] sm:min-h-[6rem] md:min-h-[6.5rem] flex items-center justify-center"
            style={{ animationDelay: '120ms' }}
          >
            <SlidingTitle quotes={taglines} />
          </h1>

          <p
            className="home-fade-up mt-6 text-base sm:text-lg text-gray-600 dark:text-stone-400 font-sans max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: '240ms' }}
          >
            Just someone curious about how things work under the hood — writing
            deep dives on databases, systems, and the internals that run the world.
          </p>
        </div>
      </section>

      {/* Nav cards */}
      <section className="px-5 sm:px-8 mb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NavCard
            to="/articles"
            glyph="✎"
            title="Articles"
            description="Deep dives into databases, systems, and design."
          />
          <NavCard
            to="/resources"
            glyph="✦"
            title="Resources"
            description="A curated reading list — books, papers, courses."
          />
          <NavCard
            to="/about"
            glyph="☼"
            title="About"
            description="A bit about me and how to reach out."
          />
        </div>
      </section>
    </>
  )
}

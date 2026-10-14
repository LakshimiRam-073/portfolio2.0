import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// Single static tagline — no animation, fully present in prerendered HTML for SEO.
const tagline = 'From kernel to cloud — understanding what actually runs the world.'

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
      className="group relative block rounded-xl border border-neutral-800 bg-black p-6 hover:border-neutral-600 transition-colors duration-200"
    >
      <div className="text-3xl mb-3">
        {glyph}
      </div>
      <h3 className="text-lg font-semibold text-neutral-100 mb-1 font-sans">
        {title}
      </h3>
      <p className="text-sm text-neutral-400 leading-relaxed">
        {description}
      </p>
      <span className="absolute top-5 right-5 text-neutral-600 group-hover:text-neutral-200 transition-colors">
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
        <meta name="description" content="Deep dives on databases, systems, and the internals that run the world." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Stupid Notes" />
        <meta property="og:description" content="Deep dives on databases, systems, and the internals that run the world." />
        <meta property="og:url" content="https://stupidnotes.in/" />
        <meta property="og:image" content="https://stupidnotes.in/og-default.png" />
        <meta property="og:site_name" content="Stupid Notes" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stupid Notes" />
        <meta name="twitter:description" content="Deep dives on databases, systems, and the internals that run the world." />
        <meta name="twitter:image" content="https://stupidnotes.in/og-default.png" />
      </Helmet>

      {/* Hero */}
      <section className="relative px-5 sm:px-8 pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-500 mb-6">
            stupidnotes.in
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold not-italic font-sans text-neutral-100 tracking-tight">
            {tagline}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-400 font-sans max-w-xl mx-auto leading-relaxed">
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

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Typewriter from 'typewriter-effect'

const taglines = [
  "From kernel to cloud — understanding what actually runs the world.",
  "Simplicity isn't optional; it's the foundation of reliability.",
  "What I cannot create, I do not understand. — Richard Feynman",
  "Have the courage to play the fool today, so you can be the genius tomorrow.",
]

interface BlogMetadata {
  title: string
  date: string
  description?: string
}

interface BlogEntry {
  slug: string
  metadata: BlogMetadata
  readTime: number
}

interface BlogCategory {
  name: string
  path: string
  blogs: BlogEntry[]
  subcategories: BlogCategory[]
}

interface FlatArticle {
  blog: BlogEntry
  categoryName: string
  categoryPath: string
}

function flatten(cats: BlogCategory[]): FlatArticle[] {
  const out: FlatArticle[] = []
  const walk = (xs: BlogCategory[]) => {
    xs.forEach((c) => {
      if (c.name === 'assets') return
      c.blogs.forEach((b) =>
        out.push({ blog: b, categoryName: c.name, categoryPath: c.path }),
      )
      if (c.subcategories?.length) walk(c.subcategories)
    })
  }
  walk(cats)
  out.sort(
    (a, b) =>
      new Date(b.blog.metadata.date || 0).getTime() -
      new Date(a.blog.metadata.date || 0).getTime(),
  )
  return out
}

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
  const [recent, setRecent] = useState<FlatArticle[]>([])

  useEffect(() => {
    fetch('/data/categories.json')
      .then((r) => r.json())
      .then((d: BlogCategory[]) => setRecent(flatten(d).slice(0, 3)))
      .catch(() => {})
  }, [])

  return (
    <>
      <Helmet>
        <title>Stupid Notes</title>
      </Helmet>

      {/* Hero */}
      <section className="home-hero relative px-5 sm:px-8 pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="home-blob b1" aria-hidden="true" />
        <div className="home-blob b2" aria-hidden="true" />

        <div className="max-w-3xl mx-auto text-center relative">
          <p className="home-fade-up text-xs font-mono uppercase tracking-[0.25em] text-green-700 dark:text-green-400 mb-6">
            stupidnotes.in
          </p>

          <h1
            className="home-fade-up text-2xl sm:text-3xl md:text-4xl leading-relaxed font-light text-gray-800 dark:text-stone-200 tracking-wide font-display italic min-h-[5.5rem] sm:min-h-[6rem] md:min-h-[6.5rem] flex items-center justify-center"
            style={{ animationDelay: '120ms' }}
          >
            <Typewriter
              options={{
                strings: taglines,
                autoStart: true,
                loop: true,
                delay: 45,
                deleteSpeed: 25,
              }}
            />
          </h1>

          <p
            className="home-fade-up mt-6 text-base sm:text-lg text-gray-600 dark:text-stone-400 font-sans max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: '240ms' }}
          >
            Hi, I'm{' '}
            <span className="text-gray-900 dark:text-stone-100 font-medium">
              Lakshimi Raman S
            </span>{' '}
            — writing about databases, systems, and what actually runs the world.
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

      {/* Latest writing */}
      {recent.length > 0 && (
        <section className="px-5 sm:px-8 mb-24">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-gray-900 dark:text-stone-100">
                Latest writing
              </h2>
              <Link
                to="/articles"
                className="text-sm text-green-700 dark:text-green-400 hover:underline font-medium font-sans"
              >
                See all →
              </Link>
            </div>

            <ul className="divide-y divide-gray-200 dark:divide-stone-800">
              {recent.map((a) => (
                <li
                  key={`${a.categoryPath}/${a.blog.slug}`}
                  className="py-5 first:pt-0 last:pb-0"
                >
                  <Link
                    to={`/articles/${a.categoryPath}/${a.blog.slug}`}
                    className="group block"
                  >
                    <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-green-700 dark:text-green-400 mb-1.5 font-sans">
                      {a.categoryName.replace(/-/g, ' ')}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-stone-100 group-hover:text-gray-600 dark:group-hover:text-stone-300 transition-colors font-sans leading-snug">
                      {a.blog.metadata.title}
                    </h3>
                    {a.blog.metadata.description && (
                      <p className="text-sm text-gray-600 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {a.blog.metadata.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-stone-500 font-sans">
                      {a.blog.readTime} min read
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}

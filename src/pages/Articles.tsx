import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

interface BlogMetadata {
  title: string
  date: string
  description?: string
  author?: string
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

function flattenCategories(categories: BlogCategory[]): FlatArticle[] {
  const result: FlatArticle[] = []

  function extract(cats: BlogCategory[]) {
    cats.forEach((cat) => {
      if (cat.name === 'assets') return
      cat.blogs.forEach((blog) => {
        result.push({ blog, categoryName: cat.name, categoryPath: cat.path })
      })
      if (cat.subcategories?.length) extract(cat.subcategories)
    })
  }

  extract(categories)
  result.sort((a, b) => {
    const dateA = new Date(a.blog.metadata.date || 0).getTime()
    const dateB = new Date(b.blog.metadata.date || 0).getTime()
    return dateB - dateA
  })
  return result
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function ArticleCard({ article }: { article: FlatArticle }) {
  const { blog, categoryName, categoryPath } = article

  return (
    <article className="group py-8 first:pt-0">
      <Link to={`/articles/${categoryPath}/${blog.slug}`} className="block">
        <span className="inline-block text-xs font-medium uppercase tracking-wider text-neutral-300 mb-3 font-sans">
          {categoryName.replace(/-/g, ' ')}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-[#e6e6e6] mb-2 group-hover:text-neutral-400 transition-colors leading-tight font-sans">
          {blog.metadata.title}
        </h2>

        {blog.metadata.description && (
          <p className="text-base text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
            {blog.metadata.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-neutral-400 font-sans">
          {blog.metadata.date && (
            <time dateTime={blog.metadata.date}>{formatDate(blog.metadata.date)}</time>
          )}
          <span>·</span>
          <span>{blog.readTime} min read</span>
          {blog.metadata.author && (
            <>
              <span>·</span>
              <span>{blog.metadata.author}</span>
            </>
          )}
        </div>
      </Link>
    </article>
  )
}

export default function Articles() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/categories.json')
      .then((res) => res.json())
      .then((data: BlogCategory[]) => {
        setCategories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const allArticles = useMemo(() => flattenCategories(categories), [categories])

  const allCategoryNames = useMemo(() => {
    const names = new Set<string>()
    allArticles.forEach((a) => names.add(a.categoryName))
    return Array.from(names).sort()
  }, [allArticles])

  const filteredArticles = useMemo(() => {
    let result = allArticles

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((a) => {
        const title = a.blog.metadata.title.toLowerCase()
        const desc = (a.blog.metadata.description || '').toLowerCase()
        const category = a.categoryName.replace(/-/g, ' ').toLowerCase()
        return title.includes(q) || desc.includes(q) || category.includes(q)
      })
    }

    if (selectedCategory) {
      result = result.filter((a) => a.categoryName === selectedCategory)
    }

    return result
  }, [allArticles, searchQuery, selectedCategory])

  const hasActiveFilters = searchQuery.trim() || selectedCategory

  function clearFilters() {
    setSearchQuery('')
    setSelectedCategory(null)
  }

  return (
    <>
      <Helmet>
        <title>Articles | Stupid Notes</title>
        <meta name="description" content="Deep dives into databases, system design, and low-level engineering with my stupid drawings." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Stupid Notes" />
        <meta property="og:title" content="Articles | Stupid Notes" />
        <meta property="og:description" content="Deep dives into databases, system design, and low-level engineering with my stupid drawings." />
        <meta property="og:url" content="https://stupidnotes.in/articles" />
        <meta property="og:image" content="https://stupidnotes.in/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Articles | Stupid Notes" />
        <meta name="twitter:description" content="Deep dives into databases, system design, and low-level engineering with my stupid drawings." />
        <meta name="twitter:image" content="https://stupidnotes.in/og-default.png" />
      </Helmet>
      <div className="max-w-[1100px] w-full mx-auto px-8 py-12 md:py-16 max-md:px-6 max-sm:px-4">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-sans">Articles</h1>
          <p className="text-neutral-400 text-base font-sans">
            Deep dives into databases, system design, and low-level engineering with my stupid drawings.
          </p>
        </div>

        {/* Search & Topic Filter */}
        {!loading && allArticles.length > 0 && (
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search articles by title, description, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-[#e6e6e6] placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#444]/50 focus:border-[#555] transition-colors text-sm font-sans"
              />
            </div>

            {/* Topic Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-neutral-400 self-center mr-1 font-sans">
                Topics:
              </span>
              {allCategoryNames.map((name) => (
                <button
                  key={name}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === name ? null : name)
                  }
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors font-sans ${
                    selectedCategory === name
                      ? 'bg-[#e6e6e6] text-[#121212]'
                      : 'bg-[#1a1a1a] text-[#c4c4c4] hover:bg-[#242424]'
                  }`}
                >
                  {name.replace(/-/g, ' ')}
                </button>
              ))}
            </div>

            {/* Active Filter Status */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400 font-sans">
                  Showing {filteredArticles.length} of {allArticles.length} articles
                </p>
                <button
                  onClick={clearFilters}
                  className="text-sm text-neutral-300 hover:text-[#e6e6e6] hover:underline font-medium font-sans"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#333] border-t-[#e6e6e6] rounded-full animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 mb-4 text-lg">
              {hasActiveFilters
                ? 'No articles match your filters.'
                : 'No articles yet. Check back soon!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-neutral-300 hover:text-[#e6e6e6] hover:underline font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={`${article.categoryPath}/${article.blog.slug}`}
                article={article}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

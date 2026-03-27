import { useState, useEffect } from 'react'
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
        <span className="inline-block text-xs font-medium uppercase tracking-wider text-green-700 dark:text-green-400 mb-3 font-sans">
          {categoryName.replace(/-/g, ' ')}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-stone-100 mb-2 group-hover:text-gray-600 dark:group-hover:text-stone-300 transition-colors leading-tight font-sans">
          {blog.metadata.title}
        </h2>

        {blog.metadata.description && (
          <p className="text-base text-gray-600 dark:text-stone-400 mb-3 line-clamp-2 leading-relaxed">
            {blog.metadata.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-stone-500 font-sans">
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

  useEffect(() => {
    fetch('/data/categories.json')
      .then((res) => res.json())
      .then((data: BlogCategory[]) => {
        setCategories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const articles = flattenCategories(categories)

  return (
    <>
      <Helmet>
        <title>Articles | Stupid Notes</title>
        <meta name="description" content="Deep dives into databases, system design, and low-level engineering." />
      </Helmet>
      <div className="max-w-[1100px] w-full mx-auto px-8 py-12 md:py-16 max-md:px-6 max-sm:px-4">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-sans">Articles</h1>
          <p className="text-gray-500 dark:text-stone-400 text-base font-sans">
            Deep dives into databases, system design, and low-level engineering.
          </p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 dark:border-stone-600 border-t-gray-900 dark:border-t-stone-100 rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-stone-400 mb-4 text-lg">
              No articles yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-stone-800">
            {articles.map((article) => (
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

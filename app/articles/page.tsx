'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BlogCategory {
  name: string
  path: string
  blogs: any[]
  subcategories: BlogCategory[]
}

function BlogCategoryItem({ category, level = 0 }: { category: BlogCategory; level?: number }) {
  const [isOpen, setIsOpen] = useState(true)

  const hasSubcategories = category.subcategories.length > 0
  const hasBlogs = category.blogs.length > 0
  const isExpandable = hasSubcategories || hasBlogs

  return (
    <div className={level === 0 ? "mb-8" : "ml-6 mt-3"}>
      <div className="flex items-center gap-2">
        {isExpandable && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-gray-500 dark:text-stone-500 hover:text-gray-800 dark:hover:text-stone-200 transition-colors"
          >
            {isOpen ? "▾" : "▸"}
          </button>
        )}

        <h3
          className={
            level === 0
              ? "text-xl font-semibold text-gray-900 dark:text-stone-100"
              : "text-base text-gray-700 dark:text-stone-300"
          }
        >
          {category.name}
        </h3>
      </div>

      {isOpen && (
        <div className="mt-2">
          {hasBlogs && (
            <ul className="ml-6 space-y-1">
              {category.blogs.map((blog) => (
                <li key={blog.slug}>
                  <Link
                    href={`/articles/${category.path}/${blog.slug}`}
                    className="text-gray-700 dark:text-stone-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {blog.metadata.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasSubcategories && (
            <div className="mt-3">
                        {category.subcategories
            .filter((subcat) => subcat.name !== 'assets')
            .map((subcat) => (
                <BlogCategoryItem key={subcat.path} category={subcat} level={level + 1} />
            ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Articles() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="blog-container py-12">
      <div className="markdown">

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Articles</h1>
          <p className="text-gray-600 dark:text-stone-400">
            Explore my articles organized by topic. Click on a topic to expand and view articles.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 dark:text-stone-400">
            Loading articles...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-stone-400 mb-4">
              No articles yet. Check back soon!
            </p>
            <p className="text-sm text-gray-500 dark:text-stone-500">
              Articles appear automatically when added to the{" "}
              <code className="bg-gray-100 dark:bg-stone-800 px-2 py-1 rounded">
                blogs/
              </code>{" "}
              folder.
            </p>
          </div>
        ) : (
          <div>
            {categories
              .filter((category) => category.name !== "assets")
              .map((category) => (
                <BlogCategoryItem key={category.path} category={category} />
              ))}
          </div>
        )}

      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <div className="space-y-6">
        <div>
          <h1 className="text-6xl font-bold mb-2">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
        </div>

        <p className="text-gray-600 dark:text-stone-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-gray-900 dark:bg-stone-100 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-80 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/articles"
            className="px-6 py-2 bg-gray-200 dark:bg-stone-800 text-gray-900 dark:text-stone-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-stone-700 transition-colors"
          >
            View Articles
          </Link>
        </div>
      </div>
    </div>
  )
}

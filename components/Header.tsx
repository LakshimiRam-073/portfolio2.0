'use client'

import { useDarkMode } from '@/hooks/useDarkMode'
import Link from 'next/link'

export default function Header() {
  const { isDark, toggleDarkMode, mounted } = useDarkMode()

  return (
    <header>
      <nav className="px-6 py-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-lg font-medium text-gray-900 dark:text-stone-100 hover:opacity-70 transition-opacity"
        >
          stupid_notes.sh
        </Link>

        <div className="flex gap-5 items-center text-sm max-w-3xl">
          <Link
            href="/about"
            className="text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors"
          >
            About
          </Link>

          <Link
            href="/articles"
            className="text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors"
          >
            Articles
          </Link>

          {mounted && (
            <button
              onClick={toggleDarkMode}
              className="text-gray-500 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? '☀︎' : '☾'}
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}
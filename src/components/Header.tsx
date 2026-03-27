import { useDarkMode } from '@/hooks/useDarkMode'
import { Link } from 'react-router-dom'

export default function Header() {
  const { isDark, toggleDarkMode, mounted } = useDarkMode()

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-gray-100 dark:border-stone-800/50">
      <nav className="max-w-[1100px] w-full mx-auto px-8 py-4 flex justify-between items-center max-md:px-6 max-sm:px-4">
        <Link
          to="/"
          className="text-base font-medium text-gray-900 dark:text-stone-100 hover:opacity-70 transition-opacity font-sans"
        >
          stupidnotes.in
        </Link>

        <div className="flex gap-5 items-center text-sm font-sans">
          <Link
            to="/about"
            className="text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors"
          >
            About
          </Link>

          <Link
            to="/articles"
            className="text-gray-600 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors"
          >
            Articles
          </Link>

          {mounted && (
            <button
              onClick={toggleDarkMode}
              className="text-gray-500 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors p-1"
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

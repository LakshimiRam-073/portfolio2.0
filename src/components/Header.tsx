import { useDarkMode } from '@/hooks/useDarkMode'
import { Link } from 'react-router-dom'

export default function Header() {
  // Enforces dark-only theme on mount.
  useDarkMode()

  return (
    <header className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-md border-b border-[#222]">
      <nav className="max-w-[1100px] w-full mx-auto px-8 py-4 flex justify-between items-center max-md:px-6 max-sm:px-4">
        <Link
          to="/"
          className="text-base font-medium text-[#e6e6e6] hover:opacity-70 transition-opacity font-sans"
        >
          stupidnotes.in
        </Link>

        <div className="flex gap-5 items-center text-sm font-sans">
          <Link
            to="/about"
            className="text-neutral-400 hover:text-[#e6e6e6] transition-colors"
          >
            About
          </Link>

          <Link
            to="/articles"
            className="text-neutral-400 hover:text-[#e6e6e6] transition-colors"
          >
            Articles
          </Link>

          <Link
            to="/resources"
            className="text-neutral-400 hover:text-[#e6e6e6] transition-colors"
          >
            Resources
          </Link>

          <Link
            to="/ai-conduct"
            className="text-neutral-400 hover:text-[#e6e6e6] transition-colors"
          >
            AI Conduct
          </Link>
        </div>
      </nav>
    </header>
  )
}

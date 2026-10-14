import { useEffect } from 'react'

// Site is dark-only (true black, minimalist). The hook just enforces the
// `dark` class on <html> and clears any stale light-mode preference.
export function useDarkMode() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.removeItem('darkMode')
  }, [])

  return { isDark: true, toggleDarkMode: () => {}, mounted: true }
}

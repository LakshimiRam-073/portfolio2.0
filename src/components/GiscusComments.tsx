import Giscus from '@giscus/react'
import { useEffect, useState } from 'react'

export default function GiscusComments() {
  const [theme, setTheme] = useState<'light' | 'dark_dimmed'>('light')

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark_dimmed' : 'light')

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark')
      setTheme(dark ? 'dark_dimmed' : 'light')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="mt-16 pt-10 border-t border-gray-200 dark:border-stone-800">
      <h2 className="text-2xl font-bold mb-6 font-sans text-gray-900 dark:text-stone-100">
        Comments
      </h2>
      <Giscus
        repo="LakshimiRam-073/portfolio2.0"
        repoId="R_kgDORpPTlA"
        category="General"
        categoryId="DIC_kwDORpPTlM4C6UZb"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={theme}
        lang="en"
        loading="lazy"
      />
      <p className="mt-4 text-xs text-gray-400 dark:text-stone-600 text-center">
        Comments are powered by{' '}
        <a
          href="https://giscus.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600 dark:hover:text-stone-400"
        >
          Giscus
        </a>
        . Sign in with GitHub to leave a comment.
      </p>
    </div>
  )
}

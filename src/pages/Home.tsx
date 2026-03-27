import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const taglines = [
  "From kernel to cloud — understanding what actually runs the world.",
  "Simplicity isn't optional; it's the foundation of reliability.",
  "What I cannot create, I do not understand - Richard Feynman.",
  "Have the courage to play fool today, so you can be the Genius tomorrow.",
]

export default function Home() {
  const [tagline, setTagline] = useState('')

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * taglines.length)
    setTagline(taglines[randomIndex])
  }, [])

  return (
    <>
      <Helmet>
        <title>Stupid Notes</title>
      </Helmet>
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-5 sm:px-8">
        <div className="w-full max-w-3xl text-center space-y-10 md:space-y-12">
          <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed font-light text-gray-700 dark:text-gray-300 tracking-wide font-display italic">
            {tagline || 'Building reliable systems, one concept at a time.'}
          </p>
          <div className="flex justify-center gap-8 md:gap-12 text-base sm:text-lg">
            <Link
              to="/about"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 font-medium"
            >
              About
            </Link>
            <Link
              to="/articles"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 font-medium"
            >
              Articles
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

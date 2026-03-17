'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const taglines = [
  "Building systems that survive the 3 a.m. pager.",
  "Distributed systems, databases, and the quiet art of not breaking things.",
  "From kernel to cloud — understanding what actually runs the world.",
  "Simplicity isn't optional; it's the foundation of reliability.",
  "Code that humans can read — machines will figure it out anyway.",
  "Maintainable code is a love letter to future you (and your teammates).",
  "Debugging: twice as hard as writing — so write it right the first time.",
  "Events, streams, idempotency, and the joy of exactly-once semantics.",
  "Curious why distributed systems hurt — and how to make them hurt less.",
  "Performance isn't magic; it's measurement + ruthless deletion.",
  "Talk is cheap. Show me the logs. — (updated Linus Torvalds remix)",
  "Complexity sells. Simplicity wins in production.",
  "Abstractions should leak slowly — if they leak at all.",
];

export default function Home() {
  const [tagline, setTagline] = useState('')

  useEffect(() => {
    // Pick one random tagline once (client-side only)
    const randomIndex = Math.floor(Math.random() * taglines.length)
    setTagline(taglines[randomIndex])
  }, [])

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-5 sm:px-8">
      <div className="w-full max-w-3xl text-center space-y-10 md:space-y-12">

        <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed font-light text-gray-700 dark:text-gray-300 tracking-wide">
          {tagline || 'Building reliable systems, one concept at a time.'}
        </p>

        <div className="flex justify-center gap-8 md:gap-12 text-base sm:text-lg">
          <Link
            href="/about"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 font-medium"
          >
            About
          </Link>

          <Link
            href="/articles"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 font-medium"
          >
            Articles
          </Link>
        </div>

      </div>
    </div>
  )
}
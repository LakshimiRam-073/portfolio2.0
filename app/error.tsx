'use client'

import React from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-600 dark:text-stone-400">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-gray-900 dark:bg-stone-100 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-80 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

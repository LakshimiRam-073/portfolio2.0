'use client'

import Header from './Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-stone-950 text-gray-900 dark:text-stone-100">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-8">
          <div className="max-w-4xl mx-auto px-6 text-center text-gray-600 dark:text-stone-400 text-sm">
            <p>&copy; 2026. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

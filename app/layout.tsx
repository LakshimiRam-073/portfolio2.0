import type { Metadata, Viewport } from 'next'
import Header from '@/components/Header'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'My Portfolio',
  description: 'A minimalistic portfolio showcasing my blogs and projects.',
  authors: [{ name: 'Your Name' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-stone-950 text-gray-900 dark:text-stone-100 transition-colors duration-300">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-gray-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-8 mt-12">
          <div className="max-w-4xl mx-auto px-6 text-center text-gray-600 dark:text-stone-400 text-sm">
            <p>&copy; 2026. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

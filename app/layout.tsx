import type { Metadata, Viewport } from 'next'
import { Literata, Inter, IBM_Plex_Mono } from 'next/font/google'
import Header from '@/components/Header'
import '@/styles/globals.css'

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Stupid Notes',
    template: '%s | Stupid Notes',
  },
  description: 'Deep-dive technical articles on databases, system design, and low-level engineering.',
  authors: [{ name: 'Lakshimi Raman S' }],
  metadataBase: new URL('https://stupidnotes.in'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stupidnotes.in',
    siteName: 'Stupid Notes',
    title: 'Stupid Notes',
    description: 'Deep-dive technical articles on databases, system design, and low-level engineering.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stupid Notes',
    description: 'Deep-dive technical articles on databases, system design, and low-level engineering.',
  },
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
    <html lang="en" suppressHydrationWarning className={`${literata.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-white dark:bg-stone-950 text-gray-900 dark:text-stone-100 transition-colors duration-300 antialiased">
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

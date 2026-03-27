import { Routes, Route } from 'react-router-dom'
import Header from '@/components/Header'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Articles from '@/pages/Articles'
import ArticlePage from '@/pages/ArticlePage'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <div className="bg-white dark:bg-stone-950 text-gray-900 dark:text-stone-100 transition-colors duration-300 antialiased min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/*" element={<ArticlePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-600 dark:text-stone-400 text-sm">
          <p>&copy; 2026. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

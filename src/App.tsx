import { Routes, Route } from 'react-router-dom'
import Header from '@/components/Header'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Articles from '@/pages/Articles'
import ArticlePage from '@/pages/ArticlePage'
import Resources from '@/pages/Resources'
import AiConduct from '@/pages/AiConduct'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <div className="bg-[#121212] text-[#e6e6e6] antialiased min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/*" element={<ArticlePage />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/ai-conduct" element={<AiConduct />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-[#222] bg-[#121212] py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-neutral-500 text-sm">
          <p>&copy; 2026. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

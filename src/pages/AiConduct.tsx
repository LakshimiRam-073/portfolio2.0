import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function AiConduct() {
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/ai-conduct.json')
      .then((res) => res.json())
      .then((data: { htmlContent: string }) => {
        setHtmlContent(data.htmlContent)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet>
        <title>AI Code of Conduct | Stupid Notes</title>
        <meta
          name="description"
          content="How AI is and isn't used on this site: AI builds the website and generates ASCII art only; the writing and explanations are my own."
        />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Stupid Notes" />
        <meta property="og:title" content="AI Code of Conduct | Stupid Notes" />
        <meta
          property="og:description"
          content="How AI is and isn't used on this site: AI builds the website and generates ASCII art only; the writing and explanations are my own."
        />
        <meta property="og:url" content="https://stupidnotes.in/ai-conduct" />
        <meta property="og:image" content="https://stupidnotes.in/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Code of Conduct | Stupid Notes" />
        <meta
          name="twitter:description"
          content="How AI is and isn't used on this site: AI builds the website and generates ASCII art only; the writing and explanations are my own."
        />
        <meta name="twitter:image" content="https://stupidnotes.in/og-default.png" />
      </Helmet>
      <div className="blog-container min-h-screen py-12 md:py-16">
        <article className="markdown">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#333] border-t-[#e6e6e6] rounded-full animate-spin" />
            </div>
          ) : (
            <div
              className="prose prose-lg md:prose-xl prose-invert max-w-none prose-headings:font-bold"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}

          <div className="mt-12 pt-10 border-t border-[#2a2a2a]">
            <p className="text-neutral-400 text-lg">
              Back to{' '}
              <Link
                to="/about"
                className="text-neutral-300 hover:text-[#e6e6e6] hover:underline font-medium"
              >
                About
              </Link>
              {' '}or{' '}
              <Link
                to="/articles"
                className="text-neutral-300 hover:text-[#e6e6e6] hover:underline font-medium"
              >
                Articles →
              </Link>
            </p>
          </div>
        </article>
      </div>
    </>
  )
}

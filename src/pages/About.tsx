import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ResumeButton from '@/components/ResumeButton'

export default function About() {
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/about.json')
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
        <title>About Me | Stupid Notes</title>
        <meta name="description" content="Learn more about me, my skills, experience, and how to get in touch." />
      </Helmet>
      <div className="blog-container min-h-screen py-12 md:py-16">
        <article className="markdown">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 dark:border-stone-600 border-t-gray-900 dark:border-t-stone-100 rounded-full animate-spin" />
            </div>
          ) : (
            <div
              className="prose prose-lg md:prose-xl dark:prose-stone max-w-none prose-headings:font-bold"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}

          <div className="mt-12 pt-10 border-t border-gray-200 dark:border-stone-800">
            <p className="text-gray-600 dark:text-stone-400 text-lg">
              Want to read more technical thoughts?{' '}
              <Link
                to="/articles"
                className="text-green-700 dark:text-green-400 hover:underline font-medium"
              >
                Check out my articles →
              </Link>
            </p>
          </div>

          <div className="mt-16 p-6 md:p-8 bg-gray-50 dark:bg-stone-900/60 rounded-xl border border-gray-200 dark:border-stone-800">
            <h2 className="text-2xl font-bold mb-4">Download My Resume</h2>
            <p className="text-gray-600 dark:text-stone-400 mb-6 leading-relaxed">
              Curious about my professional background, projects, and skills in detail?
              Download my resume — I'd love the chance to work together.
            </p>
            <ResumeButton />
          </div>

          {/* Get in Touch */}
          <div className="mt-10 p-6 md:p-8 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900/50">
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-stone-100">
              Get in Touch
            </h2>
            <p className="text-gray-600 dark:text-stone-400 mb-6 leading-relaxed">
              Have a question, want to discuss a topic, or just want to say hello? Feel free to reach out — I'd love to hear from you.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:lakshimiramans@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-medium text-sm transition-colors no-underline font-sans"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send an Email
              </a>
              <p className="w-full mt-2 text-sm text-gray-500 dark:text-stone-400 font-mono">
                lakshimiramans@gmail.com
              </p>
              <a
                href="https://github.com/LakshimiRam-073"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-medium text-sm transition-colors no-underline font-sans"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/lakshimi-raman-s-b576b4240"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium text-sm transition-colors no-underline font-sans"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </article>
      </div>
    </>
  )
}

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
        </article>
      </div>
    </>
  )
}

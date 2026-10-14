import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ReadingProgress from '@/components/ReadingProgress'
import GiscusComments from '@/components/GiscusComments'

interface PostData {
  slug: string
  categoryPath: string
  categoryName: string
  metadata: {
    title: string
    date: string
    description?: string
    author?: string
  }
  htmlContent: string
  readTime: number
}

export default function ArticlePage() {
  const params = useParams()
  const splat = params['*'] || ''

  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!splat) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const parts = splat.split('/')
    const slug = parts.pop()
    const categoryPath = parts.join('/')

    if (!slug || !categoryPath) {
      setNotFound(true)
      setLoading(false)
      return
    }

    fetch(`/data/posts/${categoryPath}/${slug}.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data: PostData) => {
        setPost(data)
        setLoading(false)
        window.scrollTo(0, 0)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [splat])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#333] border-t-[#e6e6e6] rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="max-w-[680px] mx-auto px-5 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-neutral-400 mb-6">
          The article you're looking for doesn't exist.
        </p>
        <Link
          to="/articles"
          className="text-neutral-300 hover:text-[#e6e6e6] hover:underline font-medium"
        >
          ← Back to Articles
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.metadata.title} | Stupid Notes</title>
        {post.metadata.description && (
          <meta name="description" content={post.metadata.description} />
        )}
        <meta property="og:title" content={post.metadata.title} />
        {post.metadata.description && (
          <meta property="og:description" content={post.metadata.description} />
        )}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Stupid Notes" />
        <meta property="og:url" content={`https://stupidnotes.in/articles/${post.categoryPath}/${post.slug}`} />
        <meta property="og:image" content="https://stupidnotes.in/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metadata.title} />
        {post.metadata.description && (
          <meta name="twitter:description" content={post.metadata.description} />
        )}
        <meta name="twitter:image" content="https://stupidnotes.in/og-default.png" />
        {post.metadata.date && (
          <meta property="article:published_time" content={post.metadata.date} />
        )}
      </Helmet>
      <ReadingProgress />
      <div className="blog-container min-h-screen py-12 md:py-16">
        <article className="markdown">
          <div className="mb-10">
            <Link
              to="/articles"
              className="text-sm font-medium text-neutral-400 hover:text-[#e6e6e6] transition-colors inline-flex items-center gap-1.5 mb-6 font-sans no-underline"
            >
              ← Back to Articles
            </Link>

            {post.categoryName && (
              <span className="block text-xs font-medium uppercase tracking-wider text-neutral-300 mb-3 font-sans">
                {post.categoryName}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-[2.625rem] font-bold tracking-tight mb-4 leading-tight font-display text-[#e6e6e6]">
              {post.metadata.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 text-sm font-sans">
              {post.metadata.author && <span>{post.metadata.author}</span>}
              {post.metadata.date && (
                <>
                  <span>·</span>
                  <time dateTime={post.metadata.date}>
                    {new Date(post.metadata.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </>
              )}
              <span>·</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>

          {post.metadata.description && (
            <p className="text-lg md:text-xl leading-relaxed text-neutral-400 mb-10 border-l-[3px] border-[#2a2a2a] pl-5 py-1">
              {post.metadata.description}
            </p>
          )}

          <div
            className="max-w-none"
            dangerouslySetInnerHTML={{
              __html: post.htmlContent.replace(/<h1[^>]*>.*?<\/h1>/, ''),
            }}
          />

          {/* Comments */}
          <GiscusComments />

          <div className="mt-16 pt-10 border-t border-[#2a2a2a]">
            <Link
              to="/articles"
              className="text-sm font-medium text-neutral-400 hover:text-[#e6e6e6] transition-colors inline-flex items-center gap-1.5 font-sans no-underline"
            >
              ← Back to Articles
            </Link>
          </div>
        </article>
      </div>
    </>
  )
}

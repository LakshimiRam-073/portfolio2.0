import { notFound } from 'next/navigation'
import { getBlogPost, getCategoryStructure } from '@/lib/blogs'
import { markdownToHtml } from '@/lib/markdown'
import Link from 'next/link'
import ReadingProgress from '@/components/ReadingProgress'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    slug: string[]
  }
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params
  if (!slug || slug.length === 0) return {}

  const blogSlug = slug[slug.length - 1]
  const categoryPath = slug.slice(0, -1).join('/')
  const post = getBlogPost(blogSlug, categoryPath)

  if (!post) return {}

  return {
    title: post.metadata.title,
    description: post.metadata.description || `Read ${post.metadata.title} on Stupid Notes`,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description || `Read ${post.metadata.title} on Stupid Notes`,
      type: 'article',
      publishedTime: post.metadata.date,
      authors: post.metadata.author ? [post.metadata.author] : undefined,
    },
    twitter: {
      card: 'summary',
      title: post.metadata.title,
      description: post.metadata.description || `Read ${post.metadata.title} on Stupid Notes`,
    },
  }
}

export async function generateStaticParams() {
  try {
    const categories = getCategoryStructure()
    const params: { slug: string[] }[] = []

    function extractParams(cats: ReturnType<typeof getCategoryStructure>) {
      cats.forEach((cat) => {
        cat.blogs.forEach((blog) => {
          const pathParts = cat.path.split('/').filter(Boolean)
          params.push({
            slug: [...pathParts, blog.slug],
          })
        })
        if (cat.subcategories?.length > 0) {
          extractParams(cat.subcategories)
        }
      })
    }

    extractParams(categories)
    return params
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = params

  if (!slug || slug.length === 0) {
    notFound()
  }

  const blogSlug = slug[slug.length - 1]
  const categoryPath = slug.slice(0, -1).join('/')

  const post = getBlogPost(blogSlug, categoryPath)

  if (!post) {
    notFound()
  }

  const htmlContent = await markdownToHtml(post.content)
  const readTime = calculateReadTime(post.content)
  const categoryName = categoryPath.split('/').pop() || ''

  return (
    <>
      <ReadingProgress />
      <div className="blog-container min-h-screen py-12 md:py-16">
        <article className="markdown">
          <div className="mb-10">
            <Link
              href="/articles"
              className="text-sm font-medium text-gray-500 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors inline-flex items-center gap-1.5 mb-6 font-sans no-underline"
            >
              ← Back to Articles
            </Link>

            {/* Category tag */}
            {categoryName && (
              <span className="block text-xs font-medium uppercase tracking-wider text-green-700 dark:text-green-400 mb-3 font-sans">
                {categoryName.replace(/-/g, ' ')}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-[2.625rem] font-bold tracking-tight mb-4 leading-tight font-sans text-gray-900 dark:text-stone-50">
              {post.metadata.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 dark:text-stone-400 text-sm font-sans">
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
              <span>{readTime} min read</span>
            </div>
          </div>

          {post.metadata.description && (
            <p className="text-lg md:text-xl leading-relaxed text-gray-600 dark:text-stone-300 mb-10 border-l-[3px] border-gray-200 dark:border-stone-700 pl-5 py-1">
              {post.metadata.description}
            </p>
          )}

          <div
            className="max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <div className="mt-16 pt-10 border-t border-gray-200 dark:border-stone-800">
            <Link
              href="/articles"
              className="text-sm font-medium text-gray-500 dark:text-stone-400 hover:text-gray-900 dark:hover:text-stone-100 transition-colors inline-flex items-center gap-1.5 font-sans no-underline"
            >
              ← Back to Articles
            </Link>
          </div>
        </article>
      </div>
    </>
  )
}
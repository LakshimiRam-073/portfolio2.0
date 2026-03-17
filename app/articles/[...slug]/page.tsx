import { notFound } from 'next/navigation'
import { getBlogPost, getCategoryStructure } from '@/lib/blogs'
import { markdownToHtml } from '@/lib/markdown'
import Link from 'next/link'

interface Params {
  params: {
    slug: string[]
  }
}

export async function generateStaticParams() {
  const categories = getCategoryStructure()
  const params: { slug: string[] }[] = []

  function extractParams(cats: any[]) {
    cats.forEach((cat) => {
      // blogs in this category
      cat.blogs.forEach((blog: any) => {
        const pathParts = cat.path
          .split('/')
          .filter(Boolean)
          .map((p: string) => encodeURIComponent(p))

        params.push({
          slug: [...pathParts, encodeURIComponent(blog.slug)],
        })
      })

      // recurse into subcategories
      if (cat.subcategories?.length > 0) {
        extractParams(cat.subcategories)
      }
    })
  }

  extractParams(categories)

  return params
}

export default async function BlogPost({ params }: { params: Params['params'] }) {
  const { slug } = params

  if (!slug || slug.length === 0) {
    notFound()
  }

  const decodedSlug = slug.map((s) => decodeURIComponent(s))
  const blogSlug = decodedSlug[decodedSlug.length - 1]
  const categoryPath = decodedSlug.slice(0, -1).join('/')

  const post = getBlogPost(blogSlug, categoryPath)

  if (!post) {
    notFound()
  }

  const htmlContent = await markdownToHtml(post.content)

  return (
    <div className="blog-container min-h-screen py-12 md:py-16">
      <article className="markdown">
        <div className="mb-10">
          <Link
            href="/articles"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium inline-flex items-center gap-1.5 mb-6"
          >
            ← Back to Articles
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {post.metadata.title}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 dark:text-stone-400 text-sm">
            {post.metadata.date && (
              <time dateTime={post.metadata.date}>
                {new Date(post.metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}

            {post.metadata.author && <span>· By {post.metadata.author}</span>}
          </div>
        </div>

        {post.metadata.description && (
          <p className="text-xl md:text-2xl leading-relaxed text-gray-700 dark:text-stone-300 mb-10 italic border-l-4 border-gray-300 dark:border-stone-600 pl-5 py-1">
            {post.metadata.description}
          </p>
        )}

        <div
          className="
            prose
            prose-lg md:prose-xl
            dark:prose-stone
            max-w-none
            prose-headings:font-bold
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-blockquote:border-l-gray-300 dark:prose-blockquote:border-l-stone-600
          "
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-stone-800">
          <Link
            href="/articles"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1.5"
          >
            ← Back to Articles
          </Link>
        </div>
      </article>
    </div>
  )
}
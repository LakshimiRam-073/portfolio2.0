import { getCategoryStructure } from '@/lib/blogs'
import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stupidnotes.in'
  
  const urls: string[] = [
    '/',
    '/about',
    '/articles',
  ]

  const categories = getCategoryStructure()
  
  function extractUrls(cats: any[], parentPath: string = '') {
    cats.forEach((cat) => {
      const fullPath = parentPath ? `${parentPath}/${cat.path.split('/').pop()}` : cat.path.split('/').pop()
      
      cat.blogs.forEach((blog: any) => {
        urls.push(`/articles/${fullPath}/${blog.slug}`)
      })

      if (cat.subcategories.length > 0) {
        extractUrls(cat.subcategories, fullPath)
      }
    })
  }

  extractUrls(categories)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`
    )
    .join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

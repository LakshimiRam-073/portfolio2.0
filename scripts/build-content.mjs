#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import { createHighlighter } from 'shiki'
import { visit } from 'unist-util-visit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOGS_DIR = path.join(ROOT, 'blogs')
const CONTENT_DIR = path.join(ROOT, 'content')
const DATA_DIR = path.join(ROOT, 'public', 'data')
const SITE_URL = 'https://stupidnotes.in'

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function calculateReadTime(content) {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

async function createProcessor() {
  const highlighter = await createHighlighter({
    themes: ['github-dark-dimmed'],
    langs: [
      'cpp', 'c', 'typescript', 'javascript', 'python', 'bash',
      'json', 'yaml', 'sql', 'rust', 'go', 'java', 'text',
      'shell', 'html', 'css', 'markdown', 'plaintext',
    ],
  })

  function rehypeShiki() {
    return (tree) => {
      visit(tree, 'element', (node, _index, parent) => {
        if (node.tagName === 'pre') {
          const codeNode = node.children?.[0]
          if (codeNode?.tagName !== 'code') return

          const code = codeNode.children?.[0]?.value || ''
          let lang = codeNode.properties?.className?.[0]?.replace('language-', '') || 'cpp'

          let html
          try {
            html = highlighter.codeToHtml(code, {
              lang,
              theme: 'github-dark-dimmed',
              transformers: [{
                pre(node) {
                  node.properties.class = 'code-block'
                },
              }],
            })
          } catch {
            html = highlighter.codeToHtml(code, {
              lang: 'text',
              theme: 'github-dark-dimmed',
              transformers: [{
                pre(node) {
                  node.properties.class = 'code-block'
                },
              }],
            })
          }

          parent.children[parent.children.indexOf(node)] = {
            type: 'raw',
            value: html,
          }
        }
      })
    }
  }

  return async function processMarkdown(markdown) {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeShiki)
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(markdown)
    return String(result)
  }
}

function getMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(
    (f) => f.endsWith('.md') && fs.statSync(path.join(dir, f)).isFile()
  )
}

function buildCategories(baseDir, relativePath = '') {
  const dir = relativePath ? path.join(baseDir, relativePath) : baseDir
  if (!fs.existsSync(dir)) return []

  const items = fs.readdirSync(dir)
  const categories = []

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const itemRelPath = relativePath ? `${relativePath}/${item}` : item

    if (fs.statSync(fullPath).isDirectory() && item !== 'assets') {
      const mdFiles = getMarkdownFiles(fullPath)
      const blogs = []

      for (const file of mdFiles) {
        const filePath = path.join(fullPath, file)
        const raw = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(raw)

        blogs.push({
          slug: file.replace(/\.md$/, ''),
          metadata: {
            title: data.title || file.replace(/\.md$/, ''),
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
            description: data.description || '',
            author: data.author || '',
          },
          content,
          readTime: calculateReadTime(content),
        })
      }

      blogs.sort((a, b) => {
        const dateA = new Date(a.metadata.date || 0).getTime()
        const dateB = new Date(b.metadata.date || 0).getTime()
        return dateB - dateA
      })

      const subcategories = buildCategories(baseDir, itemRelPath)

      categories.push({
        name: item,
        path: itemRelPath,
        blogs,
        subcategories,
      })
    }
  }

  return categories
}

async function build() {
  console.log('Building blog content...')

  const processMarkdown = await createProcessor()

  // Clean output
  if (fs.existsSync(DATA_DIR)) {
    fs.rmSync(DATA_DIR, { recursive: true })
  }
  ensureDir(DATA_DIR)
  ensureDir(path.join(DATA_DIR, 'posts'))

  // Build categories
  const categories = buildCategories(BLOGS_DIR)

  // Process each blog post
  const sitemapUrls = ['/', '/about', '/articles']

  async function processCategory(cat) {
    for (const blog of cat.blogs) {
      console.log(`  Processing: ${cat.path}/${blog.slug}`)

      const htmlContent = await processMarkdown(blog.content)

      const postDir = path.join(DATA_DIR, 'posts', ...cat.path.split('/'))
      ensureDir(postDir)

      const postData = {
        slug: blog.slug,
        categoryPath: cat.path,
        categoryName: cat.name.replace(/-/g, ' '),
        metadata: blog.metadata,
        htmlContent,
        readTime: blog.readTime,
      }

      fs.writeFileSync(
        path.join(postDir, `${blog.slug}.json`),
        JSON.stringify(postData)
      )

      sitemapUrls.push(`/articles/${cat.path}/${blog.slug}`)
    }

    for (const subcat of cat.subcategories) {
      await processCategory(subcat)
    }
  }

  for (const cat of categories) {
    await processCategory(cat)
  }

  // Strip content from categories for listing
  function stripContent(cats) {
    return cats.map((cat) => ({
      name: cat.name,
      path: cat.path,
      blogs: cat.blogs.map((b) => ({
        slug: b.slug,
        metadata: b.metadata,
        readTime: b.readTime,
      })),
      subcategories: stripContent(cat.subcategories),
    }))
  }

  fs.writeFileSync(
    path.join(DATA_DIR, 'categories.json'),
    JSON.stringify(stripContent(categories))
  )
  console.log('  categories.json written')

  // Process about page
  let aboutContent = '# About Me\n\nContent coming soon.'
  const aboutPath = path.join(CONTENT_DIR, 'about.md')
  if (fs.existsSync(aboutPath)) {
    aboutContent = fs.readFileSync(aboutPath, 'utf8')
  }
  const aboutHtml = await processMarkdown(aboutContent)
  fs.writeFileSync(
    path.join(DATA_DIR, 'about.json'),
    JSON.stringify({ htmlContent: aboutHtml })
  )
  console.log('  about.json written')

  // Generate sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (url) => `  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`

  fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), sitemap)
  console.log('  sitemap.xml written')

  console.log('Content build complete!')
}

build().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})

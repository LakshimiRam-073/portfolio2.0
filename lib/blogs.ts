import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOGS_DIRECTORY = path.join(process.cwd(), 'blogs')

export interface BlogMetadata {
  title: string
  date: string
  description?: string
  [key: string]: any
}

export interface BlogPost {
  slug: string
  metadata: BlogMetadata
  content: string
  path: string
}

export interface BlogCategory {
  name: string
  path: string
  blogs: BlogPost[]
  subcategories: BlogCategory[]
}

function getAllFilesInDirectory(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  
  const files: string[] = []
  const items = fs.readdirSync(dir)

  items.forEach((item) => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    // Only add files that end with .md, NOT directories
    if (stat.isFile() && item.endsWith('.md')) {
      files.push(item)
    }
  })

  return files
}

export function getPosts(category: string = ''): BlogPost[] {
  let dir: string
  
  if (category === '') {
    dir = BLOGS_DIRECTORY
  } else {
    dir = path.join(BLOGS_DIRECTORY, category)
  }
  
  if (!fs.existsSync(dir)) {
    return []
  }

  const files = getAllFilesInDirectory(dir)

  return files
    .map((file) => {
      const fullPath = path.join(dir, file)
      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)
        
        return {
          slug: file.replace(/\.md$/, ''),
          metadata: data as BlogMetadata,
          content,
          path: category ? `${category}/${file}` : file,
        }
      } catch (error) {
        return null
      }
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => {
      const dateA = new Date(a.metadata.date || 0).getTime()
      const dateB = new Date(b.metadata.date || 0).getTime()
      return dateB - dateA
    })
}

export function getBlogPost(slug: string, category: string = ''): BlogPost | null {
  let dir: string
  
  if (category === '') {
    dir = BLOGS_DIRECTORY
  } else {
    dir = path.join(BLOGS_DIRECTORY, category)
  }
  
  const fullPath = path.join(dir, `${slug}.md`)

  console.log('getBlogPost debug:', {
    slug,
    category,
    lookingFor: fullPath,
    exists: fs.existsSync(fullPath),
  })

  if (!fs.existsSync(fullPath)) {
    // List files in directory for debugging
    try {
      const dirContents = fs.readdirSync(dir)
      console.log('Files in directory:', { dir, contents: dirContents })
    } catch (e) {
      console.log('Could not read directory:', dir, e)
    }
    return null
  }

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      metadata: data as BlogMetadata,
      content,
      path: category ? `${category}/${slug}` : slug,
    }
  } catch (error) {
    console.error('Error reading blog post:', error)
    return null
  }
}

export function getCategories(): string[] {
  if (!fs.existsSync(BLOGS_DIRECTORY)) return []

  const items = fs.readdirSync(BLOGS_DIRECTORY)
  
  return items.filter((item) => {
    const stat = fs.statSync(path.join(BLOGS_DIRECTORY, item))
    return stat.isDirectory()
  })
}

export function getCategoryStructure(baseDir: string = ''): BlogCategory[] {
  const dir = baseDir ? path.join(BLOGS_DIRECTORY, baseDir) : BLOGS_DIRECTORY
  
  if (!fs.existsSync(dir)) return []

  const items = fs.readdirSync(dir)
  const categories: BlogCategory[] = []

  items.forEach((item) => {
    const itemPath = baseDir ? `${baseDir}/${item}` : item
    const fullPath = path.join(BLOGS_DIRECTORY, itemPath)
    
    try {
      const stat = fs.statSync(fullPath)

      // Only process directories as categories
      if (stat.isDirectory()) {
        const blogs = getPosts(itemPath)
        const subcategories = getCategoryStructure(itemPath)

        categories.push({
          name: item,
          path: itemPath,
          blogs,
          subcategories,
        })
      }
    } catch (error) {
      // Skip items that can't be read
    }
  })

  return categories
}

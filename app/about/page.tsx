import Link from 'next/link'
import path from 'path'
import fs from 'fs/promises'          // better for async in app router
import ResumeButton from '@/components/ResumeButton'
import { markdownToHtml } from '@/lib/markdown'

export const metadata = {
  title: 'About Me',
  description: 'Learn more about me, my skills, experience, and how to get in touch.',
}

export default async function About() {
  // Try to read custom about.md — fallback to default content if missing
  let aboutContent = `# About Me

Hello! I'm a passionate developer who loves creating minimalistic and efficient solutions.

## Skills & Interests
- Web Development (Next.js, React, TypeScript, Tailwind)
- Full Stack Development (Node.js, databases, APIs)
- Open Source Contribution
- Technical Writing & Documentation

## Experience
With several years in software development, I've worked on projects ranging from small tools to production-scale systems — focusing on clean code, performance, and great user experience.

## Get in Touch
Feel free to reach out if you'd like to collaborate, discuss ideas, or just talk tech!

**Email:** harish@example.com  
**Twitter / X:** @yourhandle  
**LinkedIn:** linkedin.com/in/yourprofile  
**GitHub:** github.com/yourusername
`

  try {
    const aboutPath = path.join(process.cwd(), 'content', 'about.md')
    const fileContent = await fs.readFile(aboutPath, 'utf-8')
    if (fileContent.trim()) {
      aboutContent = fileContent
    }
  } catch (err) {
    // file doesn't exist or can't be read → use default content
    console.warn('Custom about.md not found, using fallback content')
  }

  const htmlContent = await markdownToHtml(aboutContent)

  return (
    <div className="blog-container min-h-screen py-12 md:py-16">
      <article className="markdown">
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

        <div className="mt-12 pt-10 border-t border-gray-200 dark:border-stone-800">
          <p className="text-gray-600 dark:text-stone-400 text-lg">
            Want to read more technical thoughts?{' '}
            <Link
              href="/articles"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Check out my articles →
            </Link>
          </p>
        </div>

        {/* Resume section */}
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
  )
}
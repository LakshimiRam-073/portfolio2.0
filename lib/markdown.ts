// lib/markdown.ts

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { createHighlighter } from 'shiki'
import rehypeRaw from 'rehype-raw'
import { visit } from 'unist-util-visit'

export async function markdownToHtml(markdown: string): Promise<string> {
  const highlighter = await createHighlighter({
    themes: ['github-dark-dimmed'],
    langs: ['cpp'],
  })

  // Custom plugin to replace code blocks
  function rehypeShiki() {
    return (tree: any) => {
      visit(tree, 'element', (node: any, _index: any, parent: any) => {
        if (node.tagName === 'pre') {
          const codeNode = node.children?.[0]
          if (codeNode?.tagName !== 'code') return

          const code = codeNode.children?.[0]?.value || ''
          const lang = codeNode.properties?.className?.[0]?.replace('language-', '') || 'cpp'

          const html = highlighter.codeToHtml(code, {
            lang,
            theme: 'github-dark-dimmed',
            transformers: [
              {
                pre(node: any) {
                  node.properties.class = 'code-block'
                },
              },
            ],
          })

          parent.children[parent.children.indexOf(node)] = {
            type: 'raw',
            value: html,
          }
        }
      })
    }
  }

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeShiki) // ✅ our custom highlighter
    .use(rehypeRaw as unknown as any)   // needed to render raw HTML
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}
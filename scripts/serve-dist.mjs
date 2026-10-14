#!/usr/bin/env node
/**
 * Static server for the built dist/ that mimics Vercel's clean-URL behavior,
 * so prerendered routes can be verified locally exactly as they'll serve in prod:
 *   /about        -> dist/about/index.html   (clean URL, no redirect)
 *   /about/       -> dist/about/index.html
 *   /x.png        -> dist/x.png              (real file)
 *   /unknown      -> dist/index.html         (SPA fallback)
 *
 * Usage: node scripts/serve-dist.mjs [port]
 */
import fs from 'fs'
import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist')
const PORT = Number(process.argv[2] || process.env.PORT || 4175)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
  '.map': 'application/json; charset=utf-8',
}

function send(res, filePath, code = 200) {
  const ext = path.extname(filePath)
  res.writeHead(code, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split('?')[0])

    // 1. Real file on disk.
    const direct = path.join(DIST, urlPath)
    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
      return send(res, direct)
    }

    // 2. Directory with an index.html (handles "/" and "/about/").
    const asDir = path.join(direct, 'index.html')
    if (fs.existsSync(asDir)) {
      return send(res, asDir)
    }

    // 3. Clean URL: /about -> dist/about/index.html.
    if (!path.extname(urlPath)) {
      const clean = path.join(DIST, urlPath, 'index.html')
      if (fs.existsSync(clean)) {
        return send(res, clean)
      }
      // 4. SPA fallback.
      return send(res, path.join(DIST, 'index.html'))
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end(String(err))
  }
})

server.listen(PORT, () => {
  console.log(`  dist served at http://localhost:${PORT}/ (clean URLs, Vercel-like)`)
})

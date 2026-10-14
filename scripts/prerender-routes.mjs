#!/usr/bin/env node
/**
 * Static prerenderer. Serves the built `dist/` locally, drives the system
 * Chrome via puppeteer-core to render each route (so react-helmet-async meta
 * tags + article/about markup land in the HTML), then writes the fully-rendered
 * HTML back to dist/<route>/index.html. Crawlers and link-unfurlers now see
 * real content without executing JS.
 *
 * Runs after `vite build`. Route list is derived from public/data/categories.json.
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import http from 'http'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const PORT = 45678

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean)

/**
 * Resolve a Chrome executable. Prefers a locally-installed browser (dev / macOS);
 * falls back to the @sparticuz/chromium binary bundled for headless Linux CI
 * (Vercel build image has no system Chrome). Returns { executablePath, extraArgs }.
 */
async function resolveChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return { executablePath: p, extraArgs: [] }
  }
  // No system browser — use the serverless chromium build.
  const { default: chromium } = await import('@sparticuz/chromium')
  const executablePath = await chromium.executablePath()
  if (!executablePath) {
    throw new Error(
      'No Chrome found and @sparticuz/chromium did not provide a binary. Set CHROME_PATH.'
    )
  }
  return { executablePath, extraArgs: chromium.args }
}

// puppeteer.launch() fails to handshake with recent Chrome on some macOS setups,
// so spawn Chrome ourselves with a debugging port and connect over the WS endpoint.
async function launchBrowser() {
  const { executablePath, extraArgs } = await resolveChrome()
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prerender-chrome-'))
  const baseArgs = [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
  ]
  // Merge serverless-chromium args (dedup), keep about:blank last.
  const merged = Array.from(new Set([...baseArgs, ...extraArgs])).filter(
    (a) => !a.startsWith('--user-data-dir') || a === `--user-data-dir=${userDataDir}`
  )
  const chrome = spawn(executablePath, [...merged, 'about:blank'], {
    stdio: ['ignore', 'ignore', 'pipe'],
  })

  return new Promise((resolve, reject) => {
    let buf = ''
    const timer = setTimeout(() => {
      chrome.kill()
      reject(new Error('Chrome did not expose a debugging endpoint in time'))
    }, 15000)

    chrome.stderr.on('data', async (d) => {
      buf += d.toString()
      const m = buf.match(/ws:\/\/[^\s]+/)
      if (!m) return
      clearTimeout(timer)
      try {
        const browser = await puppeteer.connect({ browserWSEndpoint: m[0] })
        resolve({ browser, chrome, userDataDir })
      } catch (err) {
        chrome.kill()
        reject(err)
      }
    })
    chrome.on('error', reject)
  })
}

const BASE_ROUTES = ['/', '/about', '/articles', '/resources']

function collectArticleRoutes() {
  const categoriesPath = path.join(DIST, 'data', 'categories.json')
  if (!fs.existsSync(categoriesPath)) {
    console.warn('  [prerender] categories.json not found — article routes skipped')
    return []
  }
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
  const routes = []
  const walk = (cats) => {
    for (const cat of cats) {
      if (cat.name === 'assets') continue
      for (const blog of cat.blogs || []) {
        routes.push(`/articles/${cat.path}/${blog.slug}`)
      }
      if (cat.subcategories?.length) walk(cat.subcategories)
    }
  }
  walk(categories)
  return routes
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
}

// Static server with SPA fallback (any unmatched non-file path -> index.html),
// so client-side routes resolve while the page boots.
function createServer() {
  return http.createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent(req.url.split('?')[0])
      let filePath = path.join(DIST, urlPath)

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html')
      }

      if (!fs.existsSync(filePath)) {
        const ext = path.extname(urlPath)
        if (ext) {
          res.writeHead(404)
          res.end('Not found')
          return
        }
        filePath = path.join(DIST, 'index.html') // SPA fallback
      }

      const ext = path.extname(filePath)
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      fs.createReadStream(filePath).pipe(res)
    } catch (err) {
      res.writeHead(500)
      res.end(String(err))
    }
  })
}

async function run() {
  if (!fs.existsSync(DIST)) {
    throw new Error('dist/ not found — run vite build first')
  }

  const routes = [...BASE_ROUTES, ...collectArticleRoutes()]
  console.log(`  [prerender] ${routes.length} routes`)

  const server = createServer()
  await new Promise((resolve) => server.listen(PORT, resolve))

  const { browser, chrome, userDataDir } = await launchBrowser()

  try {
    for (const route of routes) {
      const page = await browser.newPage()
      const url = `http://127.0.0.1:${PORT}${route}`
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
      // Ensure async content (about.json, post json) has rendered.
      await page
        .waitForFunction(
          "document.querySelector('#root') && document.querySelector('#root').children.length > 0",
          { timeout: 10000 }
        )
        .catch(() => {})

      const html = await page.content()

      const outDir =
        route === '/' ? DIST : path.join(DIST, ...route.split('/').filter(Boolean))
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, 'index.html'), html)
      console.log(`    ✓ ${route}`)
      await page.close()
    }
  } finally {
    await browser.disconnect()
    chrome.kill()
    server.close()
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true })
    } catch {}
  }

  console.log('  [prerender] done')
}

run().catch((err) => {
  console.error('  [prerender] failed:', err.message)
  process.exit(1)
})

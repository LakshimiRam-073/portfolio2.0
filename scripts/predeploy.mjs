#!/usr/bin/env node
/**
 * Sanity check before committing/pushing a deploy: confirms dist/ exists and
 * was built from the CURRENT source + content. Because Vercel serves the
 * committed dist/ as-is (no build step there), a stale dist/ would ship old
 * content. Run `npm run build` if this complains.
 *
 * Compares the newest mtime under source dirs against the newest under dist/.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const SOURCE_DIRS = ['src', 'content', 'blogs', 'Resources', 'scripts', 'public']
const SOURCE_FILES = ['index.html', 'vite.config.ts', 'tailwind.config.js', 'package.json']

function newestMtime(target) {
  let newest = 0
  const stat = fs.statSync(target)
  if (stat.isFile()) return stat.mtimeMs
  for (const entry of fs.readdirSync(target)) {
    const p = path.join(target, entry)
    if (entry === 'node_modules' || entry === '.git') continue
    const s = fs.statSync(p)
    const m = s.isDirectory() ? newestMtime(p) : s.mtimeMs
    if (m > newest) newest = m
  }
  return newest
}

if (!fs.existsSync(DIST)) {
  console.error('✗ dist/ missing. Run `npm run build` before deploying.')
  process.exit(1)
}

let newestSource = 0
for (const d of SOURCE_DIRS) {
  const p = path.join(ROOT, d)
  if (fs.existsSync(p)) newestSource = Math.max(newestSource, newestMtime(p))
}
for (const f of SOURCE_FILES) {
  const p = path.join(ROOT, f)
  if (fs.existsSync(p)) newestSource = Math.max(newestSource, fs.statSync(p).mtimeMs)
}

const newestDist = newestMtime(DIST)

if (newestSource > newestDist) {
  console.error(
    '✗ dist/ is older than source — a source or content file changed after the last build.\n' +
      '  Run `npm run build` and commit the updated dist/ before deploying.'
  )
  process.exit(1)
}

console.log('✓ dist/ is up to date with source.')

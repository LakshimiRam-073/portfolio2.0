# Copilot Instructions — portfolio2.0

## Project Overview

A **minimalistic personal portfolio and technical blog** built by **Lakshimi Raman S (AKA Harish Kumar)**. The site is deployed on **Vercel** as a static SPA and serves as a platform for publishing deep-dive technical articles on databases, system design, and low-level engineering topics.

**Live domain:** `stupidnotes.in`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 18** + **Vite 5** (SPA) |
| Language | **TypeScript** (strict mode) |
| Routing | **React Router v6** (client-side) |
| Styling | **Tailwind CSS 3** + custom CSS in `src/styles/globals.css` |
| Markdown | `gray-matter` (frontmatter) → `unified` / `remark` / `rehype` pipeline (build-time) |
| Syntax highlighting | **Shiki** (`github-dark-dimmed` theme) |
| Head management | **react-helmet-async** (dynamic titles, meta tags) |
| Animations | **Framer Motion**, **typewriter-effect** |
| Deployment | **Vercel** (static SPA with SPA rewrites) |
| Fonts | Manrope (body/sans), Playfair Display (headings/display), IBM Plex Mono (code) — loaded via Google Fonts `<link>` with `preconnect` |

---

## Directory Structure

```
.
├── index.html                  # SPA entry point (Google Fonts, mount div)
├── vite.config.ts              # Vite config with @/ path alias
├── tsconfig.json               # Strict TS, path alias @/* → ./src/*
├── tsconfig.node.json          # TS config for vite.config.ts
├── tailwind.config.js          # dark mode via 'class', custom font families
├── postcss.config.js           # Tailwind + autoprefixer
├── vercel.json                 # SPA rewrite: all routes → /index.html
├── package.json                # Scripts: dev, build, build:content, preview
│
├── scripts/
│   └── build-content.mjs       # Build-time markdown → JSON processor
│
├── src/
│   ├── main.tsx                # React entry (BrowserRouter, HelmetProvider)
│   ├── App.tsx                 # Route definitions + layout shell
│   ├── vite-env.d.ts           # Vite type declarations
│   ├── pages/
│   │   ├── Home.tsx            # Landing page — random tagline + nav
│   │   ├── About.tsx           # About page — fetches /data/about.json
│   │   ├── Articles.tsx        # Article listing — Medium-style cards
│   │   ├── ArticlePage.tsx     # Article detail — fetches /data/posts/...
│   │   └── NotFound.tsx        # 404 page
│   ├── components/
│   │   ├── Header.tsx          # Sticky header with nav + dark mode toggle
│   │   ├── ReadingProgress.tsx # Scroll-based reading progress bar
│   │   └── ResumeButton.tsx    # Client-side resume PDF download
│   ├── hooks/
│   │   └── useDarkMode.ts      # Dark mode hook (localStorage + class toggle)
│   └── styles/
│       └── globals.css         # Tailwind directives + full typography system
│
├── blogs/                      # Markdown blog posts (auto-discovered at build time)
│   ├── Database-Internals/
│   │   └── Chapter-1.md
│   ├── Inside-Internals/
│   │   └── mem-alloc.md
│   └── System-Design/
│       └── describing-load.md
│
├── content/
│   └── about.md                # About page content (markdown)
│
├── public/
│   ├── data/                   # Generated at build time by build-content.mjs
│   │   ├── categories.json     # Category tree with metadata (no HTML)
│   │   ├── about.json          # Rendered about page HTML
│   │   └── posts/              # Per-post JSON with rendered HTML
│   │       ├── Database-Internals/Chapter-1.json
│   │       ├── Inside-Internals/mem-alloc.json
│   │       └── System-Design/describing-load.json
│   ├── sitemap.xml             # Generated at build time
│   ├── assets/                 # Blog images
│   ├── robots.txt
│   └── resume-placeholder.txt
│
├── about_me_mod/               # Design mockups
└── article_mod/                # Design mockups
```

---

## Key Architectural Patterns

### Build-Time Content Pipeline

1. **Authors write** Markdown files in `blogs/<Category>/<slug>.md`.
2. Each `.md` file must have **YAML frontmatter**:
   ```yaml
   ---
   title: "Post Title"
   date: YYYY-MM-DD
   description: "Short description"
   author: "Author Name"
   ---
   ```
3. `npm run build:content` runs `scripts/build-content.mjs` which:
   - Reads all `.md` files recursively from `blogs/`.
   - Parses frontmatter with `gray-matter`.
   - Renders markdown → HTML via the `unified` pipeline with Shiki syntax highlighting.
   - Outputs `public/data/categories.json` (metadata only, no HTML).
   - Outputs `public/data/posts/<category>/<slug>.json` (full rendered HTML + metadata).
   - Renders `content/about.md` → `public/data/about.json`.
   - Generates `public/sitemap.xml` with all known URLs.
4. Read time is calculated at build time: `Math.ceil(wordCount / 200)` minutes.
5. The Shiki highlighter uses `github-dark-dimmed` theme; default language is `cpp`.

### Routing (React Router v6)

| Route | Component | Data Source |
|---|---|---|
| `/` | `Home.tsx` | Static (random tagline) |
| `/about` | `About.tsx` | Fetches `/data/about.json` |
| `/articles` | `Articles.tsx` | Fetches `/data/categories.json` |
| `/articles/*` | `ArticlePage.tsx` | Fetches `/data/posts/{category}/{slug}.json` |
| `*` | `NotFound.tsx` | Static |

### Fonts

- Loaded via Google Fonts `<link>` in `index.html` with `preconnect` for performance.
- `display=swap` prevents flash of invisible text.
- Referenced by direct name in CSS: `"Manrope"`, `"Playfair Display"`, `"IBM Plex Mono"`.

### Header

- Sticky with `backdrop-blur-md` and semi-transparent background for a frosted glass effect.
- Constrained to `max-w-[680px]` matching the content width.

### Article Pages (Medium-like)

- Content width: **max 1100px with 3rem padding** — text fills the centre of the screen generously.
- Images are centered and capped at 80% of the content width for visual focus.
- Fluid heading sizes using `clamp()` for smooth responsive scaling.
- Per-article `<Helmet>` for dynamic title and Open Graph meta tags.
- Reading progress bar at top of viewport.
- Read time displayed in article metadata.
- Category tag shown above the title.

### Article Listing

- Flat chronological list (sorted newest first) with Medium-style cards.
- Each card shows: category tag, title, description, date, read time, author.
- Categories are flattened from the tree structure client-side.

### Dark Mode

- Managed by `src/hooks/useDarkMode.ts` — toggles the `dark` class on `<html>`.
- Persisted in `localStorage` key `darkMode`.
- Falls back to `prefers-color-scheme: dark` media query on first visit.
- Tailwind is configured with `darkMode: 'class'`.

---

## Coding Conventions

### TypeScript
- **Strict mode** is enabled (`strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`).
- Use path alias `@/*` for imports (maps to `./src/*`).
- Interfaces are preferred for data shapes.

### Components
- All components are client-side React (no server components).
- Tailwind utility classes are used inline; avoid creating new CSS classes unless for markdown typography (`globals.css` handles `.markdown` styles).

### Styling
- Color palette: light mode uses warm grays (`gray-*`); dark mode uses `stone-*` tones.
- Body background: `#ffffff` (light), `#0c0a09` (dark) — set in `globals.css`.
- Body text color: `#292929` (light), `#d6d3d1` (dark) — Medium-like high contrast.
- Typography is heavily customized in `.markdown` CSS class for blog content rendering.
- Code blocks use `github-dark-dimmed` in dark mode and a light GitHub theme (`#f6f8fa`) in light mode.

### Blog Posts
- File naming: `<slug>.md` inside a category folder under `blogs/`.
- Category names are the folder names (displayed as-is in the UI).
- Folders named `assets` are filtered out from category listings.
- Images referenced in blog posts should be placed in `public/assets/`.
- Posts are sorted by `date` field (newest first).

---

## How to Add a New Blog Post

1. Create a new `.md` file in `blogs/<CategoryName>/` (create the folder if it's a new category).
2. Add YAML frontmatter with at least `title` and `date`.
3. Run `npm run build:content` to regenerate the data.
4. The post will appear on `/articles` — no code changes needed.

---

## Commands

```bash
npm run dev            # Build content + start Vite dev server
npm run build          # Build content + Vite production build → dist/
npm run build:content  # Only rebuild blog content (markdown → JSON)
npm run preview        # Preview the production build locally
npm run type-check     # TypeScript type checking (tsc --noEmit)
npm run format         # Prettier formatting
npm run clean          # Remove dist, node_modules, generated data
```

---

## Important Implementation Details

- **Blog content is pre-rendered at build time** — the SPA fetches static JSON files, not a live API. This makes page loads very fast.
- **SPA routing** — Vercel rewrites all non-file routes to `index.html`. React Router handles client-side routing.
- The `about` page fetches `public/data/about.json` which is generated from `content/about.md` at build time.
- `ResumeButton` triggers a client-side download of `/resume.pdf` from the `public/` directory.
- The sitemap is generated as a static XML file during `build:content`.
- **Bundle size**: ~62KB gzipped JS + ~4.4KB gzipped CSS.

---

## When Helping with This Codebase

- **New pages**: Add a new file in `src/pages/`, add a `<Route>` in `src/App.tsx`, use React Router `<Link>` for navigation.
- **New components**: Place in `src/components/`. Follow existing patterns — Tailwind inline classes, dark mode variants with `dark:` prefix.
- **Blog features**: The blog content pipeline is in `scripts/build-content.mjs`. Changes to markdown rendering go there. Changes to how content is displayed go in `src/pages/ArticlePage.tsx`.
- **Styling**: Prefer Tailwind utilities. For markdown-rendered content, update `.markdown` styles in `src/styles/globals.css`.
- **Avoid** introducing SSR frameworks, component libraries, or ORMs — the project is intentionally minimal.
- **Always** ensure dark mode compatibility when adding UI elements (use `dark:` Tailwind variants).
- **Always** maintain TypeScript strict mode compliance — no `any` types unless absolutely necessary.
- **Path alias**: Use `@/` for imports (e.g., `import Header from '@/components/Header'`).

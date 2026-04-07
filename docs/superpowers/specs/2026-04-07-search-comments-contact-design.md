# Search, Comments & Contact — Design Spec

## Problem

The portfolio blog needs three features:
1. **Search & filtering** — find articles by topic (category), tags, and text search
2. **Comment section** — readers can leave feedback on articles
3. **Contact section** — visitors can reach out via email from the About page

## Decisions

### Comments: Giscus (GitHub Discussions)
SQLite cannot persist on Vercel (ephemeral filesystem). Giscus is the standard for developer blogs:
- Free, no database to manage
- GitHub authentication (fits technical audience)
- Markdown support in comments
- Dark mode support
- Reactions and threaded replies
- Backed by GitHub Discussions (data lives in user's repo)

### Search: Client-side filtering
All article metadata is already loaded client-side from `categories.json`. With only a handful of posts, client-side search is fast and requires no backend.

### Contact: Styled mailto section
No third-party form service needed. A clean mailto link with a styled card on the About page.

---

## Feature 1: Search & Tag Filtering

### Frontmatter Changes
Add `tags` array to each blog post's YAML frontmatter:
```yaml
---
title: "Post Title"
date: 2026-03-21
description: "Description"
author: "Author"
tags: ["databases", "b-trees", "storage-engines"]
---
```

### Build Pipeline Changes (`scripts/build-content.mjs`)
- Extract `tags` from frontmatter (default to empty array)
- Include `tags` in `categories.json` blog entry metadata
- Include `tags` in individual post JSON files
- Collect all unique tags across all posts for the filter UI

### UI: Articles Page (`src/pages/Articles.tsx`)
- **Search bar** at top — filters by title, description, and tags (case-insensitive substring match)
- **Tag chips** below search — clickable pills showing all available tags; clicking toggles filter; multiple tags can be active (AND logic)
- **Category filter** — clickable category names from directory structure
- **Clear filters** button when any filter is active
- Real-time filtering as user types/clicks
- Show result count when filters are active

### Data Flow
```
categories.json → flatten posts → apply search text filter → apply tag filter → apply category filter → render
```

---

## Feature 2: Giscus Comments

### Component: `src/components/GiscusComments.tsx`
- Uses `@giscus/react` npm package
- Placed at bottom of `ArticlePage.tsx`, below article content
- Configuration:
  - `mapping: "pathname"` — each article URL maps to a GitHub Discussion
  - `reactionsEnabled: true`
  - `theme`: syncs with site dark mode (`light` / `dark_dimmed`)
  - `lang: "en"`
  - `loading: "lazy"` — only loads when scrolled into view

### Setup Required (documented in README)
1. Enable GitHub Discussions on the portfolio repo
2. Install Giscus GitHub App (https://github.com/apps/giscus)
3. Set repo details in the component (or env vars)

### Dark Mode Integration
- Listen to dark mode state from `useDarkMode` hook or observe the `dark` class on `<html>`
- Send `setConfig` message to Giscus iframe when theme changes

---

## Feature 3: Contact Section on About Page

### UI: About Page (`src/pages/About.tsx`)
- New "Get in Touch" section after the about content
- Styled card with:
  - Heading: "Get in Touch" or "Say Hello"
  - Brief text: "Have a question or want to discuss something? Feel free to reach out."
  - Email link with mailto: (styled as a button or prominent link)
  - Optional: GitHub/social links
- Responsive, dark mode compatible

### Content Source
- Email address added to `content/about.md` frontmatter or hardcoded in component
- Keep it simple — just a mailto link, no form submission service

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `blogs/**/*.md` | Add `tags` to frontmatter |
| `scripts/build-content.mjs` | Extract tags, include in output |
| `src/pages/Articles.tsx` | Add search bar, tag chips, category filter |
| `src/components/GiscusComments.tsx` | New — Giscus wrapper component |
| `src/pages/ArticlePage.tsx` | Add GiscusComments at bottom |
| `src/pages/About.tsx` | Add contact/mail section |
| `package.json` | Add `@giscus/react` dependency |

---

## Tags for Existing Posts

| Post | Tags |
|------|------|
| Database-Internals/Chapter-1 | databases, storage-engines, b-trees |
| Database-Internals/Chapter-2 | databases, storage-engines, data-structures |
| Database-Internals/Chapter-3 | databases, storage-engines, lsm-trees |
| Inside-Internals/mem-alloc | memory, systems-programming, c |
| System-Design/describing-load | system-design, scalability, performance |

import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'

interface ResourceItem {
  title: string
  url: string
  description: string
  source: string
}

interface ResourceCategory {
  name: string
  items: ResourceItem[]
}

interface ResourcesData {
  categories: ResourceCategory[]
  totalCount: number
}

function ExternalIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 inline-block opacity-60 group-hover:opacity-100 transition-opacity"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5h5m0 0v5m0-5L10 14m-5 0v5h14v-7"
      />
    </svg>
  )
}

function ResourceRow({ item }: { item: ResourceItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block py-3 px-4 -mx-4 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-900/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-stone-100 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors font-sans inline-flex items-center gap-1.5">
            <span>{item.title}</span>
            <ExternalIcon />
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 dark:text-stone-400 mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
        {item.source && (
          <span className="shrink-0 mt-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-stone-800 text-gray-600 dark:text-stone-400 border border-gray-200/60 dark:border-stone-700/60">
            {item.source}
          </span>
        )}
      </div>
    </a>
  )
}

export default function Resources() {
  const [data, setData] = useState<ResourcesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/data/resources.json')
      .then((r) => r.json())
      .then((d: ResourcesData) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data.categories
    return data.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) =>
            it.title.toLowerCase().includes(q) ||
            it.description.toLowerCase().includes(q) ||
            it.source.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [data, query])

  const totalShown = filtered.reduce((acc, c) => acc + c.items.length, 0)
  const isFiltering = query.trim().length > 0

  return (
    <>
      <Helmet>
        <title>Resources | Stupid Notes</title>
        <meta
          name="description"
          content="A curated reading list — books, papers, courses, and code worth your time."
        />
      </Helmet>
      <div className="max-w-[1100px] w-full mx-auto px-8 py-12 md:py-16 max-md:px-6 max-sm:px-4">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-sans">Resources</h1>
          <p className="text-gray-500 dark:text-stone-400 text-base font-sans">
            A curated reading list — books, papers, courses, and code worth your time.
          </p>
        </div>

        {!loading && data && data.totalCount > 0 && (
          <div className="mb-8">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-stone-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search resources by title, source, or topic..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-gray-900 dark:text-stone-100 placeholder-gray-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 dark:focus:border-green-400 transition-colors text-sm font-sans"
              />
            </div>
            {isFiltering && (
              <p className="mt-3 text-sm text-gray-500 dark:text-stone-400 font-sans">
                Showing {totalShown} of {data.totalCount} resources
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 dark:border-stone-600 border-t-gray-900 dark:border-t-stone-100 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-stone-400 text-lg">
              {isFiltering ? 'No resources match your search.' : 'No resources yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cat, idx) => (
              <details
                key={cat.name}
                open={isFiltering || idx === 0}
                className="group rounded-xl border border-gray-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer select-none px-5 py-4 hover:bg-gray-50 dark:hover:bg-stone-900/60 transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold font-sans text-gray-900 dark:text-stone-100">
                      {cat.name}
                    </h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-stone-800 text-gray-600 dark:text-stone-400">
                      {cat.items.length}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-stone-400 transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-3 border-t border-gray-100 dark:border-stone-800/60">
                  {cat.items.map((item) => (
                    <ResourceRow key={item.url} item={item} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

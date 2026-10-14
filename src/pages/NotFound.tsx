import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Stupid Notes</title>
      </Helmet>
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="space-y-6">
          <div>
            <h1 className="text-6xl font-bold mb-2">404</h1>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
          </div>
          <p className="text-neutral-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-2 bg-neutral-100 text-black rounded-lg font-semibold hover:bg-white transition-colors"
            >
              Go Home
            </Link>
            <Link
              to="/articles"
              className="px-6 py-2 bg-neutral-900 text-neutral-100 border border-neutral-800 rounded-lg font-semibold hover:bg-neutral-800 hover:border-neutral-700 transition-colors"
            >
              View Articles
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

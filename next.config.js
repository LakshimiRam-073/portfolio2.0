/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  staticPageGenerationTimeout: 60,
  output: 'standalone',
}

module.exports = nextConfig

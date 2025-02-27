/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/snippet-manager',
  images: { unoptimized: true },
  // This is important for GitHub Pages
  assetPrefix: '/snippet-manager/',
}

module.exports = nextConfig
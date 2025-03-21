/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Creates static HTML/CSS/JS files
  images: {
    unoptimized: true,  // Required for static export
  },
  // Add this if your repo isn't at the root domain (e.g., username.github.io/repo-name)
  basePath: process.env.NODE_ENV === 'production' ? '/snippet-manager' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/snippet-manager/' : '',
  // Fix trailing slash issues that can occur with GitHub Pages
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

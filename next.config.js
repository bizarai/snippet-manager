/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Creates static HTML/CSS/JS files
  images: {
    unoptimized: true,  // Required for static export
  },
  // Dynamically set basePath and assetPrefix based on repository name
  basePath: process.env.NODE_ENV === 'production' ? '/snippet-manager' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/snippet-manager/' : '',
  // Keep trailing slash consistent to avoid redirect issues on GitHub Pages
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Static HTML export
  basePath: '/snippet-manager', // Replace with your actual repo name
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

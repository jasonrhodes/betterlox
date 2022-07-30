const { config } = require('process')

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ratings',
        permanent: true,
      },
    ]
  },
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org'],
  },
  webpack: (config) => {
    config.resolve = {
      ...(config.resolve || {}),
      fallback: {
          ...(config.resolve?.fallback || {}),
          'react/jsx-runtime': 'react/jsx-runtime.js',
          'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
      },
    };
    return config;
  }
}

module.exports = nextConfig
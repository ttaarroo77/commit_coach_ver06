/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing code ...
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        aggregateTimeout: 300,
        poll: 1000,
      }
    }
    return config
  },
  experimental: {
    // ... existing code ...
    chunkLoadTimeout: 10000, // 10秒に延長
  }
}

module.exports = nextConfig 
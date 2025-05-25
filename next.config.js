/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/thumbnails/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/thumbnails/:path*',
        destination: 'http://localhost:3000/thumbnails/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 
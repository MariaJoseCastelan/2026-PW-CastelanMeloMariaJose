/** @type {import('next').NextConfig} */
const MINI_SERVIDOR_URL = 'http://localhost:3306';
const BACKEND_URL = 'http://localhost:3306';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/mini/:path*', destination: `${MINI_SERVIDOR_URL}/:path*` },
      {source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*`},
    ];
  },
};

export default nextConfig;
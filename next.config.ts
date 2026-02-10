import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'profootball.srv883830.hstgr.cloud',
      },
    ],
  },
};

export default nextConfig;

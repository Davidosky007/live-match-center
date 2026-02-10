/** @type {import('next').NextConfig} */
const nextConfig = {
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

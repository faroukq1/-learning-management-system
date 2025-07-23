import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'learning-management-system.fly.storage.tigris.dev',
        port: '',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;

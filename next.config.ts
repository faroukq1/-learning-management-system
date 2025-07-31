import type { NextConfig } from 'next';

const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'learning-management-system.fly.storage.tigris.dev',
        port: '',
        protocol: 'https',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

export default nextConfig;

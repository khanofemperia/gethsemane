/** @type {import('next').NextConfig} */

import config from "./src/lib/config.js";

const nextConfig = {
  images: {
    remotePatterns: config.REMOTE_PATTERNS,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
      allowedForwardedHosts: ["localhost:3000"],
    },
  },
};

export default nextConfig;

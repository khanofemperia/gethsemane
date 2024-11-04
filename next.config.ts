/** @type {import('next').NextConfig} */

import config from "./src/lib/config.js";

const nextConfig = {
  images: {
    remotePatterns: config.REMOTE_PATTERNS,
  }
};

export default nextConfig;

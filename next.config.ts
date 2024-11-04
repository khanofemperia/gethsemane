/** @type {import('next').NextConfig} */

const config = require("./src/lib/config.js");

const nextConfig = {
  images: {
    remotePatterns: config.REMOTE_PATTERNS,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  // Optimize for production
  compress: true,

  // Configure images for production
  images: {
    unoptimized: true, // Required for static export or Cloud Run
  },

  // Environment variables
  env: {
    //CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;

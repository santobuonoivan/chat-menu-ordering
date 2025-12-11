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

  // API Rewrites for CORS bypass
  async rewrites() {
    return {
      beforeFiles: [
        // Core API
        {
          source: "/api-core/:path*",
          destination: `${process.env.NEXT_PUBLIC_URL_CORE_API}/:path*`,
        },
        // Delivery API
        {
          source: "/api-delivery/:path*",
          destination: `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/:path*`,
        },
        // Duck API
        {
          source: "/api-duck/:path*",
          destination: `${process.env.NEXT_PUBLIC_DUCK_API_URL}/:path*`,
        },
        // Main Backend API
        {
          source: "/api-main/:path*",
          destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;

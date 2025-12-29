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

  env: {
    ABLY_API_KEY: process.env.ABLY_API_KEY || "",
    BACKEND_URL: process.env.BACKEND_URL || "",
    API_KEY: process.env.API_KEY || "",
    URL_CORE_API: process.env.URL_CORE_API || "",
    CORE_API_KEY: process.env.CORE_API_KEY || "",
    WEBHOOK_URL: process.env.WEBHOOK_URL || "",
    URL_API_BACKEND: process.env.URL_API_BACKEND || "",
    KEY_API_BACKEND: process.env.KEY_API_BACKEND || "",
    DUCK_API_URL: process.env.DUCK_API_URL || "",
    RECIPE_UUID: process.env.RECIPE_UUID || "",
    TOKEN: process.env.TOKEN || "",
    TIMEOUT: process.env.TIMEOUT || "30000",
    DUCK_API_TIMEOUT: process.env.DUCK_API_TIMEOUT || "10000",
  },
  // Configuración de variables de entorno
  // NO usar  para datos sensibles
  // Las env vars se cargan automáticamente desde Cloud Run en runtime
  experimental: {
    // Permite que las env vars se lean en runtime desde el servidor
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

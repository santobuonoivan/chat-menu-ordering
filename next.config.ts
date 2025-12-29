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

  // Variables de entorno se leen en RUNTIME desde el proceso/contenedor
  // NO usar la propiedad env: {} porque embebe valores en BUILD time
  // Para standalone output, las env vars deben estar disponibles en runtime
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

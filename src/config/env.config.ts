/**
 * Server-side environment variables
 * Estas variables solo están disponibles en el servidor (API routes, server components)
 * NO están expuestas al navegador
 *
 * IMPORTANTE: Usar getServerEnv() en lugar de acceder directamente a serverEnv
 * para asegurar que las variables se lean en runtime, no en build time
 */

// Función para obtener variables de entorno en runtime
export const getServerEnv = () => {
  const env = {
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
    TIMEOUT: parseInt(process.env.TIMEOUT || "30000"),
    DUCK_API_TIMEOUT: parseInt(process.env.DUCK_API_TIMEOUT || "10000"),
  };

  // Debug logging si está habilitado
  if (process.env.DEBUG_ENV === "true") {
    console.log("🔍 Environment variables status:", {
      ABLY_API_KEY: env.ABLY_API_KEY ? "✅ Set" : "❌ Missing",
      BACKEND_URL: env.BACKEND_URL ? "✅ Set" : "❌ Missing",
      API_KEY: env.API_KEY ? "✅ Set" : "❌ Missing",
      URL_CORE_API: env.URL_CORE_API ? "✅ Set" : "❌ Missing",
      CORE_API_KEY: env.CORE_API_KEY ? "✅ Set" : "❌ Missing",
    });
  }

  return env;
};

// Para compatibilidad con código existente (DEPRECATED - usar getServerEnv())
export const serverEnv = getServerEnv();

/**
 * Client-side environment variables
 * Solo incluir aquí variables que DEBEN ser públicas en el navegador
 * NUNCA incluir API keys, tokens, o datos sensibles
 */
export const publicEnv = {
  // Ejemplo: URL pública de la aplicación
  // APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
} as const;

// Validación básica en desarrollo
if (process.env.NODE_ENV === "development") {
  const env = getServerEnv();
  const requiredEnvs = ["ABLY_API_KEY", "BACKEND_URL", "API_KEY"] as const;

  const missing = requiredEnvs.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`);
  }
}

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Kurobe",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    description: "Advanced analytics platform with real-time insights and AI-powered reporting",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    charts: process.env.NEXT_PUBLIC_ENABLE_CHARTS === "true",
    realtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME === "true",
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFilesPerUpload: 5,
    queryTimeout: 30000, // 30 seconds
  },
} as const;

export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";
export const isTest = process.env.NODE_ENV === "test";

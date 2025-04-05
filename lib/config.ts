// lib/config.ts

const APP_NAME = "APD LABS"

const config = {
  appName: APP_NAME,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api", // Example, adjust as needed
}

export default config


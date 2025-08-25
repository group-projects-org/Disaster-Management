import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Disaster Management App",
        short_name: "DisasterApp",
        start_url: "/",
        display: "standalone",
        theme_color: "#007BFF",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
        navigateFallback: "/sos",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/disaster-app\.com\/api\/sos$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "sos-api-cache",
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // Use IPv4 explicitly: on Windows, `localhost` can try both ::1 and
        // 127.0.0.1, which makes a stopped API appear as an AggregateError.
        target: process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.2.103:8075",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

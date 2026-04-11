import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  logLevel: 'silent',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false
    },
  }
});

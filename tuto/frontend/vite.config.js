import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      clientPort: 5173,
    },
  },
})

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//  base: "/",
//  plugins: [react()],
//  preview: {
//   port: 8080,
//   strictPort: true,
//  },
//  server: {
//   port: 8080,
//   strictPort: true,
//   host: true,
//   origin: "http://0.0.0.0:8080",
//  },
// });

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


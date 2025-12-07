import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for React + Tailwind
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // final build folder (important for Docker + FastAPI)
  },
  server: {
    port: 5173, // default dev port (optional)
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces for Railway
    port: parseInt(process.env.PORT || '3000'), // Use Railway's PORT
    strictPort: false, // Allow fallback if port is taken
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000'),
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Expose environment variables to client
  // Use import.meta.env.VARIABLE_NAME in code
  envDir: '.',
})

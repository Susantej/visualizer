
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    allowedHosts: [
      '214e7af7-40ae-4410-be5c-a43ccb2af213.lovableproject.com',
      // Include wildcard to allow all Lovable project domains
      '.lovableproject.com'
    ]
  }
})

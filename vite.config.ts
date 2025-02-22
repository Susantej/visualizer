import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import reactSWC from '@vitejs/plugin-react-swc'
import path from 'path'

// Use SWC if available, fall back to standard React plugin
const reactPlugin = reactSWC ? reactSWC() : react()

export default defineConfig({
  plugins: [reactPlugin],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

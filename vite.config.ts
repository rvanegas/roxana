/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    global: 'globalThis',
  },
  // Only test/: src/App.test.js is the Create React App template's, never run.
  test: {
    include: ['test/**/*.test.ts'],
  },
})

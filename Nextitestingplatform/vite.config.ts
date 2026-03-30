import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/n8n-webhook': {
        target: 'https://n8n.nextisolutions.com',
        changeOrigin: true,
        rewrite: () => '/webhook/test-case-generation',
        secure: false,
      },
      '/api/n8n-scripts-webhook': {
        target: 'https://n8n.nextisolutions.com',
        changeOrigin: true,
        rewrite: () => '/webhook/bdd-to-tests',
        secure: false,
      },
      '/api/n8n-tc-webhook': {
        target: 'https://n8n.nextisolutions.com',
        changeOrigin: true,
        rewrite: () => '/webhook/tc-generation-v1',
        secure: false,
      },
      '/api/n8n-us-webhook': {
        target: 'https://n8n.nextisolutions.com',
        changeOrigin: true,
        rewrite: () => '/webhook/user-story-generation',
        secure: false,
        timeout: 960_000,
        proxyTimeout: 960_000,
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})

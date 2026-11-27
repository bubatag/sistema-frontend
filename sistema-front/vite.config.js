
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'bubatag.svg',
      ],

      manifest: {
        name: 'Bubatag - Monitoramento Inteligente',
        short_name: 'Bubatag',
        description: 'Sistema de monitoramento inteligente de bubalinos.',
        theme_color: '#1b252c',
        background_color: '#1b252c',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/bubatag.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },

      workbox: {
        navigateFallback: '/index.html',
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}'
        ],
        cleanupOutdatedCaches: true,
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

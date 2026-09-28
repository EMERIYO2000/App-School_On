import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const manifest = {
  name: 'SCHOOL ON — Apprendre, s\'entraîner et progresser ensemble',
  short_name: 'SCHOOL ON',
  description:
    "Des cours, des quiz, des mentors vérifiés et une communauté éducative — tout au même endroit.",
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#0f172a',
  theme_color: '#2563eb',
  lang: 'fr',
  categories: ['education', 'productivity', 'social'],
  icons: [
    { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  shortcuts: [
    {
      name: 'Mes cours',
      short_name: 'Cours',
      description: 'Reprendre mes cours',
      url: '/learning',
      icons: [{ src: '/pwa-192.png', sizes: '192x192', type: 'image/png' }],
    },
    {
      name: 'Quiz',
      short_name: 'Quiz',
      description: "S'entraîner avec les quiz",
      url: '/quiz',
      icons: [{ src: '/pwa-192.png', sizes: '192x192', type: 'image/png' }],
    },
    {
      name: 'Mentors',
      short_name: 'Mentors',
      description: 'Trouver un mentor',
      url: '/mentors',
      icons: [{ src: '/pwa-192.png', sizes: '192x192', type: 'image/png' }],
    },
  ],
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['logo-full.png', 'logo-mark.png', 'logo.png', 'pwa-180.png', 'pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png'],
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jfif,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

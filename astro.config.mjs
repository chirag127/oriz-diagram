// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import AstroPwa from '@vite-pwa/astro'

export default defineConfig({
  site: 'https://diagram.oriz.in',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    sitemap(),
    AstroPwa({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        id: '/',
        name: 'oriz Diagram',
        short_name: 'Diagram',
        description:
          'Diagram-as-code studio — live Mermaid editor, export SVG/PNG, 100% client-side.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        lang: 'en',
        dir: 'ltr',
        categories: ['productivity'],
        theme_color: '#1f6bff',
        background_color: '#eef2f8',
        icons: [
          { src: '/icons/icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
          { src: '/icons/icon-256.png', type: 'image/png', sizes: '256x256', purpose: 'any' },
          { src: '/icons/icon-384.png', type: 'image/png', sizes: '384x384', purpose: 'any' },
          { src: '/icons/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
          {
            src: '/icons/maskable-512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
          { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            type: 'image/png',
            sizes: '1280x800',
            form_factor: 'wide',
          },
          {
            src: '/screenshots/mobile.png',
            type: 'image/png',
            sizes: '390x844',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /(?:g4f\.dev|pollinations\.ai)/.test(url.host),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dg-ai',
              networkTimeoutSeconds: 20,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && !url.pathname.startsWith('/api/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'dg-shell' },
          },
        ],
      },
    }),
  ],
})

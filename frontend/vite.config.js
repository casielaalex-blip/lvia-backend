import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // <-- ISTO FORÇA O ÍCONE A APARECER NO MODO DEV
      },
      manifest: {
        name: 'Sistema de Gestão de RH e Ponto',
        short_name: 'Gestão RH',
        description: 'Aplicação de Controlo de Frequência e Presença',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2815/2815428.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2815/2815428.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
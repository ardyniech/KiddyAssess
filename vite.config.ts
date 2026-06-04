import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico'],
        manifest: {
          name: 'KiddyApps v3.0',
          short_name: 'KiddyApps',
          description: 'Platform Manajemen Sekolah Terpadu',
          theme_color: '#0ea5e9',
          background_color: '#1e1b4b',
          display: 'standalone',
          icons: [
            {
              src: 'kartika-logo.jpg',
              sizes: '512x512',
              type: 'image/jpeg'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000,
        }
      })
    ],
    define: {
      // Avoid passing secrets to client here unless prefixed with VITE_
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

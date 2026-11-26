import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas: el build funciona en GitHub Pages bajo /invitado-especial-ggj/
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Phaser pesa ~1.2 MB y ya va en su propio chunk, que se carga al empezar la partida
  build: { chunkSizeWarningLimit: 1300 }
})



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // IMPORTANTE: Cambia 'nombre-del-repo' por el nombre real de tu repositorio en GitHub
  // Si vas a desplegar en https://usuario.github.io/recuperar-horas/, usa base: '/recuperar-horas/'
  base: '/control-horas-app/',
})

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0',  // Permet l'accès depuis l'extérieur du conteneur
        port: 5173
      }
})
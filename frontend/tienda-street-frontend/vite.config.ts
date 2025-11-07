import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),], 
  server: {
    proxy: {
      // Cualquier petición que empiece con /api...
      '/api': {
        // ...será redirigida a tu servidor de Django
        target: 'http://localhost:8000',
        // Cambia el origen de la petición para evitar problemas de CORS
        changeOrigin: true,
      },
    },
  },
});

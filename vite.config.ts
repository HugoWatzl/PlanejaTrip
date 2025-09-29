import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Carrega as variáveis de ambiente do arquivo .env
    const env = loadEnv(mode, process.cwd(), '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Define as variáveis que estarão disponíveis no seu código
      define: {
        // Mapeia VITE_GEMINI_API_KEY para process.env.API_KEY, como seu código espera
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        
        // Mapeia as variáveis do Supabase
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
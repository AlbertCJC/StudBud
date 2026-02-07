
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from the .env file
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This tells Vite to replace 'process.env.API_KEY' in your code 
      // with the actual value during the build process.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});

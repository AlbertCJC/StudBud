import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vite automatically handles environment variables prefixed with VITE_
  // and exposes them on `import.meta.env`. The previous complex setup
  // with loadEnv and define is no longer needed.
  server: {
    port: 3000
  }
});

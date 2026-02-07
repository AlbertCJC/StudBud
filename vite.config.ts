
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  // Removed manual loadEnv and define block for process.env.API_KEY.
  // Following @google/genai guidelines: "Assume this variable is pre-configured... and accessible".
  // This also fixes the error where Property 'cwd' does not exist on type 'Process'.
  return {
    plugins: [react()],
  };
});

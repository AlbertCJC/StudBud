import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  // Bridge CEREBRAS_API_KEY and the standard API_KEY variable
  const apiKey = (env.CEREBRAS_API_KEY || env.API_KEY || '').trim();

  return {
    plugins: [react()],
    define: {
      // We must stringify the values so they are treated as string constants in the code
      'process.env.CEREBRAS_API_KEY': JSON.stringify(apiKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Also define the object for bracket-notation access: process.env['KEY']
      'process.env': JSON.stringify({
        CEREBRAS_API_KEY: apiKey,
        API_KEY: apiKey
      })
    },
    server: {
      port: 3000
    }
  };
});
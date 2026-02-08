import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  // Normalize the API key from potential sources
  const apiKey = (env.CEREBRAS_API_KEY || env.API_KEY || '').trim();

  return {
    plugins: [react()],
    define: {
      // 1. Literal string replacement for process.env.CEREBRAS_API_KEY
      'process.env.CEREBRAS_API_KEY': JSON.stringify(apiKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
      // 2. Object replacement to support bracket notation: process.env['CEREBRAS_API_KEY']
      'process.env': JSON.stringify({
        ...env,
        CEREBRAS_API_KEY: apiKey,
        API_KEY: apiKey
      })
    },
    server: {
      port: 3000
    }
  };
});
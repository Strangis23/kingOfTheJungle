import path from 'path';
import { defineConfig, loadEnv } from 'vite';
// You might need to add your React plugin if it's missing
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // The object returned here is your Vite configuration.
    // We will add the 'base' and 'plugins' properties to it.
    return {
      // --- CRITICAL DEPLOYMENT CONFIG ---
      // This tells Vite that your site will be hosted in a subfolder.
      // The value must match your repository name, with slashes.
      base: '/kingOfTheJungle/',

      // --- PLUGIN CONFIGURATION ---
      // You must include the React plugin for a React project to work.
      plugins: [react()], 

      // --- YOUR EXISTING CONFIGURATION (Keep this) ---
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
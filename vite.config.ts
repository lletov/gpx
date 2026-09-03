import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss()],
    // Vercel размещает сайт в корне, поэтому всегда используем '/'
    base: '/',
}));
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss()],
    // GitHub Pages отдаёт сайт из подкаталога /gpx/ —
    // для production-сборки задаём этот префикс всем путям.
    // ВАЖНО: должно совпадать с именем репозитория
    base: mode === 'production' ? '/gpx/' : '/',
}));
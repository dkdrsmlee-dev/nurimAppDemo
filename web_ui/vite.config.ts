import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    emptyOutDir: true,
    outDir: '../mobile_shell/assets/web',
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://192.168.0.147:4011',
        changeOrigin: true,
      },
    },
  },
});

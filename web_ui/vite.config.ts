import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const isShellBuild = mode === 'shell';

  return {
    base: './',
    plugins: [
      react(),
      ...(isShellBuild
        ? [
            viteSingleFile({
              removeViteModuleLoader: true,
              useRecommendedBuildConfig: false,
            }),
          ]
        : []),
    ],
    build: {
      assetsInlineLimit: isShellBuild ? 100000000 : 4096,
      assetsDir: isShellBuild ? '' : 'assets',
      cssCodeSplit: !isShellBuild,
      emptyOutDir: true,
      outDir: isShellBuild ? '../mobile_shell/assets/web' : 'dist',
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
  };
});

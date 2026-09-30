import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '',
  build: {
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        background: resolve(__dirname, 'src/background/service_worker.js'),
        content: resolve(__dirname, 'src/content/content_script.js'),
        loader: resolve(__dirname, 'src/content/loader.js'),
        offscreen: resolve(__dirname, 'src/offscreen/offscreen.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/content_script.js')
      },
      output: {
        entryFileNames: 'content.js',
        format: 'iife',
      }
    },
    outDir: 'dist',
    emptyOutDir: false
  }
});

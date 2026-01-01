import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './test/setupTests.ts',
    globals: true,
    watch: false,
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
});

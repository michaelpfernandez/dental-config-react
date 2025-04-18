/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
      components: resolve(__dirname, './src/components'),
      constants: resolve(__dirname, './src/constants'),
      pages: resolve(__dirname, './src/pages'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/test/**/*',
        'src/index.tsx',
        'src/reportWebVitals.ts',
      ],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: './coverage',
      all: true,
      clean: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      // Remove thresholds object as it's not supported
    },
  },
});

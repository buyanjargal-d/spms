import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/index.html',
        '**/main.jsx',
        '**/__tests__/**',
        '**/assets/**',
        '**/public/**',
      ],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

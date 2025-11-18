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
        'coverage/',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/index.html',
        '**/main.jsx',
        '**/main.tsx',
        '**/index.js',
        '**/index.ts',
        '**/__tests__/**',
        '**/assets/**',
        '**/public/**',
        '**/types/**',
        '**/*.d.ts',
        '**/*.interface.ts',
        '**/vite-env.d.ts',
        '**/models/**',
        '**/entities/**',
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

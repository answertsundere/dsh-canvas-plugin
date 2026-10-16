import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [['test/**/*.test.tsx', 'jsdom']],
  },
})
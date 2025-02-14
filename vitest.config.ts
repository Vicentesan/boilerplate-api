import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      enabled: true,
      exclude: [
        '**/*.d.ts',
        'drizzle.config.ts',
        'tsup.config.ts',
        'vitest.config.ts',
        'src/main.ts',
        'src/utils/**',
        'src/test/factories/**',
        'src/http/schemas/**',
        'src/http/routes/**',
        'src/http/server.ts',
        'src/http/transform-schema.ts',
        'src/http/error-handler.ts',
        'shared/errors/**',
        'src/db/**',
        // 'src/ports/**',
        // 'deploy/index.ts',
        // 'src/adapters/**',
      ],
    },
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})

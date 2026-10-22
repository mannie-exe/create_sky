import { defineConfig } from 'astro/config'
import { workspace } from './scripts/workspace.mjs'
export default defineConfig({
  output: 'static',
  server: { host: '127.0.0.1', port: 4321 },
  vite: {
    plugins: [workspace()],
    build: { assetsInlineLimit: 0 },
    // Workspace saves explicitly refresh their projection. Thousands of generated
    // writes must not trigger reloads that discard the active editor/view.
    server: {
      watch: {
        ignored: ['**/.cache/**', '**/data/**', '**/public/generated/**'],
      },
    },
  },
})

import type { UserConfig } from 'tsdown'

// Standalone demo page: bundles the real CanvasTab / AgentSwarmView with
// synthetic fixtures into a single iife file loadable from demo/index.html —
// no DSH host, no network. Published to GitHub Pages by .github/workflows/
// demo.yml, and buildable locally with `pnpm run demo`.
const demo: UserConfig = {
  name: 'dsh-canvas/demo',
  entry: { 'demo-bundle': 'demo/demo-entry.tsx' },
  outDir: 'demo',
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  dts: false,
  sourcemap: false,
  // The page must be fully self-contained: bundle react instead of leaving it
  // external (tsdown auto-externalizes deps by default).
  noExternal: [/^react(?:\/.*)?$/, /^react-dom(?:\/.*)?$/],
  outExtensions: () => ({ js: '.js' }),
  // demo/ holds this bundle's own sources (index.html, demo-entry.tsx).
  clean: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
}

export default demo

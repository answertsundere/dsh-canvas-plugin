import type { UserConfig } from 'tsdown'

const PLUGIN_ID = 'dsh-canvas'
const CLIENT_EXTERNALS = [
  /^react(?:\/.*)?$/,
  /^react-dom(?:\/.*)?$/,
  /^@deepseek-ai\/cordis(?:\/.*)?$/,
  /^@deepseek-ai\/dsh-client-ui-primitives(?:\/.*)?$/,
]

const host: UserConfig = {
  name: PLUGIN_ID,
  entry: ['src/host/index.ts'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: true,
  deps: { neverBundle: true },
}

const client: UserConfig = {
  name: `${PLUGIN_ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  fixedExtension: false,
  outExtensions: () => ({ js: '.js' }),
  platform: 'browser',
  target: 'es2022',
  dts: false,
  sourcemap: false,
  clean: false,
  deps: { neverBundle: CLIENT_EXTERNALS },
  define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production') },
  outputOptions: {
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

export default [host, client]
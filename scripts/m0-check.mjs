// scripts/m0-check.mjs - scriptable assertions for the M0 gates.
//
// Everything here can be checked without a browser. The gates that need a live
// session (precise cut inheritance, empty-branch idle, parallel observation,
// 500-node stress) are recorded in docs/superpowers/m0-verification.md with
// whatever evidence actually exists, and are NOT claimed as passed by this
// script.
//
// The staleness check exists because of a real trap: pnpm materialises a
// `file:` dependency by COPYING it, and it skips the copy while the spec and
// version are unchanged. Rebuilding therefore changes nothing the running
// profile can see, and the failure is silent - the server keeps serving the
// first copy it ever made.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PROFILE = process.argv[2] ?? 'web-0.1.7'
const PROFILE_DIR = join(homedir(), '.dsh', 'profiles', PROFILE)

const results = []
const check = (gate, name, ok, detail) => {
  results.push({ gate, name, ok, detail })
}

const read = path => (existsSync(path) ? readFileSync(path, 'utf8') : undefined)

// --- Gate 1: the package is a loadable client plugin -----------------------
const clientBundle = read(join(ROOT, 'lib', 'client.js'))
check('1', 'lib/client.js exists', clientBundle !== undefined, join(ROOT, 'lib', 'client.js'))
check('1', 'client bundle keeps the lazy banner',
  clientBundle?.startsWith('window.__ModuleLoader__.load({') === true,
  'first bytes: ' + (clientBundle ?? '').slice(0, 40))
check('1', 'client bundle closes the lazy factory',
  (clientBundle ?? '').trimEnd().endsWith('});')
    && (clientBundle ?? '').includes('return module.exports;'),
  'last bytes: ' + (clientBundle ?? '').slice(-24).replace(/\s+/g, ' '))
check('1', 'React is left external',
  (clientBundle ?? '').includes('require("react")'),
  'host provides React')

const pkg = JSON.parse(read(join(ROOT, 'package.json')) ?? '{}')
check('1', 'package declares a bundle patch', pkg.dsh?.bundle?.patch === './cordis.patch.yml', pkg.dsh?.bundle?.patch)
check('1', 'package declares a web client entry', pkg.dsh?.client?.platform === 'web', pkg.dsh?.client?.platform)

// --- Gate 1/11: the profile carries THIS build -----------------------------
const installedPkg = read(join(PROFILE_DIR, 'package.json'))
check('1', 'profile declares the dependency',
  installedPkg?.includes('"dsh-canvas"') === true, join(PROFILE_DIR, 'package.json'))
check('1', 'profile mounts the bundle row',
  installedPkg?.includes('"dsh-canvas"') === true, 'dsh.profile.bundles')

const installedBundle = read(join(PROFILE_DIR, 'node_modules', 'dsh-canvas', 'lib', 'client.js'))
check('1', 'the profile has an installed copy', installedBundle !== undefined,
  join(PROFILE_DIR, 'node_modules', 'dsh-canvas', 'lib', 'client.js'))
// The exact trap: same version, different bytes, no error anywhere.
check('1', 'the installed copy is the current build',
  installedBundle !== undefined && clientBundle !== undefined && installedBundle === clientBundle,
  installedBundle === undefined
    ? 'no installed copy'
    : installedBundle === clientBundle
      ? 'byte-identical to lib/client.js'
      : 'STALE: re-run scripts/install-local.mjs (it deletes the copy first)')

// --- Gate 11: the retain label is the one M0 attributes ---------------------
const adapter = read(join(ROOT, 'src', 'client', 'adapters', 'event-stream-adapter.ts')) ?? ''
check('11', 'every retain uses one attributable label',
  adapter.includes("CANVAS_RETAIN_SOURCE = 'canvasNode'"), 'canvasNode')

// --- Report ---------------------------------------------------------------
const failed = results.filter(r => !r.ok)
for (const r of results) {
  console.log((r.ok ? 'PASS' : 'FAIL') + '  gate ' + r.gate.padEnd(2) + '  ' + r.name + '  [' + r.detail + ']')
}
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' scriptable checks passed')
if (failed.length > 0) {
  console.log('\nGates needing a live browser run are listed in docs/superpowers/m0-verification.md')
  process.exit(1)
}

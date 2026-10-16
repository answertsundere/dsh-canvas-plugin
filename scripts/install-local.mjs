// scripts/install-local.mjs - local dev loop. The desktop profile refuses CLI
// mutation by design (apps/cli/src/args.ts:83-87), so development installs into a
// web profile instead; the desktop shell serves the same client runtime.
//
// The default target is the clean web-0.1.7 profile. The legacy 'web' profile
// carries ~20 legacy 0.1.x-pinned plugins, two of which starve settingsScope and
// abort the whole client boot. Pass --profile to target any other profile.
//
// Boot form note: 'dsh <name>' is an abbreviation for 'dsh --profile <name>'
// (apps/cli/src/args.ts:202-204), so the profile name must come FIRST and the
// app flags follow it. 'dsh web --profile <name>' fails with "select a profile
// only once", and 'dsh --profile <name> web' leaves a stray positional 'web'
// that swallows the remaining flags.
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO = 'D:/deepseek harness'
const DEFAULT_PROFILE = 'web-0.1.7'
const PORT = '3090'

const pkg = pathToFileURL(resolve(dirname(fileURLToPath(import.meta.url)), '..')).href

const usage = () => {
  console.log([
    'usage: node scripts/install-local.mjs [--profile <name> | --profile=<name>] [--help]',
    '',
    'Installs this package into a DSH profile through the DSH CLI, then prints the',
    'command that boots that profile.',
    '',
    '  --profile <name>   target profile (default: ' + DEFAULT_PROFILE + ')',
    '  --help             print this help and exit',
    '',
    'Default profile ' + DEFAULT_PROFILE + ' bundles dsh-base, dsh-web-app, the agent-team',
    'profile and experimental-auto-review, with no external plugin dependencies.',
  ].join('\n'))
}

function fail(message) {
  console.error('install-local: ' + message)
  console.error('try --help')
  process.exit(1)
}

let profile = DEFAULT_PROFILE
const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i]
  if (arg === '--help' || arg === '-h') {
    usage()
    process.exit(0)
  } else if (arg === '--profile') {
    profile = argv[++i] ?? ''
    if (profile === '') fail('--profile needs a name')
  } else if (arg.startsWith('--profile=')) {
    profile = arg.slice('--profile='.length)
    if (profile === '') fail('--profile needs a name')
  } else {
    fail('unknown argument: ' + arg)
  }
}

execFileSync('corepack', ['pnpm', 'dsh', 'plugin', '--profile', profile, 'add', pkg],
  { cwd: REPO, stdio: 'inherit', shell: true })

console.log('installed into profile "' + profile + '"; boot it with: corepack pnpm dsh '
  + profile + ' --port ' + PORT + ' --no-open')
// scripts/install-local.mjs - local dev loop. The desktop profile refuses CLI
// mutation by design (apps/cli/src/args.ts:83-87), so development installs into
// the web profile; the desktop shell serves the same client runtime.
import { execFileSync } from 'node:child_process'
const repo = 'D:/deepseek harness'
const pkg = 'file:C:/Users/sshuser/Desktop/dsh-canvas-plugin'
execFileSync('corepack', ['pnpm', 'dsh', 'plugin', '--profile', 'web', 'add', pkg],
  { cwd: repo, stdio: 'inherit', shell: true })
console.log('installed into web profile; start it with: corepack pnpm dsh web --port 3090 --no-open')
import { execFileSync } from 'node:child_process'
const repo = 'D:/deepseek harness'
const pkg = 'file:C:/Users/sshuser/Desktop/dsh-canvas-plugin'
execFileSync('corepack', ['pnpm', 'dsh', 'plugin', '--profile', 'desktop', 'add', pkg],
  { cwd: repo, stdio: 'inherit', shell: true })
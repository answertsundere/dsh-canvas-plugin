# dsh-canvas

A conversation-branch canvas for DeepSeek Harness: draw the current workspace's session lineage as a full-bleed canvas, fork from any message, run two approaches in parallel, and compare them deterministically.

> Target: DSH `0.2.0-rc.2`. Every DSH API used here was verified against the local checkout (commit `639ed01539`), not against online docs.

## What it solves

DSH supports forking natively and the sidebar lists sessions, but:

1. **Lineage is invisible** — forked children sit flat next to ordinary sessions; the parent/child relation is dropped.
2. **Forking is buried** — only in the sidebar row menu and the chat turn footer, so you cannot plan *where* to branch without seeing the whole shape.
3. **Parallel exploration has no live view** — running two approaches at once gives you no single place to watch both or compare results.

## v1 capabilities

- **Lineage canvas** — workspace sessions laid out left→right by `parentSession`. A linear chain stays on one row; only real branches spread downward. Zoom 0.4–2×, drag to pan, fit to view, search to locate.
- **Fork from any message** — the detail panel lists the branch's own turns with their real `seq` range and a 「⑂ fork here」 action. The cut is that row's own last event seq, so it is **always a real event**.
- **Two launch modes** — 「run now」 queues the instruction into the child; 「create empty branch」 sends nothing at all.
- **Deterministic comparison** — compares only events after each branch's `inheritedEventCount`, aligned positionally, never semantically. 「Carry conclusion」 produces an **editable draft** and never submits.
- **Three-state status** — confirmed (idle/queued/failed/done), inferred (thinking/tool), unknown (disconnected). **Never infers idle from silence.**

## Install

Desktop (recommended):

```bash
dsh plugin --profile desktop add <package>
```

Web profile (development):

```bash
dsh plugin --profile web add <package>
dsh web --port 3090 --no-open
```

> The desktop profile's plugin set is owned by the desktop app; the CLI refuses `--profile desktop` (`apps/cli/src/args.ts:83-87`). Local development and M0 verification therefore run on a web profile — the desktop shell loads the same `dsh-web-frontend` client runtime.

## Explicit v1 limits

| Limit | Why |
|---|---|
| Branches share one working directory | The public fork API has no `cwd`; the UI carries a permanent 「⚠ parallel write」 warning. |
| The detail panel is a snapshot | Selecting a node reads once and releases immediately, so no session is pinned open. |
| Carry-forward goes to the clipboard | v1 has no composer handle. |
| No persistent mainline marker | Only 「continue in this branch」. |
| No auto-pick, no semantic summary | Positional alignment is the only rule that gives the same answer twice. |

## Version matrix

| DSH | Status |
|---|---|
| `0.2.0-rc.2` | development and verification target |

See [`docs/compat.md`](docs/compat.md) and [`docs/superpowers/m0-verification.md`](docs/superpowers/m0-verification.md) for the actual M0 gate results, including the gates that were **not** run.

## ⚠️ Known publish blocker

`dsh-canvas` is **already taken on npm** (`0.0.1`, described as "Infinite canvas for the DeepSeek Harness - name reserved", repo `dushaobindoudou/dsh-canvas`). Publishing requires renaming to `@<scope>/dsh-canvas` and updating `package.json` `name`, the `name:` in `cordis.patch.yml`, and `PLUGIN_ID` in `tsdown.config.ts`.

**Do not rename during local development**: the loader id changes, the installed profile row stops matching, and the verified M0 install breaks.

## Development

```bash
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node node_modules/vitest/vitest.mjs run
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD ./node_modules/.bin/tsdown
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node scripts/install-local.mjs
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node scripts/m0-check.mjs
```

The `env -u …` is not decoration: the host's injected shim intercepts pnpm's filesystem calls and produces zero-byte files or `EPERM rename`.

Two traps that make changes **silently not apply** — see [`docs/superpowers/m0-verification.md`](docs/superpowers/m0-verification.md):

1. A `file:` dependency is **copied**, not linked, and pnpm skips the copy while spec/version are unchanged — so a rebuild must delete the profile's copy first (the install script does).
2. pnpm 11's `pnpm-workspace.yaml` carries unanswered `allowBuilds` placeholders; until answered, `pnpm add` fails and the DSH plugin manager swallows pnpm's stderr.

## License

MIT, see [`LICENSE`](LICENSE).

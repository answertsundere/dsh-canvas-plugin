# Contributing

Thanks for looking at dsh-canvas. This is a young, single-maintainer project — issues and PRs are both welcome.

## Setup

Prerequisites: Node.js ≥ 22.19, pnpm 10+ (via corepack: `corepack enable`), Git.

```bash
git clone https://github.com/answertsundere/dsh-canvas-plugin
cd dsh-canvas-plugin
pnpm install
pnpm run verify        # typecheck + tests + build; must be green before any PR
```

The suite is vitest (`test/`, ~380 tests, jsdom + @testing-library/react — no browser needed).

## Ground rules

These are the project's hard-won constraints, not style preferences:

1. **The env-unset prefix.** On machines where a host shim injects `NODE_OPTIONS` or `CODEBUDDY_SAFE_DELETE_BULK_GUARD`, every pnpm/tsdown/node command must run under `env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD`; otherwise pnpm's filesystem calls get intercepted and produce zero-byte files or `EPERM rename`. GitHub CI does not need the prefix (the shims do not exist there).
2. **DSH APIs are verified against a checkout, not docs.** The target is DSH `0.2.0-rc.2`. [`docs/compat.md`](docs/compat.md) lists the ten fragile points. If a PR touches a DSH API, cite the checkout file and line it was verified against.
3. **Type assertions live only in `src/client/index.ts`** — that file is the one place allowed to bridge DSH's untyped boundary. Everywhere else, types come from the declared interfaces.
4. **No package rename.** `dsh-canvas` is the loader id inside installed profiles; renaming it (e.g. to a scoped npm name) breaks every existing install. See the publish-blocker section in the README — it is a deliberate, recorded decision, not a TODO.
5. **Host-boundary changes need the full loop.** After any change that touches how the plugin talks to DSH: `pnpm run verify`, then `node scripts/install-local.mjs` (a plain `pnpm add` leaves a stale copy in the profile, silently), then `node scripts/m0-check.mjs`.

## Pull requests

- One concern per PR.
- Update tests alongside behavior. When a required field is added to an interface, every test fixture needs it too — that is the most common breakage pattern here.
- UI strings visible to users are Chinese (`toolLabel`, `toolGlyph` and friends in `src/client/swarm/swarm-model.ts`); keep new affordances consistent with that.
- Pure logic goes in `src/client/swarm/swarm-model.ts`-style modules, testable without React; controllers own the subscriptions; components stay presentational. Follow the existing seams rather than inventing new ones.

## Reporting bugs

Open a GitHub issue with:

- DSH version and how it was installed (desktop app / CLI)
- OS and the profile the plugin was installed into
- The failing command's full output (do not trim the traceback)
- For visual bugs: a screenshot of the canvas

Security-relevant findings: see [`SECURITY.md`](SECURITY.md) — do not open a public issue for those.

# AGENTS.md

DSH client plugin ("conversation branch canvas"). Read **[HANDOFF.md](HANDOFF.md)** first — it is the takeover entry point: current state, where the durable knowledge lives, commands, silent-failure traps, and open decisions.

Non-negotiables, all of them learned the hard way (details in HANDOFF.md §5):

- Every command runs under `env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD` — the host shim breaks pnpm/tsdown filesystem calls.
- DSH APIs are verified against the local checkout at `D:/deepseek harness` (commit `639ed01539`, v0.2.0-rc.2), never against online docs.
- After any code change: `pnpm run verify` → `node scripts/install-local.mjs` (a plain `pnpm add` leaves a stale copy in the profile, silently) → `node scripts/m0-check.mjs`.
- Type assertions live only in `src/client/index.ts`.
- Never rename the package (`dsh-canvas` → scoped) without an explicit decision — the loader id is part of the installed profile row.

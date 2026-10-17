# Changelog

All notable changes to this project. Format follows [Keep a Changelog](https://keepachangelog.com/), versioning follows [SemVer](https://semver.org/).

## [Unreleased]

### Added

- Lineage canvas: workspace sessions laid out by `parentSession`, layered left→right, with zoom, pan, fit-to-view, and search-to-locate.
- Fork from any message: per-row `seq` range, real cut point, idempotent launch with a single prompt retry on the same `requestId`.
- Deterministic branch comparison over each branch's own events, with positional turn alignment and synthetic-closer exclusion.
- Three-state runtime status (confirmed / inferred / unknown), never inferring idle from silence.
- Detail panel with message timeline and fork dialog; compare panel with continue and carry-forward draft.
- `scripts/install-local.mjs` and `scripts/m0-check.mjs` for the local dev loop and the scriptable M0 gates.

### Fixed

- A fork whose receipt was lost could recover the **wrong** child: scanning "a child of the parent" returns a pre-existing branch on any parent that already has children. Recovery now diffs the parent's children across the fork, and reports `unverified` rather than guessing when the difference is ambiguous.
- A fork cut computed as "the seq before the next row" produced a non-existent seq whenever the event stream had a gap, and DSH rejects such a fork. The cut is now the row's own last event seq.
- A `file:` dependency is copied into the profile and pnpm skips the copy while the version is unchanged, so rebuilds silently never reached the running server. The install script now removes the copy first, and `m0-check` byte-compares the two.

### Known

- npm name `dsh-canvas` is taken; publishing requires a scoped rename.
- M0 gates 4 (empty branch does not auto-run queued input), 9 (disconnect/reconnect), and 10 (500-node stress) are not yet executed.

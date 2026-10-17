# Changelog

All notable changes to this project. Format follows [Keep a Changelog](https://keepachangelog.com/), versioning follows [SemVer](https://semver.org/).

## [Unreleased]

### Added

- Lineage canvas: workspace sessions laid out by `parentSession`, layered left→right, with zoom, pan, fit-to-view, and search-to-locate.
- Fork from any message: per-row `seq` range, real cut point, idempotent launch with a single prompt retry on the same `requestId`.
- Deterministic branch comparison over each branch's own events, with positional turn alignment and synthetic-closer exclusion.
- Three-state runtime status (confirmed / inferred / unknown), never inferring idle from silence.
- Detail panel with message timeline and fork dialog; compare panel with continue and carry-forward draft.
- Live streaming output: the in-flight assistant stream (`assistant/live-chunk` reasoning/text/tool deltas) is rendered on the canvas — a newest-line snippet on each running node card and the full reasoning/answer stream in the selected branch's detail panel. The status badge is driven by the stream while one is visible (thinking vs tool), and settled output folds into the turn list automatically.
- Agent swarm web: the ⌖ button on a node card opens the session's live agent view — the parent at the center of a radial web, subagents on the ring, glowing pulses crawling along spokes while agents emit, and each agent's newest output line on its chip. The roster rides the session log's `subagent/catalog` events, so spawned agents appear without a refresh. A single-agent session is no longer empty: its own recent turns and tool calls form an outer activity ring (pending tool glowing with a crawling pulse). The detail-panel header carries a prominent 「⌖ Agent 实况」 action, and a working session's card breathes a halo in its status color.
- The detail panel leads with the session's latest conclusion (last assistant output, tail-anchored) so the answer is visible without opening the conversation; right-clicking a canvas node opens a shortcut menu (fork from the latest message / Agent 实况 / open chat); and the swarm chips render each agent's own todo checklist (✓/◐/○ with a done/total line) folded from its `todo/write` snapshots.
- `scripts/install-local.mjs` and `scripts/m0-check.mjs` for the local dev loop and the scriptable M0 gates.

### Fixed

- A fork whose receipt was lost could recover the **wrong** child: scanning "a child of the parent" returns a pre-existing branch on any parent that already has children. Recovery now diffs the parent's children across the fork, and reports `unverified` rather than guessing when the difference is ambiguous.
- A fork cut computed as "the seq before the next row" produced a non-existent seq whenever the event stream had a gap, and DSH rejects such a fork. The cut is now the row's own last event seq.
- A `file:` dependency is copied into the profile and pnpm skips the copy while the version is unchanged, so rebuilds silently never reached the running server. The install script now removes the copy first, and `m0-check` byte-compares the two.
- Forking from a **running** branch never opened the dialog: the live detail path leaves the one-shot read empty, and the fork action read the wrong one. Found by the real-session live run; pinned by a regression test.

### Known

- npm name `dsh-canvas` is taken; publishing requires a scoped rename.
- M0 gate 11's residue half (`retainInfo().retainedBy.canvasNode` back to zero after a real uninstall) still needs a host-side query; gate 1 is PASS at the DOM level, gates 4/9/10 are closed (UNIT+SRC / UNIT / PASS with measurements), and gate 8 now has real parallel-branch evidence.

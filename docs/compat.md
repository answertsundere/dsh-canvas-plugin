# Compatibility

## Verified against

| Item | Value |
|---|---|
| DSH version | `0.2.0-rc.2` |
| DSH commit | `639ed01539` |
| Local checkout | `D:/deepseek harness` |
| Kernel (desktop) | `0.2.0-rc.2` |
| Node | `>=22.19.0` (tested on 22.22.2) |
| Profile used for verification | `web-0.1.7` |

Every DSH API this plugin calls was read out of that checkout. The file and line
each behaviour was verified against is recorded in
[`docs/superpowers/plans/2026-10-15-dsh-canvas-implementation.md`](superpowers/plans/2026-10-15-dsh-canvas-implementation.md)
under the relevant task's "corrections" block, and in the SDD ledger.

## Surface this plugin depends on

| Need | API | Source |
|---|---|---|
| Register the tab | `ctx.slots.inject('conversation.view', …)` / `ctx.slots.register({ id: 'canvas', order: 20 }, …)` | `client/ui-trajectory/src/client/index.ts:79-112` |
| Injected services | `slots, sessions, workspaces, uiWorkspace, uiConversation, locale` | `ui-trajectory:41` |
| Session list | `ctx.sessions.list.getSnapshot()` → `{ ids, byId, phase }` | `api/session-controller/src/client/sessions/service.ts:54-63` |
| Workspace list | `ctx.workspaces.list.getSnapshot()` → `{ items, archivedSessionIds, pinnedSessionIds, state, phase }` | `api/workspace-controller/src/client/model.ts:32-41` |
| Fork at a cut | `ctx.sessions.fork({ sessionId, atSeq, increaseTitle, onCreated })` | `client/contract/sessions.ts:132-137` |
| Retain / one-shot read | `ctx.sessions.retain(id, { source })` → `{ binding, ready, release }` | `client/contract/sessions.ts:24-33` |
| Prompt | `binding.session.prompt(content, mode, signal?, requestId?)` — **requestId is 4th** | `client/contract/session.ts:87-92` |
| Raw events | `binding.eventSource.getSnapshot().entries` (`{ type: 'event', event }`) | `client/contract/events.ts:23-25,109-117` |
| Open a session | `ctx.uiWorkspace.openSession(target)` | `client/ui-workspace/src/client/navigation.ts:34` |

## Fragile points

These are the places where a DSH upgrade is most likely to break the plugin, in
rough order of risk:

1. **`prompt()`'s parameter order.** `requestId` is the fourth argument, after
   `signal`. Passing it third silently lands it in `signal`, which drops it and
   disables the Host's prompt dedupe with no visible error.
2. **`prompt()` returns a `RemoteResult`** and does not reject on a business
   error. Code that only catches rejections reads a refused prompt as success.
3. **`inheritedEventCount = boundary + 1`** for an inclusive cut. An off-by-one
   here silently changes what "compare only the new work" means.
4. **`uiConversation.binding()` throws** for an unknown or inactive session, so
   it may only be called after a retain has made the session current.
5. **The three `declare module` merges are explicit devDependencies** (restored
   2026-10-17, Task 16): `sessions` ← `@deepseek-ai/dsh-api-session-controller`,
   `workspaces` ← `@deepseek-ai/dsh-api-workspace-controller`, `uiWorkspace` ←
   `@deepseek-ai/dsh-client-ui-workspace`, plus the `SessionReferenceSourceMap`
   `canvasNode` extension in `src/client/index.ts`. If a DSH upgrade moves or
   renames a `/client` entry, the plugin's augmentation fails to resolve
   (TS2664) — loud in typecheck, not at runtime. Brand casts (`SessionId`,
   `SessionRequestId`) remain only in `src/client/index.ts`; neither brand has
   a public minter.
6. **The client list row carries neither `createdAt` nor an availability flag.**
   `createdAt` falls back to `updatedAt`, so root ordering is activity-based;
   `available` is always true, which leaves the `failed` status reachable only
   from an explicit error channel.
7. **`sessionIds` is an accounting list** and can lag a just-created session, so
   workspace membership is the union of `sessionIds` and a `cwd === path` match.
8. **A stray `pnpm-workspace.yaml` above the repo hijacks every pnpm command.**
   pnpm 11 walks up to the nearest workspace file and treats that directory as
   the root — a bare `pnpm add` then writes lockfile entries and symlinks into
   the wrong project with no error. The repo pins `.npmrc` `ignore-workspace=true`;
   if that file is ever removed, reinstall from a clean `node_modules`.
9. **The live streaming tail depends on the `assistant/live-chunk` contract.**
   Transient window rows (`SessionEventLikeEntry`, `AssistantLiveChunkEvent`)
   carry `StreamChunk` deltas (`block-start` / `text-delta` / `reasoning-delta` /
   `tool-call-delta` / `block-end`) that a durable `assistant/message` or
   `assistant/attempt` settles atomically. A DSH upgrade that renames chunk
   kinds, changes the settle pair, or stops emitting transient rows degrades the
   canvas to "no snippet" silently — the live tail is additive by design, so the
   failure mode is an empty live block, never a broken tab. `src/client/live/live-tail.ts`
   skips unknown chunk kinds rather than throwing; re-verify against
   `api/session-controller/src/client/contract/events.ts` on any upgrade.
10. **The agent swarm reads `subagent/catalog` durable events.** The roster
   comes from the parent session's own log (`packages/subagent/subagent/src/catalog.ts`:
   `{ childId, childCreatedAt, mode, label? }`, appended per direct child). A
   rename or re-shape of that event, or moving the catalog out of the session
   log into a separate service, empties the web silently — the swarm is
   additive, so the failure mode is a root-only view, never a broken tab.
   Re-verify against the catalog module on any upgrade.

## Not verified

Gates are listed with an explicit PASS / UNIT / SRC / NOT-RUN caliber in
[`m0-verification.md`](m0-verification.md). As of 2026-10-17 the only gates
still lacking real-session evidence are **8** (two live parallel branches
observed on a real run — unit-tested and snapshot-subscribed only) and
**11** (`retainInfo().retainedBy.canvasNode` back to zero after a real
uninstall — release paths unit-tested, DOM round trip proven). Gate 1 is PASS
at the DOM level including the uninstall half; gate 10 is PASS with
measurements; gate 4 is UNIT+SRC.

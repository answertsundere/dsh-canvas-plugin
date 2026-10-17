# Security

## Data discipline

This plugin is a **read-only projection of DSH session data**.

- It writes nothing to `~/.dsh` or `$DSH_HOME`.
- It keeps no plugin-owned storage: v1 has zero persistence.
- Session reads use DSH's own retain lifecycle, and every retain is released. Reads that fail release before rethrowing, so a failed read cannot leave a Session pinned open.
- Retains are attributed to a single label (`canvasNode`), so `retainInfo().retainedBy.canvasNode` is the complete accounting of what this plugin holds.

## What the plugin can do

- Read the session list, workspace membership, and a session's event window.
- Fork a session at a cut the user picked, and (when the user chooses 「立即开跑」) queue one instruction into the new child.
- Switch the app to a session the user clicked.

It does not read credentials, does not call models on its own, and does not send anything to a network endpoint.

## Shared working directory

v1 branches inherit the source session's `cwd` — the public fork API has no `cwd` parameter. Two branches running at once can therefore overwrite each other's files. The UI carries a permanent 「⚠ 并行写入」 warning wherever this applies, and the fork dialog repeats it. This is a documented limitation, not a bug.

## Reporting

Open an issue in the project repository. Please do not include session logs or credentials in a report; a minimal reproduction against a scratch workspace is enough.

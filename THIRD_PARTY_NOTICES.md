# Third-party notices

This package ships **no bundled third-party runtime code**. Its own build output
(`lib/`) is compiled from `src/` alone.

At runtime it relies on the host application providing the following, which are
declared as `peerDependencies` and are never vendored:

| Package | License | Role |
|---|---|---|
| `react` | MIT | Component runtime, provided by the host |
| `react-dom` | MIT | Component runtime, provided by the host |
| `@deepseek-ai/dsh-client-ui-primitives` | see DSH | Host UI primitives |
| `@deepseek-ai/cordis` | MIT | Host plugin context |

Development-only tooling (not shipped in the published package): `typescript`,
`tsdown` (MIT, powered by `rolldown`), `vitest`, `@testing-library/react`,
`jsdom`, and the `@deepseek-ai/dsh-*` type packages.

DSH itself is a separate product with its own license; this plugin does not
redistribute any part of it. `docs/superpowers/` records which DSH source files
each behaviour was verified against so the claims can be re-checked.

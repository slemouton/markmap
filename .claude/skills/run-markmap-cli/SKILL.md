---
name: run-markmap-cli
description: Build, launch, and test the markmap-cli package in this monorepo. Use when asked to run markmap, test the CLI, or verify local changes to markmap-view/markmap-toolbar show up in the CLI's output.
---

## Setup

From the repo root, install deps once (pnpm workspace):

```bash
pnpm install
```

`packages/markmap-cli` ships with a prebuilt `dist/` and `bin/cli.js`, so
you usually don't need to build it yourself. If `dist/` is missing or stale:

```bash
pnpm --filter markmap-cli build
```

## Run

Invoke directly with node (no global install needed):

```bash
cd packages/markmap-cli
node bin/cli.js --help
```

Generate a markmap from a markdown file, without opening a browser:

```bash
node bin/cli.js /path/to/input.md --no-open -o /tmp/output.html
```

Default behavior (opens the result in your browser):

```bash
node bin/cli.js /path/to/input.md
```

Useful flags: `--offline` (inline all assets so the HTML works without
network), `--watch` (regenerate on file change, dev only), `--port <n>`
(dev server port), `--no-toolbar`.

Note: every invocation prints `Failed to find Response internal state key`
to stderr. This is a harmless Node/Hono compatibility warning — it doesn't
affect output.

## Verify it worked

```bash
grep -o 'Root\|Branch A' /tmp/output.html
```

The generated HTML embeds the parsed markdown tree as JSON in a `<script>`
tag — confirm your source headings/content appear there, and that a
`<svg id="mindmap">` element exists.

## Testing local, uncommitted changes to markmap-view / markmap-toolbar

By default, the generated HTML loads `markmap-view` and `markmap-toolbar`
from the **jsDelivr CDN** at whatever version is pinned in
`packages/markmap-cli/package.json` (e.g. `markmap-view@0.18.12`). This is
true even with `--offline` — that flag only inlines the same CDN-fetched
assets, it does not substitute your local workspace build.

So if you've changed `packages/markmap-view/src/*` or
`packages/markmap-toolbar/src/*` and want to see the change in a generated
markmap, you must:

1. Build the changed package(s):
   ```bash
   pnpm --filter markmap-view build
   pnpm --filter markmap-toolbar build
   ```
2. Generate the HTML as usual (`node bin/cli.js ... -o /tmp/output.html`).
3. Edit the generated HTML to replace the CDN `<script>`/`<link>` tags for
   the package(s) you rebuilt with `file://` paths to the local `dist/`:
   ```html
   <!-- replace -->
   <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.12/dist/browser/index.js"></script>
   <!-- with -->
   <script src="file:///absolute/path/to/markmap/packages/markmap-view/dist/browser/index.js"></script>
   ```
   Same for `markmap-toolbar@<version>/dist/index.js` and `dist/style.css`.
4. Open the edited HTML file directly in a browser (`open /tmp/output.html`).

Sanity-check a rebuilt bundle actually contains your change before wiring it
in, e.g.:

```bash
grep -c "Toggle layout" packages/markmap-toolbar/dist/index.js
```

## Test

Run the whole workspace's test suite (there are no CLI-package-specific
tests):

```bash
pnpm test
```

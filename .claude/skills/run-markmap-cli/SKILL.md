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

A ready-made test fixture lives at `packages/markmap-cli/test/input.md`
(headings `Root` / `Branch A` / `Branch B` / `Sub-branch B1` with nested
lists) — use it for quick smoke tests instead of writing a throwaway file:

```bash
node bin/cli.js test/input.md --no-open -o /tmp/output.html
```

Useful flags: `--offline` (inline all assets so the HTML works without
network), `--watch` (regenerate on file change, dev only), `--port <n>`
(dev server port), `--no-toolbar`.

`--mermaid [file]` additionally writes a Mermaid syntax file (defaults to
`<input>.mmd` if no path given); `--mermaid-type <mindmap|graph>` picks
between a Mermaid `mindmap` diagram (default) and a `graph TD` flowchart
with node IDs and edges:

```bash
node bin/cli.js test/input.md --no-open -o /tmp/output.html --mermaid /tmp/output.mmd --mermaid-type graph
```

Note: every invocation prints `Failed to find Response internal state key`
to stderr. This is a harmless Node/Hono compatibility warning — it doesn't
affect output.

## Mermaid files as input

Input files with a `.mmd` or `.mermaid` extension are detected
automatically and parsed as Mermaid syntax instead of Markdown, using the
real `mermaid` package (broad grammar support, not a hand-rolled subset).
Only the `mindmap` and `graph`/`flowchart` diagram types convert to a
markmap tree — other types (sequence, class, ER, gantt, pie, state, …)
produce a clear error instead of a nonsense tree.

```bash
node bin/cli.js test/input.mmd --no-open -o /tmp/from-mindmap.html
node bin/cli.js test/input-graph.mmd --no-open -o /tmp/from-graph.html
```

Two ready-made fixtures mirror `test/input.md`'s tree (Root/Branch
A/Branch B/Sub-branch B1): `test/input.mmd` (`mindmap` syntax) and
`test/input-graph.mmd` (`graph TD` syntax).

Mermaid input can still be re-exported via `--mermaid`/`--mermaid-type`
(e.g. convert a hand-written `mindmap` file to `graph` syntax) since that
flag only depends on the parsed tree, not the original format.

`--watch` is **not supported** for Mermaid input — combining them raises
an explicit error rather than silently mis-parsing the file as Markdown.

## Verify it worked

```bash
grep -o 'Root\|Branch A\|Branch B\|Sub-branch B1' /tmp/output.html
```

The generated HTML embeds the parsed markdown tree as JSON in a `<script>`
tag — confirm your source headings/content appear there, and that a
`<svg id="mindmap">` element exists.

## Previewing the generated HTML

`--no-open` skips launching a browser (useful for headless/agent runs). To
actually look at the result on macOS:

```bash
open -a Safari /tmp/output.html      # or: open /tmp/output.html for the default browser
```

To preview inside VS Code itself (embedded "Simple Browser" tab) without
relying on an integrated-browser tool that may prompt for permission:

```bash
open "vscode://command/simpleBrowser.show?%5B%22file:///tmp/output.html%22%5D"
```

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

# Markmap VSCode Extension

A VSCode extension that visualizes your Markdown files as interactive mind maps using the local markmap library.

## Features

- 🗺️ Visualize markdown as interactive mindmaps
- ⚡ Real-time preview as you edit
- 📐 Pan, zoom, and navigate the mindmap
- 🎨 Auto-fit to viewport

## Installation

The extension has been installed locally on your system. To use it:

1. Open a Markdown file in VSCode
2. Use the keyboard shortcut **`Ctrl+Shift+M`** (or **`Cmd+Shift+M`** on Mac)
3. A preview panel will open showing the mindmap visualization

Alternatively, you can run the command **"Markmap: Show Preview"** from the VSCode Command Palette (`Ctrl+Shift+P`).

## Usage

- **Open Preview**: Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac) in a markdown file
- **Auto-update**: The preview updates automatically as you edit the markdown
- **Multiple Files**: You can have multiple mindmap previews open for different markdown files
- **Pan & Zoom**: Use mouse wheel to zoom and drag to pan in the mindmap

## Requirements

- VSCode 1.90.0 or later
- This extension uses the local markmap library from your development environment

## Development

The extension is located in `packages/markmap-vscode/` within the markmap monorepo.

### Building

```bash
pnpm build:js       # Build the extension JavaScript
pnpm watch          # Watch mode for development
```

### Packaging

```bash
vsce package        # Create a VSIX package
```

### Installation

```bash
code --install-extension markmap-vscode-0.1.0.vsix
```

## Architecture

The extension:
1. Uses `markmap-lib` to parse and transform markdown into a mindmap data structure
2. Renders the mindmap using `markmap-view` in a VSCode webview
3. Monitors document changes and updates the preview in real-time

## Troubleshooting

If the preview doesn't appear:
1. Make sure you have a markdown file open (`.md` extension)
2. The markdown file should have proper markdown heading syntax (`#`, `##`, etc.)
3. Check the VSCode output panel for any error messages

## License

MIT

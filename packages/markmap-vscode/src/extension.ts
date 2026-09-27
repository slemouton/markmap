import * as vscode from 'vscode'
import * as path from 'path'
import { Transformer } from 'markmap-lib'

let panels = new Map<string, vscode.WebviewPanel>()

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'markmap.showPreview',
    async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor || editor.document.languageId !== 'markdown') {
        vscode.window.showErrorMessage('Please open a markdown file first')
        return
      }

      const doc = editor.document
      const docUri = doc.uri.toString()

      let panel = panels.get(docUri)
      if (panel) {
        panel.reveal(vscode.ViewColumn.Beside)
      } else {
        panel = vscode.window.createWebviewPanel(
          'markmap-preview',
          `Markmap: ${path.basename(doc.fileName)}`,
          vscode.ViewColumn.Beside,
          {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)],
          }
        )

        panels.set(docUri, panel)

        panel.onDidDispose(() => {
          panels.delete(docUri)
        })

        panel.onDidChangeViewState((e) => {
          if (e.webviewPanel.visible) {
            updatePreview(panel!, doc, context)
          }
        })

        updatePreview(panel, doc, context)
      }

      // Update preview when document changes
      const changeDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document === doc && panel) {
          updatePreview(panel, doc, context)
        }
      })

      panel.onDidDispose(() => {
        changeDisposable.dispose()
      })
    }
  )

  context.subscriptions.push(disposable)
}

function updatePreview(
  panel: vscode.WebviewPanel,
  doc: vscode.TextDocument,
  context: vscode.ExtensionContext
) {
  try {
    const content = doc.getText()
    const transformer = new Transformer()
    const result = transformer.transform(content)

    const html = getWebviewContent(result.data, context, panel)
    panel.webview.html = html
  } catch (err) {
    panel.webview.html = `<div style="color: red; padding: 20px;">Error: ${err instanceof Error ? err.message : String(err)}</div>`
  }
}

function getWebviewContent(data: any, context: vscode.ExtensionContext, panel: vscode.WebviewPanel): string {
  const markmapLibPath = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'node_modules', 'markmap-lib', 'dist', 'browser', 'index.mjs'))
  )

  const markmapViewPath = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'node_modules', 'markmap-view', 'dist', 'index.mjs'))
  )

  const markmapViewCssPath = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'node_modules', 'markmap-view', 'dist', 'style.css'))
  )

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markmap Preview</title>
  <link rel="stylesheet" href="${markmapViewCssPath}">
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    #container {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="container"></div>
  <script type="module">
    import { Markmap } from '${markmapViewPath}';

    const data = ${JSON.stringify(data)};
    const container = document.getElementById('container');
    const mm = new Markmap(container, null, data);
    window.addEventListener('resize', () => mm.fit());
  </script>
</body>
</html>`
}

export function deactivate() {}

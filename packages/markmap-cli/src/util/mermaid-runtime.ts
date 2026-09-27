let mermaidPromise: ReturnType<typeof loadMermaid> | undefined;

async function loadMermaid() {
  if (typeof (globalThis as { window?: unknown }).window === 'undefined') {
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    (globalThis as any).window = dom.window;
    (globalThis as any).document = dom.window.document;
  }
  const { default: mermaid } = await import('mermaid');
  mermaid.mermaidAPI.initialize({ startOnLoad: false });
  return mermaid;
}

export function getMermaidDiagram(text: string) {
  mermaidPromise ??= loadMermaid();
  return mermaidPromise.then((mermaid) => mermaid.mermaidAPI.getDiagramFromText(text));
}

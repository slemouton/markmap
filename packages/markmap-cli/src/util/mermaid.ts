import { IPureNode } from 'markmap-common';

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

function sanitize(content: string): string {
  const text = content
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"/g, "'");
  return `"${text || '(empty)'}"`;
}

function walk(node: IPureNode, depth: number, lines: string[]): void {
  lines.push(`${'  '.repeat(depth + 1)}${sanitize(node.content)}`);
  for (const child of node.children) {
    walk(child, depth + 1, lines);
  }
}

export function buildMermaidMindmap(root: IPureNode): string {
  const lines = ['mindmap'];
  walk(root, 0, lines);
  return lines.join('\n');
}

function walkGraph(
  node: IPureNode,
  parentId: string | null,
  nextId: () => string,
  lines: string[],
): void {
  const id = nextId();
  lines.push(
    parentId
      ? `  ${parentId} --> ${id}[${sanitize(node.content)}]`
      : `  ${id}[${sanitize(node.content)}]`,
  );
  for (const child of node.children) {
    walkGraph(child, id, nextId, lines);
  }
}

export function buildMermaidGraph(root: IPureNode): string {
  const lines = ['graph TD'];
  let counter = 0;
  walkGraph(root, null, () => `n${counter++}`, lines);
  return lines.join('\n');
}

export type MermaidType = 'mindmap' | 'graph';

export function buildMermaid(root: IPureNode, type: MermaidType): string {
  return type === 'graph' ? buildMermaidGraph(root) : buildMermaidMindmap(root);
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

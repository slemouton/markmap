import type { IPureNode } from 'markmap-common';
import { escapeHtml } from './mermaid';
import { getMermaidDiagram } from './mermaid-runtime';

interface MindmapNode {
  descr?: string;
  children?: MindmapNode[];
}

function mindmapNodeToTree(node: MindmapNode): IPureNode {
  return {
    content: escapeHtml(node.descr || ''),
    children: (node.children || []).map(mindmapNodeToTree),
  };
}

function flowchartToTree(db: {
  getVertices(): Map<string, { text?: string }>;
  getEdges(): Array<{ start: string; end: string }>;
}): IPureNode {
  const vertices = db.getVertices();
  const edges = db.getEdges();

  const nodes = new Map<string, IPureNode>();
  const order: string[] = [];
  const ensure = (id: string) => {
    let node = nodes.get(id);
    if (!node) {
      const label = vertices.get(id)?.text || id;
      node = { content: escapeHtml(label), children: [] };
      nodes.set(id, node);
      order.push(id);
    }
    return node;
  };
  vertices.forEach((_v, id) => ensure(id));

  const hasParent = new Set<string>();
  const attached = new Set<string>();
  const isAncestor = (candidate: IPureNode, of: IPureNode): boolean =>
    of.children.some((c) => c === candidate || isAncestor(candidate, c));

  for (const { start, end } of edges) {
    const source = ensure(start);
    const target = ensure(end);
    const pairKey = `${start}->${end}`;
    if (attached.has(pairKey) || source === target || isAncestor(target, source)) {
      continue;
    }
    source.children.push(target);
    attached.add(pairKey);
    hasParent.add(end);
  }

  const roots = order.filter((id) => !hasParent.has(id)).map((id) => nodes.get(id)!);
  if (roots.length === 0) {
    throw new Error('No root node found — the flowchart may be entirely cyclic.');
  }
  return roots.length === 1 ? roots[0] : { content: 'Root', children: roots };
}

export async function parseMermaidToTree(content: string): Promise<IPureNode> {
  const diagram = await getMermaidDiagram(content);
  switch (diagram.type) {
    case 'mindmap': {
      const db = diagram.db as { getMindmap?: () => MindmapNode | null };
      const root = db.getMindmap?.();
      if (!root) throw new Error('Empty Mermaid mindmap: no nodes found.');
      return mindmapNodeToTree(root);
    }
    case 'flowchart-v2':
    case 'flowchart':
    case 'graph':
      return flowchartToTree(
        diagram.db as {
          getVertices(): Map<string, { text?: string }>;
          getEdges(): Array<{ start: string; end: string }>;
        },
      );
    default:
      throw new Error(
        `Cannot convert Mermaid diagram type "${diagram.type}" to a markmap — ` +
          'only "mindmap" and "graph"/"flowchart" are supported as CLI input.',
      );
  }
}

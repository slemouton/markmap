import { scaleOrdinal, schemeCategory10 } from 'd3';
import { INode } from 'markmap-common';
import { IMarkmapOptions } from './types';

export const isMacintosh =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Macintosh');

export const defaultColorFn = scaleOrdinal(schemeCategory10);

export const lineWidthFactory =
  (baseWidth = 1, deltaWidth: number = 3, k: number = 2) =>
  (node: INode) =>
    baseWidth + deltaWidth / k ** node.state.depth;

export const defaultOptions: IMarkmapOptions = {
  autoFit: false,
  duration: 500,
  embedGlobalCSS: true,
  fitRatio: 0.95,
  layout: 'tree',
  maxInitialScale: 2,
  scrollForPan: isMacintosh,
  initialExpandLevel: -1,
  zoom: true,
  pan: true,
  toggleRecursively: false,

  color: (node: INode): string => defaultColorFn(`${node.state?.path || ''}`),
  lineWidth: lineWidthFactory(),
  maxWidth: 0,
  nodeMinHeight: 16,
  paddingX: 8,
  spacingHorizontal: 80,
  spacingVertical: 5,
};

/**
 * Tuning constants for the `force` layout mode. HTML content boxes are much
 * larger than the plain circles in the textbook d3-force example, so charge
 * and link distance are scaled up accordingly.
 */
export const FORCE_LINK_DISTANCE = 120;
export const FORCE_LINK_STRENGTH = 0.6;
export const FORCE_CHARGE_STRENGTH = -400;
export const FORCE_COLLIDE_PADDING = 8;
export const FORCE_COLLIDE_STRENGTH = 0.9;
export const FORCE_CENTER_STRENGTH = 0.03;
/** Alpha reheat applied when the node/link set changes (fold/unfold). */
export const FORCE_ALPHA_RENDER = 0.3;
/** Alpha target while a node is actively being dragged. */
export const FORCE_ALPHA_DRAG = 0.3;

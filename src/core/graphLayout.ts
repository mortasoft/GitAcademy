import { GitState, GraphNode } from '../types/git';
import { getHeadCommitId } from './gitEngine';

const BRANCH_COLORS = [
  '#3B82F6', // Blue (main/master)
  '#10B981', // Green (feature)
  '#F59E0B', // Amber (hotfix)
  '#EC4899', // Pink (dev)
  '#8B5CF6', // Purple (release)
  '#06B6D4', // Cyan
];

export interface GhostNodeLayout {
  x: number;
  y: number;
  headCommitId: string;
  hasStaged: boolean;
  hasWorking: boolean;
  stagedFiles: string[];
  workingFiles: string[];
}

export interface GraphLayoutResult {
  nodes: GraphNode[];
  edges: {
    from: { x: number; y: number; id: string };
    to: { x: number; y: number; id: string };
    isMerge?: boolean;
    color: string;
  }[];
  width: number;
  height: number;
  ghostNode?: GhostNodeLayout | null;
}

export const computeGraphLayout = (state: GitState): GraphLayoutResult => {
  const commitMap = state.commits;
  const commitIds = Object.keys(commitMap);

  if (commitIds.length === 0) {
    return { nodes: [], edges: [], width: 600, height: 300 };
  }

  // Encontrar hijos de cada commit
  const childrenMap: Record<string, string[]> = {};
  commitIds.forEach((id) => {
    childrenMap[id] = [];
  });

  commitIds.forEach((id) => {
    const c = commitMap[id];
    c.parentIds.forEach((parentId) => {
      if (childrenMap[parentId]) {
        childrenMap[parentId].push(id);
      }
    });
  });

  // Encontrar raíces (commits sin padres)
  const roots = commitIds.filter((id) => commitMap[id].parentIds.length === 0);
  if (roots.length === 0 && commitIds.length > 0) {
    roots.push(commitIds[0]);
  }

  // Asignar profundidad (columna X) por orden topológico / BFS
  const depthMap: Record<string, number> = {};
  const laneMap: Record<string, number> = {}; // Fila Y
  const visited = new Set<string>();

  const queue: { id: string; depth: number; lane: number }[] = [];
  let nextAvailableLane = 0;

  roots.forEach((rootId) => {
    queue.push({ id: rootId, depth: 0, lane: nextAvailableLane++ });
  });

  while (queue.length > 0) {
    const { id, depth, lane } = queue.shift()!;
    if (visited.has(id)) {
      // Si ya fue visitado pero por un camino más largo, actualizar profundidad si es mayor
      if (depth > (depthMap[id] || 0)) {
        depthMap[id] = depth;
      }
      continue;
    }

    visited.add(id);
    depthMap[id] = Math.max(depthMap[id] || 0, depth);
    if (laneMap[id] === undefined) {
      laneMap[id] = lane;
    }

    const children = childrenMap[id] || [];
    children.forEach((childId, index) => {
      let childLane = lane;
      if (index > 0) {
        childLane = nextAvailableLane++;
      }
      queue.push({ id: childId, depth: depth + 1, lane: childLane });
    });
  }

  // Asegurar que todos los commits tengan profundidad y carril
  commitIds.forEach((id, idx) => {
    if (depthMap[id] === undefined) {
      depthMap[id] = idx;
      laneMap[id] = 0;
    }
  });

  const X_SPACING = 140;
  const Y_SPACING = 90;
  const PADDING_X = 90;
  const PADDING_Y = 80;

  const headCommitId = getHeadCommitId(state);

  const nodes: GraphNode[] = commitIds.map((id) => {
    const commit = commitMap[id];
    const lane = laneMap[id] || 0;
    const depth = depthMap[id] || 0;

    const x = PADDING_X + depth * X_SPACING;
    const y = PADDING_Y + lane * Y_SPACING;
    const color = BRANCH_COLORS[lane % BRANCH_COLORS.length];

    const branchesOnCommit = Object.values(state.branches)
      .filter((b) => b.commitId === id)
      .map((b) => b.name);

    const tagsOnCommit = Object.values(state.tags)
      .filter((t) => t.commitId === id)
      .map((t) => t.name);

    const isHead = headCommitId === id;

    return {
      commit,
      x,
      y,
      color,
      branches: branchesOnCommit,
      tags: tagsOnCommit,
      isHead,
      childrenIds: childrenMap[id] || [],
    };
  });

  const nodePosMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => nodePosMap.set(n.commit.id, { x: n.x, y: n.y }));

  // Generar aristas entre padres e hijos
  const edges: GraphLayoutResult['edges'] = [];
  nodes.forEach((node) => {
    node.commit.parentIds.forEach((parentId, pIndex) => {
      const parentPos = nodePosMap.get(parentId);
      if (parentPos) {
        edges.push({
          from: { x: parentPos.x, y: parentPos.y, id: parentId },
          to: { x: node.x, y: node.y, id: node.commit.id },
          isMerge: pIndex > 0,
          color: node.color,
        });
      }
    });
  });

  // Calcular nodo fantasma si existen archivos modificados o preparados en staging
  let ghostNode: GhostNodeLayout | null = null;
  const hasChanges = (state.workingDir && state.workingDir.length > 0) || (state.staging && state.staging.length > 0);
  if (hasChanges && headCommitId && nodePosMap.has(headCommitId)) {
    const headPos = nodePosMap.get(headCommitId)!;
    ghostNode = {
      x: headPos.x + X_SPACING,
      y: headPos.y,
      headCommitId,
      hasStaged: state.staging.length > 0,
      hasWorking: state.workingDir.length > 0,
      stagedFiles: state.staging,
      workingFiles: state.workingDir,
    };
  }

  const allX = nodes.map((n) => n.x);
  if (ghostNode) allX.push(ghostNode.x + 140);

  const maxX = Math.max(...allX, 500) + PADDING_X;
  const maxY = Math.max(...nodes.map((n) => n.y), 200) + PADDING_Y + 40;

  return {
    nodes,
    edges,
    width: Math.max(maxX, 700),
    height: Math.max(maxY, 320),
    ghostNode,
  };
};

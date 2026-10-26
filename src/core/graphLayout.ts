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

  // Parámetros de disposición vertical del grafo (carriles de ramas en columnas X, progreso en filas Y)
  const CAPSULE_HALF_HEIGHT = 14;
  const LANE_SPACING = 240; // Espaciado horizontal entre carriles/ramas
  const ROW_SPACING = 85;   // Espaciado vertical entre commits sucesivos
  const PADDING_X = 110;
  const PADDING_Y = 55;

  const headCommitId = getHeadCommitId(state);

  const nodes: GraphNode[] = commitIds.map((id) => {
    const commit = commitMap[id];
    const lane = laneMap[id] || 0;
    const depth = depthMap[id] || 0;

    // Disposición vertical: X es el carril de la rama, Y es la profundidad en el tiempo
    const x = PADDING_X + lane * LANE_SPACING;
    const y = PADDING_Y + depth * ROW_SPACING;
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

  // Generar aristas verticales conectando el extremo inferior del padre con el superior del hijo
  const edges: GraphLayoutResult['edges'] = [];
  nodes.forEach((node) => {
    node.commit.parentIds.forEach((parentId, pIndex) => {
      const parentPos = nodePosMap.get(parentId);
      if (parentPos) {
        edges.push({
          from: { x: parentPos.x, y: parentPos.y + CAPSULE_HALF_HEIGHT, id: parentId },
          to: { x: node.x, y: node.y - CAPSULE_HALF_HEIGHT, id: node.commit.id },
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
      x: headPos.x, // Mismo carril vertical que HEAD
      y: headPos.y + ROW_SPACING, // Fila siguiente hacia abajo
      headCommitId,
      hasStaged: state.staging.length > 0,
      hasWorking: state.workingDir.length > 0,
      stagedFiles: state.staging,
      workingFiles: state.workingDir,
    };
  }

  const allX = nodes.map((n) => n.x);
  const maxX = Math.max(...allX, 350) + 260; // Espacio suficiente para las etiquetas de ramas a la derecha

  const allY = nodes.map((n) => n.y);
  if (ghostNode) allY.push(ghostNode.y + 40);
  const maxY = Math.max(...allY, 200) + PADDING_Y + 40;

  return {
    nodes,
    edges,
    width: Math.max(maxX, 700),
    height: Math.max(maxY, 320),
    ghostNode,
  };
};

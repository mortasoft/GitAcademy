import { GitState, GraphNode, BranchLaneLayout } from '../types/git';
import { getHeadCommitId } from './gitEngine';

export const BRANCH_COLORS = [
  '#3B82F6', // Blue (main/master)
  '#10B981', // Green (feature)
  '#F59E0B', // Amber (hotfix)
  '#EC4899', // Pink (dev)
  '#8B5CF6', // Purple (release)
  '#06B6D4', // Cyan
  '#E11D48', // Rose
  '#14B8A6', // Teal
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
  branchLanes: BranchLaneLayout[];
  railBottomY: number;
}

export const computeGraphLayout = (state: GitState): GraphLayoutResult => {
  const commitMap = state.commits;
  const commitIds = Object.keys(commitMap);

  // 1. Obtener lista ordenada de ramas: main/master siempre primero
  const branchNames = Object.keys(state.branches);
  if (branchNames.length === 0) {
    branchNames.push('main');
  }

  const sortedBranchNames = [...branchNames].sort((a, b) => {
    if (a === 'main' || a === 'master') return -1;
    if (b === 'main' || b === 'master') return 1;
    return a.localeCompare(b);
  });

  const branchToLaneIndex: Record<string, number> = {};
  sortedBranchNames.forEach((name, idx) => {
    branchToLaneIndex[name] = idx;
  });

  if (commitIds.length === 0) {
    const branchLanes: BranchLaneLayout[] = sortedBranchNames.map((name, idx) => ({
      name,
      laneIndex: idx,
      color: BRANCH_COLORS[idx % BRANCH_COLORS.length],
      x: 130 + idx * 240,
      isCurrent: state.head.type === 'branch' && state.head.target === name,
      commitId: '',
      hasOwnCommits: false,
    }));
    return { nodes: [], edges: [], width: 750, height: 350, branchLanes, railBottomY: 350 };
  }

  // 2. Mapear hijos de cada commit
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

  // 3. Asignar commits a ramas trazando historial (ancestry de primer padre)
  const commitBranchMap: Record<string, string> = {};

  // Rastrear rama principal (main / master)
  const mainBranchName = sortedBranchNames.find((b) => b === 'main' || b === 'master') || sortedBranchNames[0];
  if (mainBranchName && state.branches[mainBranchName]) {
    let curr: string | undefined = state.branches[mainBranchName].commitId;
    while (curr && commitMap[curr]) {
      commitBranchMap[curr] = mainBranchName;
      const parents: string[] = commitMap[curr].parentIds;
      curr = parents.length > 0 ? parents[0] : undefined;
    }
  }

  // Rastrear el resto de ramas hasta topar con un commit ya asignado
  sortedBranchNames.forEach((bName) => {
    if (bName === mainBranchName) return;
    const branchObj = state.branches[bName];
    if (!branchObj) return;
    let curr: string | undefined = branchObj.commitId;
    while (curr && commitMap[curr]) {
      if (commitBranchMap[curr]) {
        break; // Punto de bifurcación alcanzado
      }
      commitBranchMap[curr] = bName;
      const parents: string[] = commitMap[curr].parentIds;
      curr = parents.length > 0 ? parents[0] : undefined;
    }
  });

  // Si quedan commits sin asignar (ej. commits huérfanos o en ramas borradas)
  let extraLane = sortedBranchNames.length;
  commitIds.forEach((id) => {
    if (!commitBranchMap[id]) {
      const parent = commitMap[id].parentIds[0];
      if (parent && commitBranchMap[parent]) {
        commitBranchMap[id] = commitBranchMap[parent];
      } else {
        commitBranchMap[id] = `lane-${extraLane++}`;
      }
    }
  });

  // 4. Orden topológico para garantizar que ningún commit preceda a sus padres
  const orderedCommitIds: string[] = [];
  const visited = new Set<string>();

  const visit = (id: string) => {
    if (visited.has(id) || !commitMap[id]) return;
    commitMap[id].parentIds.forEach((pId) => visit(pId));
    visited.add(id);
    orderedCommitIds.push(id);
  };

  commitIds.forEach((id) => visit(id));

  // Asignar profundidad cronológica garantizando Y_hijo > Y_padre
  const depthMap: Record<string, number> = {};
  orderedCommitIds.forEach((id, index) => {
    const commit = commitMap[id];
    const minDepth = commit.parentIds.length > 0
      ? Math.max(...commit.parentIds.map((pId) => (depthMap[pId] ?? 0) + 1))
      : 0;
    depthMap[id] = Math.max(minDepth, index);
  });

  // Parámetros de disposición vertical del grafo
  const CAPSULE_HALF_HEIGHT = 14;
  const LANE_SPACING = 240; // Espaciado horizontal entre carriles/ramas
  const ROW_SPACING = 85;   // Espaciado vertical entre filas de commits
  const PADDING_X = 130;
  const PADDING_Y = 110;    // Espacio superior para los encabezados interactivos de ramas

  const headCommitId = getHeadCommitId(state);

  // 5. Generar nodos de commits
  const nodes: GraphNode[] = commitIds.map((id) => {
    const commit = commitMap[id];
    const assignedBranch = commitBranchMap[id];
    const lane = branchToLaneIndex[assignedBranch] !== undefined
      ? branchToLaneIndex[assignedBranch]
      : (sortedBranchNames.length);

    const depth = depthMap[id] ?? 0;

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

  // 6. Generar aristas verticales conectando el extremo inferior del padre con el superior del hijo
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

  // 7. Calcular nodo fantasma si existen cambios de trabajo / staging
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

  // 8. Construir carriles de ramas (Branch Lanes)
  const branchLanes: BranchLaneLayout[] = sortedBranchNames.map((name, idx) => {
    const color = BRANCH_COLORS[idx % BRANCH_COLORS.length];
    const x = PADDING_X + idx * LANE_SPACING;
    const isCurrent = state.head.type === 'branch' && state.head.target === name;
    const branchObj = state.branches[name];
    const commitId = branchObj ? branchObj.commitId : (headCommitId || '');
    const hasOwnCommits = Object.values(commitBranchMap).includes(name);

    const originPos = commitId && nodePosMap.has(commitId)
      ? nodePosMap.get(commitId)
      : undefined;

    return {
      name,
      laneIndex: idx,
      color,
      x,
      isCurrent,
      commitId,
      hasOwnCommits,
      originCommitId: commitId,
      originPos,
    };
  });

  // 9. Dimensiones del canvas
  const allX = [
    ...nodes.map((n) => n.x),
    ...branchLanes.map((b) => b.x),
  ];
  const maxX = Math.max(...allX, 350) + 260; // Espacio para las etiquetas de ramas a la derecha

  const allY = nodes.map((n) => n.y);
  if (ghostNode) allY.push(ghostNode.y + 40);
  const maxY = Math.max(...allY, 200) + 60;
  const railBottomY = maxY - 20;

  return {
    nodes,
    edges,
    width: Math.max(maxX, 750),
    height: Math.max(maxY, 350),
    ghostNode,
    branchLanes,
    railBottomY,
  };
};

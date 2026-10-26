import { GitState, GitCommit, GitBranch, GitTag } from '../types/git';

export const createInitialGitState = (): GitState => {
  return {
    commits: {
      c1: {
        id: 'c1',
        parentIds: [],
        message: 'Initial commit (README.md)',
        author: 'Estudiante <estudiante@gitacademy.dev>',
        timestamp: Date.now() - 3600000,
      },
    },
    branches: {
      main: {
        name: 'main',
        commitId: 'c1',
      },
    },
    tags: {},
    head: {
      type: 'branch',
      target: 'main',
    },
    staging: [],
    workingDir: ['index.html'],
    stash: [],
  };
};

let commitCounter = 2;
export const generateCommitId = (): string => {
  const id = `c${commitCounter}`;
  commitCounter++;
  return id;
};

export const resetCommitCounter = (startFrom: number = 2) => {
  commitCounter = startFrom;
};

// Obtiene el commit ID actual apuntado por HEAD
export const getHeadCommitId = (state: GitState): string | null => {
  if (state.head.type === 'branch') {
    const branch = state.branches[state.head.target];
    return branch ? branch.commitId : null;
  }
  return state.head.target || null;
};

// Verifica si commitA es ancestro de commitB
export const isAncestor = (ancestorId: string, targetId: string, commits: Record<string, GitCommit>): boolean => {
  if (ancestorId === targetId) return true;
  const visited = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === ancestorId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const node = commits[current];
    if (node && node.parentIds) {
      for (const p of node.parentIds) {
        queue.push(p);
      }
    }
  }
  return false;
};

// Obtiene la lista de commits desde root hasta un commit dado
export const getCommitHistory = (startId: string, commits: Record<string, GitCommit>): GitCommit[] => {
  const result: GitCommit[] = [];
  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const commit = commits[currentId];
    if (commit) {
      result.push(commit);
      if (commit.parentIds) {
        for (const p of commit.parentIds) {
          queue.push(p);
        }
      }
    }
  }
  return result;
};

// Motor de ejecución de operaciones Git
export class GitEngine {
  // git commit -m "..."
  static commit(state: GitState, message: string = 'Update code'): { newState: GitState; output: string } {
    const headCommitId = getHeadCommitId(state);
    const newId = generateCommitId();
    const parentIds = headCommitId ? [headCommitId] : [];

    const newCommit: GitCommit = {
      id: newId,
      parentIds,
      message,
      author: 'Estudiante <estudiante@gitacademy.dev>',
      timestamp: Date.now(),
    };

    const newCommits = {
      ...state.commits,
      [newId]: newCommit,
    };

    const newBranches = { ...state.branches };
    const newHead = { ...state.head };

    if (state.head.type === 'branch') {
      const branchName = state.head.target;
      if (newBranches[branchName]) {
        newBranches[branchName] = {
          ...newBranches[branchName],
          commitId: newId,
        };
      }
    } else {
      newHead.target = newId;
    }

    return {
      newState: {
        ...state,
        commits: newCommits,
        branches: newBranches,
        head: newHead,
        staging: [],
        workingDir: [],
      },
      output: `[${state.head.type === 'branch' ? state.head.target : 'HEAD desacoplado'} ${newId}] ${message}\n 1 file changed, 1 insertion(+)`,
    };
  }

  // git branch <branchName>
  static createBranch(state: GitState, branchName: string): { newState: GitState; output: string; success: boolean } {
    if (state.branches[branchName]) {
      return {
        newState: state,
        output: `fatal: ya existe una rama llamada '${branchName}'.`,
        success: false,
      };
    }

    const headCommitId = getHeadCommitId(state);
    if (!headCommitId) {
      return {
        newState: state,
        output: `fatal: no es un repositorio válido o no tiene commits aún.`,
        success: false,
      };
    }

    const newBranch: GitBranch = {
      name: branchName,
      commitId: headCommitId,
    };

    return {
      newState: {
        ...state,
        branches: {
          ...state.branches,
          [branchName]: newBranch,
        },
      },
      output: `Rama '${branchName}' creada en el commit ${headCommitId}.`,
      success: true,
    };
  }

  // git branch -d <branchName>
  static deleteBranch(state: GitState, branchName: string, _force: boolean = false): { newState: GitState; output: string; success: boolean } {
    if (!state.branches[branchName]) {
      return {
        newState: state,
        output: `error: rama '${branchName}' no encontrada.`,
        success: false,
      };
    }

    if (state.head.type === 'branch' && state.head.target === branchName) {
      return {
        newState: state,
        output: `error: no puedes eliminar la rama '${branchName}' en la que te encuentras actualmente. Cambia de rama primero.`,
        success: false,
      };
    }

    const newBranches = { ...state.branches };
    delete newBranches[branchName];

    return {
      newState: {
        ...state,
        branches: newBranches,
      },
      output: `Eliminada la rama ${branchName} (era ${state.branches[branchName].commitId}).`,
      success: true,
    };
  }

  // git checkout <target> / git switch <target>
  static checkout(state: GitState, target: string, createNewBranch: boolean = false): { newState: GitState; output: string; success: boolean } {
    if (createNewBranch) {
      if (state.branches[target]) {
        return {
          newState: state,
          output: `fatal: ya existe una rama llamada '${target}'.`,
          success: false,
        };
      }
      const headCommitId = getHeadCommitId(state);
      if (!headCommitId) {
        return {
          newState: state,
          output: `fatal: no hay commits disponibles para bifurcar.`,
          success: false,
        };
      }

      const newBranches = {
        ...state.branches,
        [target]: {
          name: target,
          commitId: headCommitId,
        },
      };

      return {
        newState: {
          ...state,
          branches: newBranches,
          head: {
            type: 'branch',
            target,
          },
        },
        output: `Cambiado a una nueva rama '${target}'`,
        success: true,
      };
    }

    // Checkout rama existente
    if (state.branches[target]) {
      return {
        newState: {
          ...state,
          head: {
            type: 'branch',
            target,
          },
        },
        output: `Cambiado a la rama '${target}'`,
        success: true,
      };
    }

    // Checkout commit (HEAD desacoplado)
    if (state.commits[target]) {
      return {
        newState: {
          ...state,
          head: {
            type: 'detached',
            target,
          },
        },
        output: `Nota: cambiando a '${target}'.\nEstás en estado de 'HEAD desacoplado'. Puedes examinar y experimentar aquí.`,
        success: true,
      };
    }

    return {
      newState: state,
      output: `error: ruta spec '${target}' no coincide con ningún archivo(s) o rama conocida por Git.`,
      success: false,
    };
  }

  // git merge <targetBranch>
  static merge(state: GitState, targetBranch: string): { newState: GitState; output: string; success: boolean } {
    const target = state.branches[targetBranch];
    if (!target) {
      return {
        newState: state,
        output: `merge: ${targetBranch} - no es algo que podamos fusionar.`,
        success: false,
      };
    }

    const currentHeadCommit = getHeadCommitId(state);
    if (!currentHeadCommit) {
      return {
        newState: state,
        output: `fatal: no se puede fusionar sin un commit actual.`,
        success: false,
      };
    }

    if (currentHeadCommit === target.commitId) {
      return {
        newState: state,
        output: `Ya actualizado (Already up to date).`,
        success: true,
      };
    }

    const currentBranchName = state.head.type === 'branch' ? state.head.target : null;

    // Caso 1: Fast-Forward (si el commit actual es ancestro del target)
    if (isAncestor(currentHeadCommit, target.commitId, state.commits)) {
      const newBranches = { ...state.branches };
      if (currentBranchName) {
        newBranches[currentBranchName] = {
          ...newBranches[currentBranchName],
          commitId: target.commitId,
        };
      }

      const newHead = state.head.type === 'detached'
        ? { type: 'detached' as const, target: target.commitId }
        : state.head;

      return {
        newState: {
          ...state,
          branches: newBranches,
          head: newHead,
        },
        output: `Actualizando ${currentHeadCommit}..${target.commitId}\nFast-forward\n 1 file changed, 2 insertions(+)`,
        success: true,
      };
    }

    // Caso 2: 3-Way Merge (crear nuevo commit con dos padres)
    const newCommitId = generateCommitId();
    const mergeCommit: GitCommit = {
      id: newCommitId,
      parentIds: [currentHeadCommit, target.commitId],
      message: `Merge branch '${targetBranch}' into ${currentBranchName || 'HEAD'}`,
      author: 'Estudiante <estudiante@gitacademy.dev>',
      timestamp: Date.now(),
    };

    const newCommits = {
      ...state.commits,
      [newCommitId]: mergeCommit,
    };

    const newBranches = { ...state.branches };
    if (currentBranchName) {
      newBranches[currentBranchName] = {
        ...newBranches[currentBranchName],
        commitId: newCommitId,
      };
    }

    const newHead = state.head.type === 'detached'
      ? { type: 'detached' as const, target: newCommitId }
      : state.head;

    return {
      newState: {
        ...state,
        commits: newCommits,
        branches: newBranches,
        head: newHead,
      },
      output: `Fusionando ramas '${targetBranch}' y '${currentBranchName}'.\nCommit de fusión creado: ${newCommitId}`,
      success: true,
    };
  }

  // git rebase <baseBranch>
  static rebase(state: GitState, baseBranch: string): { newState: GitState; output: string; success: boolean } {
    const base = state.branches[baseBranch];
    if (!base) {
      return {
        newState: state,
        output: `fatal: rama '${baseBranch}' no encontrada para rebase.`,
        success: false,
      };
    }

    const currentHeadCommit = getHeadCommitId(state);
    if (!currentHeadCommit) {
      return {
        newState: state,
        output: `fatal: no hay commits en la rama actual.`,
        success: false,
      };
    }

    if (currentHeadCommit === base.commitId) {
      return {
        newState: state,
        output: `La rama actual ya está al día con '${baseBranch}'.`,
        success: true,
      };
    }

    // Recolectar commits exclusivos de la rama actual desde que se separó de base
    const commitsToReplay: GitCommit[] = [];
    let curr = currentHeadCommit;

    while (curr && curr !== base.commitId && !isAncestor(curr, base.commitId, state.commits)) {
      const commit = state.commits[curr];
      if (!commit) break;
      commitsToReplay.unshift(commit);
      curr = commit.parentIds[0] || '';
    }

    if (commitsToReplay.length === 0) {
      return {
        newState: state,
        output: `La rama actual no tiene commits que rebasar sobre '${baseBranch}'.`,
        success: true,
      };
    }

    let parentPointer = base.commitId;
    const newCommits = { ...state.commits };

    for (const oldCommit of commitsToReplay) {
      const newId = generateCommitId();
      newCommits[newId] = {
        id: newId,
        parentIds: [parentPointer],
        message: `${oldCommit.message} (rebased)`,
        author: oldCommit.author,
        timestamp: Date.now(),
      };
      parentPointer = newId;
    }

    const currentBranchName = state.head.type === 'branch' ? state.head.target : null;
    const newBranches = { ...state.branches };

    if (currentBranchName) {
      newBranches[currentBranchName] = {
        ...newBranches[currentBranchName],
        commitId: parentPointer,
      };
    }

    const newHead = state.head.type === 'detached'
      ? { type: 'detached' as const, target: parentPointer }
      : state.head;

    return {
      newState: {
        ...state,
        commits: newCommits,
        branches: newBranches,
        head: newHead,
      },
      output: `Rebase aplicado con éxito sobre ${baseBranch}.\nHEAD ahora apunta al commit rebasado ${parentPointer}.`,
      success: true,
    };
  }

  // git cherry-pick <commitId>
  static cherryPick(state: GitState, commitId: string): { newState: GitState; output: string; success: boolean } {
    const sourceCommit = state.commits[commitId];
    if (!sourceCommit) {
      return {
        newState: state,
        output: `fatal: commit '${commitId}' no existe.`,
        success: false,
      };
    }

    const currentHeadCommit = getHeadCommitId(state);
    const newId = generateCommitId();
    const newCommit: GitCommit = {
      id: newId,
      parentIds: currentHeadCommit ? [currentHeadCommit] : [],
      message: `${sourceCommit.message} (cherry-picked)`,
      author: sourceCommit.author,
      timestamp: Date.now(),
    };

    const newCommits = {
      ...state.commits,
      [newId]: newCommit,
    };

    const newBranches = { ...state.branches };
    if (state.head.type === 'branch') {
      const b = state.head.target;
      newBranches[b] = {
        ...newBranches[b],
        commitId: newId,
      };
    }

    const newHead = state.head.type === 'detached'
      ? { type: 'detached' as const, target: newId }
      : state.head;

    return {
      newState: {
        ...state,
        commits: newCommits,
        branches: newBranches,
        head: newHead,
      },
      output: `[${state.head.type === 'branch' ? state.head.target : 'HEAD desacoplado'} ${newId}] ${sourceCommit.message}\n Cherry-pick completado exitosamente.`,
      success: true,
    };
  }

  // git reset [--soft|--mixed|--hard] <target>
  static reset(state: GitState, targetCommitId: string, mode: 'soft' | 'mixed' | 'hard' = 'mixed'): { newState: GitState; output: string; success: boolean } {
    // Si se pasa HEAD~1 o HEAD~2
    let actualTarget = targetCommitId;
    if (targetCommitId.startsWith('HEAD~')) {
      const count = parseInt(targetCommitId.replace('HEAD~', ''), 10) || 1;
      let curr = getHeadCommitId(state);
      for (let i = 0; i < count; i++) {
        if (curr && state.commits[curr] && state.commits[curr].parentIds.length > 0) {
          curr = state.commits[curr].parentIds[0];
        }
      }
      if (curr) actualTarget = curr;
    }

    if (!state.commits[actualTarget]) {
      return {
        newState: state,
        output: `fatal: commit '${targetCommitId}' no válido.`,
        success: false,
      };
    }

    const newBranches = { ...state.branches };
    if (state.head.type === 'branch') {
      const b = state.head.target;
      newBranches[b] = {
        ...newBranches[b],
        commitId: actualTarget,
      };
    }

    const newHead = state.head.type === 'detached'
      ? { type: 'detached' as const, target: actualTarget }
      : state.head;

    let staging = state.staging;
    let workingDir = state.workingDir;

    if (mode === 'hard') {
      staging = [];
      workingDir = [];
    } else if (mode === 'mixed') {
      staging = [];
      workingDir = ['cambios-restaurados.txt'];
    } else if (mode === 'soft') {
      staging = ['cambios-preservados-en-staging.txt'];
    }

    return {
      newState: {
        ...state,
        branches: newBranches,
        head: newHead,
        staging,
        workingDir,
      },
      output: `HEAD ahora está en ${actualTarget} (${mode})\n${state.commits[actualTarget].message}`,
      success: true,
    };
  }

  // git revert <commitId>
  static revert(state: GitState, commitId: string): { newState: GitState; output: string; success: boolean } {
    const targetCommit = state.commits[commitId];
    if (!targetCommit) {
      return {
        newState: state,
        output: `fatal: commit '${commitId}' no encontrado para revertir.`,
        success: false,
      };
    }

    const res = this.commit(state, `Revert "${targetCommit.message}"`);
    return {
      ...res,
      success: true,
    };
  }

  // git tag <tagName>
  static tag(state: GitState, tagName: string): { newState: GitState; output: string; success: boolean } {
    const headCommitId = getHeadCommitId(state);
    if (!headCommitId) {
      return {
        newState: state,
        output: `fatal: no hay commit en el cual poner la etiqueta.`,
        success: false,
      };
    }

    if (state.tags[tagName]) {
      return {
        newState: state,
        output: `fatal: tag '${tagName}' ya existe.`,
        success: false,
      };
    }

    const newTags: Record<string, GitTag> = {
      ...state.tags,
      [tagName]: {
        name: tagName,
        commitId: headCommitId,
      },
    };

    return {
      newState: {
        ...state,
        tags: newTags,
      },
      output: `Etiqueta '${tagName}' creada en ${headCommitId}.`,
      success: true,
    };
  }
}

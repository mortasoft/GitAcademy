import { GitState, GitCommit, GitBranch, GitTag } from '../types/git';

// Mapeo determinista de hashes de 7 caracteres para commits didácticos
export const COMMIT_HASH_TABLE: Record<string, string> = {
  c1: '6b4550a',
  c2: '37d1a4e',
  c3: '9bfa8f3',
  c4: 'a699327',
  c5: '28fd4a8',
  c6: '75278aa',
  c7: 'd7b539d',
  c8: 'f1e04cb',
  c9: 'e39a512',
  c10: '5ca28df',
};

export const getCommitHash = (commitOrId: GitCommit | string, fallbackIndex: number = 0): string => {
  if (typeof commitOrId === 'string') {
    if (COMMIT_HASH_TABLE[commitOrId]) return COMMIT_HASH_TABLE[commitOrId];
    if (/^[0-9a-f]{7}$/i.test(commitOrId)) return commitOrId.toLowerCase();
    let h = 0;
    for (let i = 0; i < commitOrId.length; i++) {
      h = (h << 5) - h + commitOrId.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(16).padStart(7, 'a').slice(0, 7);
  }
  if (commitOrId.hash) return commitOrId.hash;
  if (COMMIT_HASH_TABLE[commitOrId.id]) return COMMIT_HASH_TABLE[commitOrId.id];
  if (/^[0-9a-f]{7}$/i.test(commitOrId.id)) return commitOrId.id.toLowerCase();
  return getCommitHash(commitOrId.id, fallbackIndex);
};

export const createInitialGitState = (): GitState => {
  return {
    commits: {
      c1: {
        id: 'c1',
        hash: '6b4550a',
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
    workingDir: [],
    stash: [],
    remotes: {
      origin: 'https://github.com/estudiante/proyecto.git',
    },
  };
};

const HEX_POOL = ['37d1a4e', '9bfa8f3', 'a699327', '28fd4a8', '75278aa', 'd7b539d', 'f1e04cb', 'e39a512', '5ca28df'];
let poolIndex = 0;

export const generateCommitId = (): string => {
  if (poolIndex < HEX_POOL.length) {
    const id = HEX_POOL[poolIndex];
    poolIndex++;
    return id;
  }
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 7; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export const resetCommitCounter = (startFrom: number = 0) => {
  poolIndex = Math.max(0, startFrom - 1);
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

  // Busca un commit por ID exacto, hash completo, prefijo de hash o alias didáctico (c1, c2, etc.)
  static findCommit(state: GitState, query: string): GitCommit | undefined {
    if (!query) return undefined;
    const q = query.trim().toLowerCase();

    // 1. Coincidencia directa por clave
    if (state.commits[q]) return state.commits[q];
    if (state.commits[query]) return state.commits[query];

    // 2. Coincidencia por hash o prefijo de hash
    for (const c of Object.values(state.commits)) {
      const h = getCommitHash(c);
      if (h.toLowerCase() === q || h.toLowerCase().startsWith(q)) return c;
      if (c.id.toLowerCase() === q || c.id.toLowerCase().startsWith(q)) return c;
    }

    // 3. Coincidencia por alias didáctico c1, c2, c3...
    const match = q.match(/^c(\d+)$/i);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      const all = Object.values(state.commits);
      if (all[idx]) return all[idx];
    }

    return undefined;
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
    const commitMatch = GitEngine.findCommit(state, target);
    if (commitMatch) {
      const displayHash = getCommitHash(commitMatch);
      return {
        newState: {
          ...state,
          head: {
            type: 'detached',
            target: commitMatch.id,
          },
        },
        output: `Nota: cambiando a '${displayHash}'.\nEstás en estado de 'HEAD desacoplado'. Puedes examinar y experimentar aquí.`,
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
    const sourceCommit = GitEngine.findCommit(state, commitId);
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
      cherryPickFrom: sourceCommit.id,
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
    } else {
      const matched = GitEngine.findCommit(state, targetCommitId);
      if (matched) {
        actualTarget = matched.id;
      }
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
    const targetCommit = GitEngine.findCommit(state, commitId);
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

  // git remote [-v] / git remote add <name> <url>
  static remote(state: GitState, args: string[]): { newState: GitState; output: string; success: boolean } {
    const remotes = state.remotes || { origin: 'https://github.com/estudiante/proyecto.git' };
    const isVerbose = args.includes('-v') || args.includes('--verbose');

    if (args[0] === 'add') {
      const name = args[1];
      const url = args[2];
      if (!name || !url) {
        return {
          newState: state,
          output: 'Uso: git remote add <nombre> <url>',
          success: false,
        };
      }
      return {
        newState: {
          ...state,
          remotes: {
            ...remotes,
            [name]: url,
          },
        },
        output: '',
        success: true,
      };
    }

    if (isVerbose) {
      const lines = Object.entries(remotes).map(([name, url]) => `${name}\t${url} (fetch)\n${name}\t${url} (push)`);
      return {
        newState: state,
        output: lines.join('\n') || 'No hay remotos configurados.',
        success: true,
      };
    }

    return {
      newState: state,
      output: Object.keys(remotes).join('\n') || 'No hay remotos configurados.',
      success: true,
    };
  }

  // git clone <url>
  static clone(state: GitState, url: string): { newState: GitState; output: string; success: boolean } {
    if (!url) {
      return {
        newState: state,
        output: 'fatal: Debes especificar un repositorio para clonar.\nUso: git clone <url>',
        success: false,
      };
    }

    const cleanUrl = url.trim().replace(/\/$/, '');
    const repoMatch = cleanUrl.match(/\/([^/]+?)(?:\.git)?$/);
    const repoName = repoMatch ? repoMatch[1] : 'proyecto';

    const c1Id = 'c1';
    const c2Id = 'c2';
    const c3Id = 'c3';

    const commits: Record<string, GitCommit> = {
      [c1Id]: {
        id: c1Id,
        hash: '6b4550a',
        parentIds: [],
        message: 'Initial commit (README.md)',
        author: 'Lead Developer <lead@empresa.com>',
        timestamp: Date.now() - 7200000,
      },
      [c2Id]: {
        id: c2Id,
        hash: '37d1a4e',
        parentIds: [c1Id],
        message: 'feat: add core components and design tokens',
        author: 'Frontend Dev <frontend@empresa.com>',
        timestamp: Date.now() - 3600000,
      },
      [c3Id]: {
        id: c3Id,
        hash: '9bfa8f3',
        parentIds: [c2Id],
        message: 'feat: setup api client & router',
        author: 'Fullstack Dev <fullstack@empresa.com>',
        timestamp: Date.now() - 1800000,
      },
    };

    const branches: Record<string, GitBranch> = {
      main: { name: 'main', commitId: c3Id },
      'origin/main': { name: 'origin/main', commitId: c3Id, isRemote: true },
    };

    const newState: GitState = {
      commits,
      branches,
      tags: {},
      head: { type: 'branch', target: 'main' },
      staging: [],
      workingDir: [],
      stash: [],
      remotes: { origin: cleanUrl },
    };

    const output = [
      `Clonando en '${repoName}'...`,
      `remote: Enumerando objetos: 8, listo.`,
      `remote: Contando objetos: 100% (8/8), listo.`,
      `remote: Comprimiendo objetos: 100% (6/6), listo.`,
      `remote: Total 8 (delta 2), reusados 8 (delta 2)`,
      `Recibiendo objetos: 100% (8/8), listo.`,
      `Resolviendo deltas: 100% (2/2), listo.`,
      `Configurado remoto 'origin' -> ${cleanUrl}`,
      `Rama 'main' configurada para rastrear la rama remota 'main' de 'origin'.`,
      `Cambiado a nueva rama 'main'`,
    ].join('\n');

    return {
      newState,
      output,
      success: true,
    };
  }

  // git push [remote] [branch]
  static push(state: GitState, args: string[]): { newState: GitState; output: string; success: boolean } {
    if (state.head.type === 'detached') {
      return {
        newState: state,
        output: 'fatal: Estás actualmente en un estado de HEAD desacoplado. No puedes hacer push sin una rama.',
        success: false,
      };
    }

    const currentBranch = state.head.target;
    let targetBranch = currentBranch;

    // Detectar argumentos opcionales como `origin mi-rama` o `-u origin mi-rama`
    const nonFlags = args.filter((a) => !a.startsWith('-'));
    if (nonFlags.length >= 2) {
      targetBranch = nonFlags[1];
    }

    const localBranch = state.branches[targetBranch];
    if (!localBranch) {
      return {
        newState: state,
        output: `error: src refspec ${targetBranch} no coincide con ninguna rama local existente.`,
        success: false,
      };
    }

    const remoteBranchName = `origin/${targetBranch}`;
    const remoteBranch = state.branches[remoteBranchName];
    const remoteUrl = state.remotes?.origin || 'https://github.com/estudiante/proyecto.git';

    if (remoteBranch && remoteBranch.commitId === localBranch.commitId) {
      return {
        newState: state,
        output: 'Everything up-to-date (Todo está actualizado en el remoto).',
        success: true,
      };
    }

    const fromHash = remoteBranch ? getCommitHash(remoteBranch.commitId) : '[nueva rama]';
    const toHash = getCommitHash(localBranch.commitId);

    const updatedBranches = {
      ...state.branches,
      [remoteBranchName]: {
        name: remoteBranchName,
        commitId: localBranch.commitId,
        isRemote: true,
      },
    };

    const output = [
      `Enumerando objetos: 5, hecho.`,
      `Contando objetos: 100% (5/5), listo.`,
      `Comprimiendo objetos: 100% (3/3), listo.`,
      `Escribiendo objetos: 100% (3/3), listo.`,
      `Total 3 (delta 1), reusados 0 (delta 0)`,
      `A ${remoteUrl}`,
      remoteBranch
        ? `   ${fromHash}..${toHash}  ${targetBranch} -> ${targetBranch}`
        : ` * [nueva rama]      ${targetBranch} -> ${targetBranch}`,
      `Rama '${targetBranch}' configurada para rastrear 'origin/${targetBranch}'.`,
    ].join('\n');

    return {
      newState: {
        ...state,
        branches: updatedBranches,
      },
      output,
      success: true,
    };
  }

  // git pull [remote] [branch]
  static pull(state: GitState, _args: string[]): { newState: GitState; output: string; success: boolean } {
    if (state.head.type === 'detached') {
      return {
        newState: state,
        output: 'fatal: Estás actualmente en un estado de HEAD desacoplado. No puedes hacer pull sin una rama.',
        success: false,
      };
    }

    const currentBranch = state.head.target;
    const remoteBranchName = `origin/${currentBranch}`;
    const remoteBranch = state.branches[remoteBranchName];
    const localBranch = state.branches[currentBranch];

    if (!remoteBranch) {
      return {
        newState: state,
        output: `No hay información de seguimiento para la rama actual '${currentBranch}'.\nEspecifica qué rama remota deseas fusionar:\n    git pull <remoto> <rama>`,
        success: false,
      };
    }

    if (remoteBranch.commitId === localBranch.commitId) {
      return {
        newState: state,
        output: 'Ya está actualizado (Already up to date).',
        success: true,
      };
    }

    const fromHash = getCommitHash(localBranch.commitId);
    const toHash = getCommitHash(remoteBranch.commitId);

    const updatedBranches = {
      ...state.branches,
      [currentBranch]: {
        ...localBranch,
        commitId: remoteBranch.commitId,
      },
    };

    const output = [
      `Actualizando ${fromHash}..${toHash}`,
      `Fast-forward`,
      ` app.ts | 15 +++++++++++++++`,
      ` 1 archivo cambiado, 15 inserciones(+)`,
    ].join('\n');

    return {
      newState: {
        ...state,
        branches: updatedBranches,
      },
      output,
      success: true,
    };
  }
}

export interface GitCommit {
  id: string; // short hash o id didáctico, ej. 'c1', '6b4550a'
  hash?: string; // hash hexadecimal SHA de 7 caracteres (ej. '6b4550a')
  parentIds: string[]; // parents (2 for merge commits)
  message: string;
  author: string;
  timestamp: number;
}

export interface GitBranch {
  name: string;
  commitId: string;
  isRemote?: boolean;
}

export interface GitTag {
  name: string;
  commitId: string;
}

export interface GitStashItem {
  id: string;
  message: string;
  commitId: string;
}

export interface GitState {
  commits: Record<string, GitCommit>;
  branches: Record<string, GitBranch>;
  tags: Record<string, GitTag>;
  head: {
    type: 'branch' | 'detached';
    target: string; // branch name or commit id
  };
  staging: string[]; // staged simulated files
  workingDir: string[]; // modified simulated files
  stash: GitStashItem[];
}

export interface CommandResult {
  success: boolean;
  output: string;
  newState?: GitState;
  animation?: {
    type: 'commit' | 'branch' | 'merge' | 'rebase' | 'reset' | 'checkout';
    targetId?: string;
  };
}

export interface GraphNode {
  commit: GitCommit;
  x: number;
  y: number;
  color: string;
  branches: string[];
  tags: string[];
  isHead: boolean;
  childrenIds: string[];
}

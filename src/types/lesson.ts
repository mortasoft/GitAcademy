import { GitState } from './git';

export type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzado';

export interface LessonGoal {
  description: string;
  check: (state: GitState) => boolean;
}

export interface LessonStep {
  title: string;
  explanation: string;
  commandSuggestion?: string;
  codeBlock?: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface WhenToUseExample {
  title: string;
  scenario: string;
  recommendation: 'recomendado' | 'evitar';
  command?: string;
}

export interface Lesson {
  id: string;
  levelId: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  timeEstimate: string; // e.g. "5 min"
  summary: string;
  initialState: GitState;
  steps: LessonStep[];
  goalDescription: string;
  solutionCommands: string[];
  tips: string[];
  whenToUse?: WhenToUseExample[];
  isGitHubGuide?: boolean; // For real GitHub workflow lessons
  gitHubGuideContent?: {
    overview: string;
    steps: {
      action: string;
      details: string;
      commandOrUrl?: string;
      tip?: string;
      imageUrl?: string;
      imageCaption?: string;
      mockupType?: 'branch-selector' | 'pull-request' | 'history-stash' | 'conflict-resolver' | 'branches-dialog';
    }[];
  };
}

export interface CurriculumLevel {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
}

export interface CheatsheetItem {
  id: string;
  category: 'Comandos Frecuentes' | 'Solución de Problemas' | 'Flujos de Ramas' | 'GitHub Real' | 'GitHub Markdown (GFM)';
  title: string;
  problem: string;
  solutionCommand: string;
  explanation: string;
  tags: string[];
  presetScenario?: () => GitState; // Loads a problem state in the simulator
}

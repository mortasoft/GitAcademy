export interface UserProgress {
  completedLessons: string[]; // lesson ids
  currentLessonId: string;
  notes: Record<string, string>; // user notes per lesson
  commandHistory: string[];
}

export interface WorkshopModeState {
  isActive: boolean;
  slideIndex: number;
  showSolution: boolean;
  fontSize: 'normal' | 'large' | 'huge';
  timerSeconds: number;
  isTimerRunning: boolean;
}

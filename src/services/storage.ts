import { UserProgress } from '../types/user';

const PROGRESS_STORAGE_KEY = 'gitacademy_user_progress';

const DEFAULT_PROGRESS: UserProgress = {
  completedLessons: [],
  currentLessonId: 'github-repo-create',
  notes: {},
  commandHistory: []
};

export const loadUserProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed
    };
  } catch (e) {
    console.error('Error reading progress from localStorage', e);
    return DEFAULT_PROGRESS;
  }
};

export const saveUserProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress to localStorage', e);
  }
};

export const markLessonCompleted = (lessonId: string): UserProgress => {
  const current = loadUserProgress();
  if (!current.completedLessons.includes(lessonId)) {
    const updated: UserProgress = {
      ...current,
      completedLessons: [...current.completedLessons, lessonId]
    };
    saveUserProgress(updated);
    return updated;
  }
  return current;
};

export const saveUserLessonNote = (lessonId: string, note: string): UserProgress => {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    notes: {
      ...current.notes,
      [lessonId]: note
    }
  };
  saveUserProgress(updated);
  return updated;
};

export const resetUserProgress = (): UserProgress => {
  saveUserProgress(DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
};

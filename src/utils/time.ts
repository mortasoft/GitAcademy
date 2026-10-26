import { Lesson } from '../types/lesson';

/**
 * Calcula la suma total de minutos a partir del timeEstimate ('5 min', '10 min', etc.) de una lista de lecciones.
 */
export const calculateTotalMinutes = (lessons: Lesson[]): number => {
  return lessons.reduce((acc, lesson) => {
    const match = lesson.timeEstimate.match(/(\d+)/);
    return acc + (match ? parseInt(match[1], 10) : 0);
  }, 0);
};

/**
 * Formatea una cantidad de minutos a una representación legible (ej: "45 min", "1 h 15 min").
 */
export const formatTotalTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours} h ${remainingMins} min` : `${hours} h`;
};

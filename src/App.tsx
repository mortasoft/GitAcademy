import React, { useState, useEffect } from 'react';
import { CURRICULUM } from './data/curriculum';
import { Lesson } from './types/lesson';
import { GitState, CommandResult } from './types/git';
import { resetCommitCounter } from './core/gitEngine';
import { loadUserProgress, markLessonCompleted } from './services/storage';

import { Navbar } from './components/Navbar';
import { GitGraph } from './components/GitGraph';
import { Terminal } from './components/Terminal';
import { LessonSidebar } from './components/LessonSidebar';
import { CommandPalette } from './components/CommandPalette';
import { WorkshopModal } from './components/WorkshopModal';
import { GitHubGuideModal } from './components/GitHubGuideModal';

export const App: React.FC = () => {
  const [currentLesson, setCurrentLesson] = useState<Lesson>(CURRICULUM[0].lessons[0]);
  const [gitState, setGitState] = useState<GitState>(CURRICULUM[0].lessons[0].initialState);
  const [mode, setMode] = useState<'student' | 'workshop' | 'sandbox'>('student');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [suggestedCommand, setSuggestedCommand] = useState<string | undefined>(
    CURRICULUM[0].lessons[0].steps[0]?.commandSuggestion
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cargar progreso del usuario guardado
  useEffect(() => {
    const progress = loadUserProgress();
    setCompletedLessonIds(progress.completedLessons);
  }, []);

  // Escuchar atajo global Ctrl+K / Cmd+K para la paleta de comandos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStateChange = (newState: GitState, _result: CommandResult) => {
    setGitState(newState);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    resetCommitCounter(Object.keys(lesson.initialState.commits).length + 1);
    setGitState(lesson.initialState);
    setSuggestedCommand(lesson.steps[0]?.commandSuggestion);
  };

  const handleResetLesson = () => {
    resetCommitCounter(Object.keys(currentLesson.initialState.commits).length + 1);
    setGitState(currentLesson.initialState);
    showToast('Repositorio reiniciado al estado inicial de la lección.');
  };

  const handleCompleteLesson = (lessonId: string) => {
    const updated = markLessonCompleted(lessonId);
    setCompletedLessonIds(updated.completedLessons);
    showToast('🎉 ¡Felicitaciones! Has completado el objetivo de esta lección.');
  };

  const handleLoadScenario = (scenarioState: GitState, title: string) => {
    resetCommitCounter(Object.keys(scenarioState.commits).length + 1);
    setGitState(scenarioState);
    showToast(`Escenario cargado: "${title}". ¡Pruébalo en la terminal!`);
  };

  const handleApplySolutionCommand = (cmd: string) => {
    setSuggestedCommand(cmd);
  };

  const allLessons = CURRICULUM.flatMap((l) => l.lessons);
  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Barra de Navegación Superior */}
      <Navbar
        mode={mode}
        setMode={setMode}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onResetLesson={handleResetLesson}
        completedCount={completedCount}
        totalLessons={totalLessons}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-orange-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 min-w-0">
        {/* Panel Izquierdo: Sidebar de Lecciones (solo en modo student) */}
        {mode === 'student' && (
          <LessonSidebar
            curriculum={CURRICULUM}
            currentLesson={currentLesson}
            onSelectLesson={handleSelectLesson}
            completedLessonIds={completedLessonIds}
            gitState={gitState}
            onApplySolutionCommand={handleApplySolutionCommand}
            onCompleteLesson={handleCompleteLesson}
          />
        )}

        {/* Panel Central/Derecho: Si es una guía de GitHub real, renderiza la guía; si no, el Grafo + Terminal */}
        {currentLesson.isGitHubGuide && mode === 'student' ? (
          <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-slate-950">
            <GitHubGuideModal lesson={currentLesson} />
          </div>
        ) : (
          <div className="flex-1 min-w-0 min-h-0 flex flex-col p-3 lg:p-4 gap-3 lg:gap-4 overflow-hidden bg-slate-950">
            {/* Mitad Superior: Visualizador del Grafo de Git */}
            <div className="flex-1 min-h-0">
              <GitGraph state={gitState} />
            </div>

            {/* Mitad Inferior: Terminal Interactiva */}
            <div className="flex-1 min-h-0">
              <Terminal
                state={gitState}
                onStateChange={handleStateChange}
                suggestedCommand={suggestedCommand}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modal Modo Taller / Presentador */}
      <WorkshopModal
        isOpen={mode === 'workshop'}
        onClose={() => setMode('student')}
        lesson={currentLesson}
        state={gitState}
        onExecuteSolution={(cmd) => setSuggestedCommand(cmd)}
      />

      {/* Centro de Referencia / Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onLoadScenario={handleLoadScenario}
      />
    </div>
  );
};

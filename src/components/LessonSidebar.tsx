import React, { useState } from 'react';
import { CurriculumLevel, Lesson } from '../types/lesson';
import { GitState } from '../types/git';
import { 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Circle, 
  HelpCircle, 
  KeyRound, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Terminal,
  GitBranch,
  GitMerge,
  ShieldAlert,
  Github,
  Play
} from 'lucide-react';

interface LessonSidebarProps {
  curriculum: CurriculumLevel[];
  currentLesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
  completedLessonIds: string[];
  gitState: GitState;
  onApplySolutionCommand: (cmd: string) => void;
  onCompleteLesson: (lessonId: string) => void;
}

const LEVEL_ICONS: Record<string, React.ReactNode> = {
  Terminal: <Terminal className="w-4 h-4 text-emerald-400" />,
  GitBranch: <GitBranch className="w-4 h-4 text-blue-400" />,
  GitMerge: <GitMerge className="w-4 h-4 text-purple-400" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4 text-amber-400" />,
  Github: <Github className="w-4 h-4 text-white" />,
};

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  curriculum,
  currentLesson,
  onSelectLesson,
  completedLessonIds,
  gitState,
  onApplySolutionCommand,
  onCompleteLesson,
}) => {
  const [openLevelId, setOpenLevelId] = useState<string>(currentLesson.levelId);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [goalVerified, setGoalVerified] = useState<boolean | null>(null);

  const toggleLevel = (id: string) => {
    setOpenLevelId((prev) => (prev === id ? '' : id));
  };

  const isCompleted = completedLessonIds.includes(currentLesson.id);

  // Encontrar lección anterior y siguiente
  const allLessons = curriculum.flatMap((l) => l.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Verificación dinámica de la meta basada en el estado actual de Git
  const handleVerifyGoal = () => {
    let success = false;

    if (currentLesson.id === 'intro-init') {
      // Debe haber más de 1 commit en la rama main
      success = Object.keys(gitState.commits).length >= 2;
    } else if (currentLesson.id === 'intro-history') {
      success = true;
    } else if (currentLesson.id === 'branches-create') {
      // Debe existir la rama 'feature-login' y tener commit
      success = Boolean(gitState.branches['feature-login']);
    } else if (currentLesson.id === 'branches-detached') {
      success = true;
    } else if (currentLesson.id === 'merge-fast-forward') {
      // En fast-forward, main debe haber avanzado al commit c2
      success = gitState.branches.main?.commitId === 'c2';
    } else if (currentLesson.id === 'merge-3way') {
      // Debe haber un commit con dos padres
      success = Object.values(gitState.commits).some((c) => c.parentIds.length >= 2);
    } else if (currentLesson.id === 'rebase-intro') {
      // La rama mi-rama debe estar rebasada
      success = gitState.branches['mi-rama']?.commitId !== 'c3';
    } else if (currentLesson.id === 'cherry-pick') {
      // main debe tener el commit copiado
      const mainCommit = gitState.commits[gitState.branches.main?.commitId || ''];
      success = Boolean(mainCommit?.message.includes('Fix'));
    } else if (currentLesson.id === 'reset-revert') {
      // Debe haber revertido c2 o hecho reset
      success = gitState.branches.main?.commitId !== 'c2';
    } else if (currentLesson.id === 'git-stash') {
      success = true;
    } else if (currentLesson.isGitHubGuide) {
      success = true;
    }

    setGoalVerified(success);
    if (success) {
      onCompleteLesson(currentLesson.id);
    }
  };

  return (
    <aside className="w-full lg:w-96 flex flex-col bg-slate-900/90 border-r border-slate-800 h-full overflow-hidden">
      {/* Selector de Niveles y Lecciones (Acordeón superior) */}
      <div className="border-b border-slate-800 max-h-56 overflow-y-auto p-3 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
          Currículo del Curso
        </div>
        {curriculum.map((level) => {
          const isOpen = openLevelId === level.id;
          const completedInLevel = level.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const totalInLevel = level.lessons.length;

          return (
            <div key={level.id} className="rounded-xl overflow-hidden border border-slate-800/60 bg-slate-950/40">
              <button
                onClick={() => toggleLevel(level.id)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-2.5">
                  {LEVEL_ICONS[level.icon] || <Terminal className="w-4 h-4 text-slate-400" />}
                  <span className="text-xs font-semibold text-slate-200">{level.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {completedInLevel}/{totalInLevel}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="p-1 space-y-0.5 border-t border-slate-800/60 bg-slate-950/70">
                  {level.lessons.map((lesson) => {
                    const isSelected = lesson.id === currentLesson.id;
                    const isDone = completedLessonIds.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          onSelectLesson(lesson);
                          setGoalVerified(null);
                          setShowTips(false);
                          setShowSolution(false);
                        }}
                        className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-left text-xs transition ${
                          isSelected
                            ? 'bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                          {lesson.timeEstimate}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contenido detallado de la lección activa */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Cabecera de la Lección */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {currentLesson.category}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Dificultad: <strong className="text-slate-200">{currentLesson.difficulty}</strong>
            </span>
          </div>

          <h2 className="text-base font-bold text-white mt-2 leading-tight">
            {currentLesson.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {currentLesson.summary}
          </p>
        </div>

        {/* Pasos guiados si la lección tiene pasos */}
        {currentLesson.steps && currentLesson.steps.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Instrucciones Paso a Paso
            </h3>
            {currentLesson.steps.map((step, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
              >
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>{step.title}</span>
                </div>
                <p className="text-slate-400 text-[11.5px] leading-relaxed">
                  {step.explanation}
                </p>

                {step.commandSuggestion && (
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 mt-1 font-mono text-[11px]">
                    <code className="text-orange-400">{step.commandSuggestion}</code>
                    <button
                      onClick={() => onApplySolutionCommand(step.commandSuggestion!)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] transition"
                      title="Copiar a la terminal"
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>Insertar</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Banner de Meta de la Lección */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-orange-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-400">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Objetivo a Cumplir</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {currentLesson.goalDescription}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleVerifyGoal}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? '¡Meta Completada!' : 'Verificar Meta'}</span>
            </button>
          </div>

          {goalVerified === true && (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>¡Excelente trabajo! Has cumplido el objetivo de esta lección.</span>
            </div>
          )}

          {goalVerified === false && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Aún no se detecta la condición esperada en el grafo de Git. Revisa las instrucciones o pide una pista.</span>
            </div>
          )}
        </div>

        {/* Acordeón de Pistas & Solución */}
        <div className="space-y-2 pt-1">
          {/* Pistas */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden text-xs">
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full px-3 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 transition"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Pistas y Buenas Prácticas</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTips ? 'rotate-180' : ''}`} />
            </button>
            {showTips && (
              <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-1.5 text-slate-300 text-[11.5px]">
                {currentLesson.tips.map((tip, idx) => (
                  <p key={idx}>💡 {tip}</p>
                ))}
              </div>
            )}
          </div>

          {/* Solución Oficial */}
          {currentLesson.solutionCommands && currentLesson.solutionCommands.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden text-xs">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="w-full px-3 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ver Comandos de Solución</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSolution ? 'rotate-180' : ''}`} />
              </button>
              {showSolution && (
                <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2 font-mono text-[11px]">
                  {currentLesson.solutionCommands.map((cmd, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                      <code className="text-emerald-400">{cmd}</code>
                      <button
                        onClick={() => onApplySolutionCommand(cmd)}
                        className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                      >
                        Ejecutar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Barra de navegación Anterior / Siguiente Lección */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
        <button
          onClick={() => prevLesson && onSelectLesson(prevLesson)}
          disabled={!prevLesson}
          className="flex-1 py-1.5 px-2 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Anterior</span>
        </button>

        <button
          onClick={() => nextLesson && onSelectLesson(nextLesson)}
          disabled={!nextLesson}
          className="flex-1 py-1.5 px-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400 hover:bg-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition font-medium"
        >
          <span>Siguiente</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

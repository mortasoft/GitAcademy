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
  Target,
  ArrowRight,
  ArrowLeft,
  Terminal,
  GitBranch,
  GitMerge,
  ShieldAlert,
  Github,
  Play,
  ListTree,
  BookOpen
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
  const [activeTab, setActiveTab] = useState<'instructions' | 'syllabus'>('instructions');
  const [openLevelId, setOpenLevelId] = useState<string>(currentLesson.levelId);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [goalVerified, setGoalVerified] = useState<boolean | null>(null);

  const toggleLevel = (id: string) => {
    setOpenLevelId((prev) => (prev === id ? '' : id));
  };

  const isCompleted = completedLessonIds.includes(currentLesson.id);

  // Navegación secuencial
  const allLessons = curriculum.flatMap((l) => l.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Verificación dinámica de la meta basada en el estado actual de Git
  const handleVerifyGoal = () => {
    let success = false;

    if (currentLesson.id === 'intro-init') {
      success = Object.keys(gitState.commits).length >= 2;
    } else if (currentLesson.id === 'intro-history') {
      success = true;
    } else if (currentLesson.id === 'branches-create') {
      success = Boolean(gitState.branches['feature-login']);
    } else if (currentLesson.id === 'branches-detached') {
      success = true;
    } else if (currentLesson.id === 'merge-fast-forward') {
      success = gitState.branches.main?.commitId === 'c2';
    } else if (currentLesson.id === 'merge-3way') {
      success = Object.values(gitState.commits).some((c) => c.parentIds.length >= 2);
    } else if (currentLesson.id === 'rebase-intro') {
      success = gitState.branches['mi-rama']?.commitId !== 'c3';
    } else if (currentLesson.id === 'cherry-pick') {
      const mainCommit = gitState.commits[gitState.branches.main?.commitId || ''];
      success = Boolean(mainCommit?.message.includes('Fix'));
    } else if (currentLesson.id === 'reset-revert') {
      success = gitState.branches.main?.commitId !== 'c2';
    } else if (currentLesson.id === 'git-stash' || currentLesson.isGitHubGuide) {
      success = true;
    }

    setGoalVerified(success);
    if (success) {
      onCompleteLesson(currentLesson.id);
    }
  };

  const currentLevel = curriculum.find((lvl) => lvl.id === currentLesson.levelId);

  return (
    <aside className="w-full md:w-80 lg:w-[410px] shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 h-full overflow-hidden select-none">
      {/* Pestañas Superiores: Instrucciones vs Temario */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'instructions'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Instrucciones</span>
          </button>

          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'syllabus'
                ? 'bg-slate-800 text-orange-400 shadow-sm border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Temario ({completedLessonIds.length}/{allLessons.length})</span>
          </button>
        </div>
      </div>

      {/* Selector de Nivel Rápido */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
          <span className="font-semibold text-slate-300 leading-tight">
            {currentLevel?.title || 'GitAcademy'}
          </span>
        </div>
        <button
          onClick={() => {
            setActiveTab(activeTab === 'syllabus' ? 'instructions' : 'syllabus');
            setOpenLevelId(currentLesson.levelId);
          }}
          className="text-[11px] text-orange-400 hover:text-orange-300 shrink-0 font-medium ml-2"
        >
          {activeTab === 'syllabus' ? 'Volver a clase' : 'Ver todos'}
        </button>
      </div>

      {/* CUERPO DEL COMPONENTE: O TEMARIO O INSTRUCCIONES (UN SOLO SCROLLBAR FLUIDO) */}
      {activeTab === 'syllabus' ? (
        /* Vista de Temario Completo */
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {curriculum.map((level) => {
            const isOpen = openLevelId === level.id;
            const completedInLevel = level.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
            const totalInLevel = level.lessons.length;

            return (
              <div 
                key={level.id} 
                className={`rounded-xl overflow-hidden border transition ${
                  level.id === currentLesson.levelId
                    ? 'border-orange-500/40 bg-slate-950/70'
                    : 'border-slate-800/80 bg-slate-950/40'
                }`}
              >
                <button
                  onClick={() => toggleLevel(level.id)}
                  className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0">
                      {LEVEL_ICONS[level.icon] || <Terminal className="w-4 h-4 text-slate-400" />}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 leading-snug">
                      {level.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {completedInLevel}/{totalInLevel}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="p-1.5 space-y-1 border-t border-slate-800/80 bg-slate-950">
                    <p className="text-[11px] text-slate-400 px-2.5 py-1 leading-relaxed">
                      {level.description}
                    </p>
                    {level.lessons.map((lesson) => {
                      const isSelected = lesson.id === currentLesson.id;
                      const isDone = completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            onSelectLesson(lesson);
                            setActiveTab('instructions');
                            setGoalVerified(null);
                            setShowTips(false);
                            setShowSolution(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-lg flex items-start justify-between text-left text-xs transition gap-2 ${
                            isSelected
                              ? 'bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/40'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                            )}
                            <span className="leading-snug break-words">
                              {lesson.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2 mt-0.5">
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
      ) : (
        /* Vista de Instrucciones de la Lección Actual */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Cabecera de la Lección */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {currentLesson.category}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Dificultad: <strong className="text-slate-200">{currentLesson.difficulty}</strong>
              </span>
            </div>

            <h2 className="text-base font-bold text-white mt-2 leading-tight">
              {currentLesson.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
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
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>{step.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11.5px] leading-relaxed">
                    {step.explanation}
                  </p>

                  {step.commandSuggestion && (
                    <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 mt-1 font-mono text-[11px]">
                      <code className="text-orange-400 font-semibold">{step.commandSuggestion}</code>
                      <button
                        onClick={() => onApplySolutionCommand(step.commandSuggestion!)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] transition bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded"
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
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400">
              <Target className="w-4 h-4 text-orange-400" />
              <span>Objetivo de la lección</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentLesson.goalDescription}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleVerifyGoal}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                  isCompleted
                    ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? 'Meta completada' : 'Verificar meta'}</span>
              </button>
            </div>

            {goalVerified === true && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Condición del repositorio verificada correctamente.</span>
              </div>
            )}

            {goalVerified === false && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>El estado actual del repositorio aún no cumple el objetivo esperado.</span>
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
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recomendaciones técnicas</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTips ? 'rotate-180' : ''}`} />
              </button>
              {showTips && (
                <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-1.5 text-slate-300 text-[11.5px]">
                  {currentLesson.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      <span>{tip}</span>
                    </div>
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
                          className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                        >
                          Insertar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barra Inferior Fija de Navegación Anterior / Siguiente */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={() => prevLesson && onSelectLesson(prevLesson)}
          disabled={!prevLesson}
          className="flex-1 py-2 px-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Anterior</span>
        </button>

        <button
          onClick={() => nextLesson && onSelectLesson(nextLesson)}
          disabled={!nextLesson}
          className="flex-1 py-2 px-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400 hover:bg-orange-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition font-semibold"
        >
          <span>Siguiente</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

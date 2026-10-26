import React from 'react';
import { CurriculumLevel, Lesson } from '../types/lesson';
import { calculateTotalMinutes, formatTotalTime } from '../utils/time';
import { 
  Terminal, 
  GitBranch, 
  GitMerge, 
  ShieldAlert, 
  ShieldCheck,
  Github, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Clock, 
  Presentation, 
  Code2, 
  Search,
  Check,
  FolderKanban
} from 'lucide-react';

interface DashboardProps {
  curriculum: CurriculumLevel[];
  completedLessonIds: string[];
  onStartLesson: (lesson: Lesson) => void;
  onOpenWorkshop: () => void;
  onOpenSandbox: () => void;
  onOpenReference: () => void;
  onOpenPractices: () => void;
}

const LEVEL_ICONS: Record<string, React.ReactNode> = {
  Github: <Github className="w-5 h-5 text-white" />,
  Terminal: <Terminal className="w-5 h-5 text-emerald-400" />,
  GitBranch: <GitBranch className="w-5 h-5 text-blue-400" />,
  GitMerge: <GitMerge className="w-5 h-5 text-purple-400" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-amber-400" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
};

export const Dashboard: React.FC<DashboardProps> = ({
  curriculum,
  completedLessonIds,
  onStartLesson,
  onOpenWorkshop,
  onOpenSandbox,
  onOpenReference,
  onOpenPractices,
}) => {
  const allLessons = curriculum.flatMap((l) => l.lessons);
  const totalLessons = allLessons.length;
  const totalCourseMinutes = calculateTotalMinutes(allLessons);
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100) || 0;
  const isCourseCompleted = completedCount >= totalLessons && totalLessons > 0;

  // Encontrar la primera lección pendiente
  const nextPendingLesson = allLessons.find((l) => !completedLessonIds.includes(l.id)) || allLessons[0];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-10 select-none">
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        
        {/* HERO Y PANEL DE CONTROL */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                <span>{isCourseCompleted ? 'Curso Finalizado' : 'Programa de Capacitación Técnica'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Git & GitHub: Fundamentos, GUI y Línea de Comandos
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Aprende el flujo de trabajo estándar de la industria: desde la creación de repositorios en GitHub y la gestión visual en GitHub Desktop, hasta el dominio de la terminal, ramas, fusiones y colaboración en equipo.
              </p>
            </div>

            {/* Estado del curso / Acción principal */}
            <div className="shrink-0 flex flex-col gap-3 min-w-[220px]">
              {isCourseCompleted ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex flex-col items-center sm:items-start text-center sm:text-left gap-2 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                    <span>Curso completado</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Has finalizado con éxito todas las lecciones y ejercicios del programa.
                  </p>
                  <button
                    onClick={() => onStartLesson(allLessons[0])}
                    className="mt-1 text-xs text-orange-400 hover:text-orange-300 font-medium inline-flex items-center gap-1 transition"
                  >
                    <span>Repasar desde el inicio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onStartLesson(nextPendingLesson)}
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>{completedCount === 0 ? 'Comenzar curso' : 'Continuar lección'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="text-[11px] text-slate-400 text-center font-mono">
                    Siguiente: {nextPendingLesson.title}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Métricas de avance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Progreso del Curso</span>
                <span className="text-white font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isCourseCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <div className="text-[11px] text-slate-400">
                {completedCount} de {totalLessons} lecciones completadas
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono">Estructura del Programa</div>
              <div className="text-xl font-bold text-white">{curriculum.length} Módulos</div>
              <div className="text-[11px] text-slate-400">{formatTotalTime(totalCourseMinutes)} de contenido guiado</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-mono">Modalidad</div>
              <div className="text-xl font-bold text-white">Práctica Interactiva</div>
              <div className="text-[11px] text-slate-400">Terminal virtual, visualizador reactivo y guías reales</div>
            </div>
          </div>
        </section>

        {/* ACCESOS DIRECTOS DE HERRAMIENTAS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onOpenPractices}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left transition space-y-2 group shadow-sm"
          >
            <div className="flex items-center gap-2.5 text-blue-400">
              <FolderKanban className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wide uppercase font-mono">Talleres Prácticos</span>
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition">
              Casos Reales de Aplicación
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Docs-as-Code, Hotfixes en Producción, GitOps, Open Source y Oracle APEX CI/CD.
            </p>
          </button>

          <button
            onClick={onOpenWorkshop}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition space-y-2 group"
          >
            <div className="flex items-center gap-2.5 text-amber-400">
              <Presentation className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wide uppercase font-mono">Modo Taller</span>
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition">
              Vista para Proyector y Clases
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diapositivas de alto contraste, controles con teclado y revelación de soluciones en directo.
            </p>
          </button>

          <button
            onClick={onOpenSandbox}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition space-y-2 group"
          >
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Code2 className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wide uppercase font-mono">Sandbox Libre</span>
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition">
              Playground de Git sin Restricciones
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experimenta con comandos y observa cómo se dibuja el grafo reactivo sin objetivos obligatorios.
            </p>
          </button>

          <button
            onClick={onOpenReference}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition space-y-2 group"
          >
            <div className="flex items-center gap-2.5 text-orange-400">
              <Search className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wide uppercase font-mono">Centro de Referencia</span>
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition">
              Comandos y Resolución de Problemas
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Guías rápidas para deshacer commits, cancelar merges y plantillas GFM con Ctrl+K.
            </p>
          </button>
        </section>

        {/* TEMARIO DETALLADO POR NIVELES */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Módulos del Curso</h2>
              <p className="text-xs text-slate-400 mt-0.5">Explora el temario completo y accede a cualquier lección.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                {curriculum.length} Módulos
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {formatTotalTime(totalCourseMinutes)}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {curriculum.map((level, levelIdx) => {
              const completedInLevel = level.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
              const isLevelDone = completedInLevel === level.lessons.length;
              const levelTotalMinutes = calculateTotalMinutes(level.lessons);
              const levelTotalTimeFormatted = formatTotalTime(levelTotalMinutes);

              return (
                <div
                  key={level.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* Encabezado del Nivel */}
                  <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {LEVEL_ICONS[level.icon] || <Terminal className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono text-orange-400 uppercase font-semibold">
                            Módulo 0{levelIdx + 1}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {levelTotalTimeFormatted}
                          </span>
                          {isLevelDone && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                              <Check className="w-3 h-3" />
                              Completado
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white mt-0.5">{level.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{level.description}</p>
                      </div>
                    </div>

                    {/* Progreso del nivel */}
                    <div className="shrink-0 flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                      <div className="text-right">
                        <div className="text-xs font-bold text-white font-mono">
                          {completedInLevel} / {level.lessons.length}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{levelTotalTimeFormatted}</div>
                      </div>
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${(completedInLevel / level.lessons.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista de Lecciones del Nivel */}
                  <div className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {level.lessons.map((lesson) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-200">
                                  {lesson.title}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  {lesson.category}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-slate-400 mt-0.5 leading-relaxed font-sans line-clamp-1">
                                {lesson.summary}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center ml-7 sm:ml-0">
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{lesson.timeEstimate}</span>
                            </div>

                            <button
                              onClick={() => onStartLesson(lesson)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                isCompleted
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                  : 'bg-orange-600 hover:bg-orange-500 text-white'
                              }`}
                            >
                              <span>{isCompleted ? 'Repasar' : 'Comenzar'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

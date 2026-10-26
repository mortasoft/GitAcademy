import React, { useState, useEffect } from 'react';
import { Lesson, CurriculumLevel, WhenToUseExample } from '../types/lesson';
import { GitState } from '../types/git';
import { GitGraph } from './GitGraph';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  EyeOff, 
  Presentation,
  Lightbulb,
  ImageIcon,
  GitBranch,
  Maximize2
} from 'lucide-react';

interface Slide {
  title: string;
  subtitle: string;
  content?: string;
  command?: string;
  tips?: string[];
  whenToUse?: WhenToUseExample[];
  imageUrl?: string;
  imageCaption?: string;
  mockupType?: string;
  type: string;
}

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  curriculum?: CurriculumLevel[];
  onSelectLesson?: (lesson: Lesson) => void;
  state: GitState;
  onExecuteSolution: (cmd: string) => void;
}

export const WorkshopModal: React.FC<WorkshopModalProps> = ({
  isOpen,
  onClose,
  lesson,
  curriculum,
  onSelectLesson,
  state,
  onExecuteSolution,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [userView, setUserView] = useState<'auto' | 'graph' | 'image'>('auto');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

  // Reiniciar slide al cambiar de lección
  useEffect(() => {
    setSlideIndex(0);
    setShowSolution(false);
    setUserView('auto');
  }, [lesson.id]);

  // Slides dinámicas de la lección para presentación
  const slides: Slide[] = [
    {
      title: lesson.title,
      subtitle: `Capacitación Git & GitHub — Nivel: ${lesson.difficulty}`,
      content: lesson.summary,
      type: 'intro',
    },
    ...(lesson.isGitHubGuide && lesson.gitHubGuideContent ? lesson.gitHubGuideContent.steps.map((s) => ({
      title: s.action,
      subtitle: s.details,
      command: s.commandOrUrl,
      imageUrl: s.imageUrl,
      imageCaption: s.imageCaption,
      mockupType: s.mockupType,
      type: 'step',
    })) : lesson.steps.map((s, idx) => ({
      title: `Paso ${idx + 1}: ${s.title}`,
      subtitle: s.explanation,
      command: s.commandSuggestion,
      imageUrl: s.imageUrl,
      imageCaption: s.imageCaption,
      type: 'step',
    }))),
    ...(lesson.whenToUse && lesson.whenToUse.length > 0 ? [{
      title: '¿En qué momento usar este comando?',
      subtitle: 'Casos reales de uso práctico y cuándo evitarlo',
      whenToUse: lesson.whenToUse,
      type: 'whenToUse',
    }] : []),
    {
      title: 'Objetivo del Ejercicio Práctico',
      subtitle: lesson.goalDescription,
      tips: lesson.tips,
      type: 'exercise',
    },
  ];

  // Controles de teclado para el presentador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        setSlideIndex(0);
      } else if (e.key === 'End') {
        setSlideIndex(slides.length - 1);
      } else if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose, lightboxImage]);

  if (!isOpen) return null;

  const currentSlide = slides[slideIndex] || slides[0];
  const hasImage = Boolean(currentSlide.imageUrl);
  const effectiveView = userView === 'auto' ? (hasImage ? 'image' : 'graph') : userView;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white animate-in fade-in duration-200">
      {/* Barra Superior del Presentador */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
            <Presentation className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-xs uppercase tracking-wider text-amber-400 font-mono hidden sm:block">
              Modo Taller / Proyector
            </h1>
            {curriculum && onSelectLesson ? (
              <select
                value={lesson.id}
                onChange={(e) => {
                  const target = curriculum.flatMap((c) => c.lessons).find((l) => l.id === e.target.value);
                  if (target) onSelectLesson(target);
                }}
                className="bg-slate-950 border border-slate-700 hover:border-slate-600 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 max-w-[200px] sm:max-w-xs md:max-w-md truncate"
                title="Cambiar lección a presentar"
              >
                {curriculum.map((lvl) => (
                  <optgroup key={lvl.id} label={lvl.title} className="bg-slate-900 text-slate-300">
                    {lvl.lessons.map((l) => (
                      <option key={l.id} value={l.id} className="bg-slate-950 text-white">
                        {l.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-200 font-semibold truncate">{lesson.title}</p>
            )}
          </div>
        </div>

        {/* Botones de acción del instructor */}
        <div className="flex items-center gap-2.5 shrink-0">
          {lesson.solutionCommands && lesson.solutionCommands.length > 0 && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                showSolution
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Mostrar u ocultar los comandos de solución"
            >
              {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-indigo-400" />}
              <span className="hidden sm:inline">{showSolution ? 'Ocultar Solución' : 'Revelar Solución'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Salir del Modo Taller (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Contenido Principal de Diapositiva */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Panel Izquierdo: Diapositiva con tipografía grande de proyección */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest uppercase px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Diapositiva {slideIndex + 1} de {slides.length}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Navega con [←] y [→]
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              {currentSlide.title}
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed font-sans">
              {currentSlide.subtitle || currentSlide.content}
            </p>

            {currentSlide.command && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-mono">Comando / Recurso:</span>
                <div className="font-mono text-base sm:text-lg text-emerald-400 font-bold bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                  {currentSlide.command.startsWith('http') ? (
                    <a href={currentSlide.command} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                      {currentSlide.command} ↗
                    </a>
                  ) : (
                    `$ ${currentSlide.command}`
                  )}
                </div>
              </div>
            )}

            {currentSlide.whenToUse && (
              <div className="space-y-3 pt-2">
                {currentSlide.whenToUse.map((item: any, idx: number) => {
                  const isGood = item.recommendation === 'recomendado';
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-sm space-y-2 ${
                        isGood
                          ? 'bg-emerald-950/20 border-emerald-800/40'
                          : 'bg-rose-950/20 border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-base">{item.title}</span>
                        <span
                          className={`text-xs font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            isGood
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isGood ? '✓ Recomendado' : '⚠ Evitar'}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-xs">{item.scenario}</p>
                      {item.command && (
                        <div className="font-mono text-emerald-400 font-bold bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
                          $ {item.command}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {currentSlide.tips && (
              <div className="space-y-2 pt-2">
                <span className="text-xs uppercase font-mono text-amber-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Consejos para la audiencia:
                </span>
                <ul className="space-y-2 text-sm text-slate-300">
                  {currentSlide.tips.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Solución revelada por el instructor */}
            {showSolution && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2 animate-in fade-in">
                <span className="text-xs uppercase font-mono text-indigo-300 font-bold">
                  Solución para el instructor:
                </span>
                <div className="space-y-1.5 font-mono text-sm">
                  {lesson.solutionCommands.map((cmd, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded">
                      <code className="text-emerald-300">{cmd}</code>
                      <button
                        onClick={() => onExecuteSolution(cmd)}
                        className="text-xs px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
                      >
                        Demostrar en vivo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navegación de Diapositivas */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-800/80">
            <button
              onClick={() => setSlideIndex((i) => Math.max(i - 1, 0))}
              disabled={slideIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold transition"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === slideIndex ? 'bg-orange-500 w-7' : 'bg-slate-700 w-2.5 hover:bg-slate-500'
                  }`}
                  title={`Ir a diapositiva ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setSlideIndex((i) => Math.min(i + 1, slides.length - 1))}
              disabled={slideIndex === slides.length - 1}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel Derecho: Visualizador de Grafo Reactivo o Diagrama/Ilustración Técnica */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col bg-slate-900/40">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${effectiveView === 'image' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
              <span>
                {effectiveView === 'image' ? 'Diagrama / Captura Oficial' : 'Grafo del Repositorio en Proyección'}
              </span>
            </div>

            {hasImage && (
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-sans">
                <button
                  onClick={() => setUserView('image')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                    effectiveView === 'image' ? 'bg-orange-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Diagrama</span>
                </button>
                <button
                  onClick={() => setUserView('graph')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                    effectiveView === 'graph' ? 'bg-orange-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitBranch className="w-3 h-3" />
                  <span>Grafo Git</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
            {effectiveView === 'image' && currentSlide.imageUrl ? (
              <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 overflow-auto bg-slate-950/80">
                <div className="relative group max-w-full">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.imageCaption || currentSlide.title}
                    className="max-h-[62vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-800 bg-slate-950 p-2 cursor-pointer transition group-hover:opacity-95"
                    onClick={() => setLightboxImage({ url: currentSlide.imageUrl!, caption: currentSlide.imageCaption })}
                  />
                  <button
                    onClick={() => setLightboxImage({ url: currentSlide.imageUrl!, caption: currentSlide.imageCaption })}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900/90 text-slate-200 hover:text-white border border-slate-700 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition"
                    title="Ampliar captura a pantalla completa"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                {currentSlide.imageCaption && (
                  <p className="mt-3 text-xs text-slate-400 font-sans text-center max-w-lg leading-relaxed">
                    {currentSlide.imageCaption}
                  </p>
                )}
              </div>
            ) : (
              <GitGraph state={state} />
            )}
          </div>
        </div>
      </main>

      {/* Lightbox para proyectar imágenes a pantalla completa en el taller */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs font-semibold text-slate-300">
                {lightboxImage.caption || 'Ilustración / Captura Técnica de Proyección'}
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950">
              <img
                src={lightboxImage.url}
                alt="Proyección ampliada"
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

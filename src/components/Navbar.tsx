import React from 'react';
import { 
  GitPullRequest, 
  Presentation, 
  BookOpen, 
  RotateCcw, 
  Search, 
  Flame,
  CheckCircle2,
  Code2
} from 'lucide-react';

interface NavbarProps {
  mode: 'student' | 'workshop' | 'sandbox';
  setMode: (mode: 'student' | 'workshop' | 'sandbox') => void;
  onOpenCommandPalette: () => void;
  onResetLesson: () => void;
  completedCount: number;
  totalLessons: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  setMode,
  onOpenCommandPalette,
  onResetLesson,
  completedCount,
  totalLessons,
}) => {
  const percentage = Math.round((completedCount / totalLessons) * 100) || 0;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Logo & Marca */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <GitPullRequest className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-orange-400 bg-clip-text text-transparent">
              GitAcademy
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Aprende & Domina Git y GitHub</p>
        </div>
      </div>

      {/* Selectores de Modo */}
      <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setMode('student')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'student'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Modo Lecciones guiadas paso a paso"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Lecciones</span>
        </button>

        <button
          onClick={() => setMode('workshop')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'workshop'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Modo Taller para proyectar y dar capacitaciones"
        >
          <Presentation className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Modo Taller</span>
        </button>

        <button
          onClick={() => setMode('sandbox')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'sandbox'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Playground sin restricciones para experimentar"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Sandbox Libre</span>
        </button>
      </div>

      {/* Acciones y Progreso */}
      <div className="flex items-center gap-3">
        {/* Barra de progreso de lecciones */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/50 px-3 py-1 rounded-lg border border-slate-800/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">{completedCount}</span>/{totalLessons} ({percentage}%)
          </div>
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Buscador / Command Palette */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 text-xs transition"
          title="Abrir Centro de Referencia y Ayuda (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline">Guía & Referencia</span>
          <kbd className="hidden md:inline text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Botón Reiniciar Estado */}
        <button
          onClick={onResetLesson}
          className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/40 transition"
          title="Reiniciar repositorio a su estado inicial de esta lección"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Badge Firebase */}
        <div 
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 font-mono"
          title="Listo para desplegar en Firebase Hosting"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Firebase</span>
        </div>
      </div>
    </header>
  );
};

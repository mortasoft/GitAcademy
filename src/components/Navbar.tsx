import React from 'react';
import { 
  GitPullRequest, 
  Presentation, 
  BookOpen, 
  RotateCcw, 
  Search, 
  Flame,
  CheckCircle2,
  Code2,
  LayoutGrid,
  FolderKanban
} from 'lucide-react';

interface NavbarProps {
  mode: 'dashboard' | 'student' | 'workshop' | 'sandbox' | 'practices';
  setMode: (mode: 'dashboard' | 'student' | 'workshop' | 'sandbox' | 'practices') => void;
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
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0 select-none">
      {/* Logo & Marca (Clickeable para volver al Dashboard) */}
      <button 
        onClick={() => setMode('dashboard')}
        className="flex items-center gap-3 text-left group transition focus:outline-none"
        title="Volver a la pantalla principal"
      >
        <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white group-hover:bg-orange-500 transition shadow-sm">
          <GitPullRequest className="w-5 h-5" />
        </div>
        <div>
          <span className="font-semibold text-base tracking-tight text-white group-hover:text-orange-400 transition">
            GitAcademy
          </span>
        </div>
      </button>

      {/* Selectores de Modo */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setMode('dashboard')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'dashboard'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Pantalla principal y temario del curso"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Inicio</span>
        </button>

        <button
          onClick={() => setMode('student')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'student'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Espacio de lecciones interactivas"
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

        <button
          onClick={() => setMode('practices')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'practices'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Talleres prácticos y casos de uso del mundo real"
        >
          <FolderKanban className="w-3.5 h-3.5 text-blue-300" />
          <span className="hidden md:inline">Prácticas</span>
        </button>
      </div>

      {/* Acciones y Progreso */}
      <div className="flex items-center gap-3">
        {/* Barra de progreso de lecciones */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/50 px-3 py-1 rounded-lg border border-slate-800/80">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <div className="text-xs text-slate-300 font-mono">
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
          <span className="hidden sm:inline">Referencia</span>
          <kbd className="hidden md:inline text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700 font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Botón Reiniciar Estado (Solo cuando se está dentro de una lección) */}
        {mode !== 'dashboard' && (
          <button
            onClick={onResetLesson}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/40 transition"
            title="Reiniciar repositorio a su estado inicial de esta lección"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

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

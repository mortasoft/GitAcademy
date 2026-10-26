import React, { useState, useEffect } from 'react';
import { GitState } from '../types/git';
import { CHEATSHEET_DATABASE } from '../data/cheatsheet';
import { Search, X, Copy, Check, Play, BookOpen } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScenario: (state: GitState, description: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onLoadScenario,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Escuchar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['Todos', 'Solución de Problemas', 'Comandos Frecuentes', 'Flujos de Ramas', 'GitHub Real'];

  const filteredItems = CHEATSHEET_DATABASE.filter((item) => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const q = query.toLowerCase();
    const matchesQuery =
      item.title.toLowerCase().includes(q) ||
      item.problem.toLowerCase().includes(q) ||
      item.solutionCommand.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesQuery;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-orange-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué necesitas hacer? (ej. deshacer commit, cambiar rama, fork, reset...)"
            autoFocus
            className="w-full bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 text-sm focus:ring-0"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros de Categorías */}
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto bg-slate-900/50 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white font-medium shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm">No encontramos respuestas para "{query}".</p>
              <p className="text-xs text-slate-500">Prueba con palabras clave como commit, rama, merge o reset.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1">
                      {item.title}
                    </h3>
                  </div>

                  {item.presetScenario && (
                    <button
                      onClick={() => {
                        const scenarioState = item.presetScenario!();
                        onLoadScenario(scenarioState, item.title);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-medium transition shrink-0"
                      title="Recrea este problema en el simulador para que practiques la solución"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Probar en simulador</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Problema común:</strong> {item.problem}
                </p>

                {/* Comando de solución */}
                <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs">
                  <code className="text-emerald-400 font-bold">{item.solutionCommand}</code>
                  <button
                    onClick={() => handleCopy(item.id, item.solutionCommand)}
                    className="p-1 text-slate-400 hover:text-white transition"
                    title="Copiar comando"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                  💡 {item.explanation}
                </p>

                {/* Etiquetas */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[10px] text-slate-500 font-mono bg-slate-900/80 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-500 flex items-center justify-between">
          <span>Consejo: Puedes abrir este centro en cualquier momento pulsando <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Ctrl+K</kbd></span>
          <span>{filteredItems.length} temas disponibles</span>
        </div>
      </div>
    </div>
  );
};

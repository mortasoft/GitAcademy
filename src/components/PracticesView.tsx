import React, { useState } from 'react';
import { PRACTICES_DATABASE } from '../data/practices';
import { PracticeWorkshop } from '../types/practice';
import { 
  FolderGit2, 
  BookOpen, 
  ShieldAlert, 
  Server, 
  GitFork, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Compass, 
  Lightbulb, 
  FileCode,
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface PracticesViewProps {
  onBackToDashboard: () => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  FolderGit2: <FolderGit2 className="w-5 h-5 text-blue-400" />,
  BookOpen: <BookOpen className="w-5 h-5 text-emerald-400" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-rose-400" />,
  Server: <Server className="w-5 h-5 text-purple-400" />,
  GitFork: <GitFork className="w-5 h-5 text-orange-400" />,
};

export const PracticesView: React.FC<PracticesViewProps> = ({
  onBackToDashboard,
}) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<PracticeWorkshop>(PRACTICES_DATABASE[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleChecklistItem = (itemKey: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950 select-none">
      {/* Panel Lateral: Lista de Talleres */}
      <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Volver a la pantalla principal"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Talleres Prácticos
              </h2>
              <p className="text-[11px] text-slate-400">Casos reales de aplicación de Git</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            5 Talleres
          </span>
        </div>

        {/* Lista de selección de taller */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {PRACTICES_DATABASE.map((workshop) => {
            const isSelected = selectedWorkshop.id === workshop.id;
            return (
              <button
                key={workshop.id}
                onClick={() => setSelectedWorkshop(workshop)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 group ${
                  isSelected
                    ? 'bg-slate-800/90 border-orange-500/40 shadow-sm'
                    : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {ICONS_MAP[workshop.iconName] || <Terminal className="w-4 h-4 text-slate-400" />}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                      {workshop.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {workshop.estimatedTime}
                    </span>
                  </div>

                  <h3 className={`text-xs font-semibold leading-snug truncate ${
                    isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {workshop.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {workshop.shortDescription}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Contenido Principal: Tutorial del Taller Seleccionado */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
          
          {/* Cabecera del Taller */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                  {selectedWorkshop.category}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Duración estimada: {selectedWorkshop.estimatedTime}
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Dificultad: {selectedWorkshop.difficulty}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {selectedWorkshop.title}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {selectedWorkshop.shortDescription}
              </p>
            </div>

            {/* Contexto del Mundo Real */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 font-mono uppercase">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <span>¿Por qué y en qué momento se usa en la industria?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedWorkshop.realWorldContext}
              </p>
            </div>

            {/* Objetivos de Aprendizaje */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Lo que aprenderás a dominar:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {selectedWorkshop.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pasos Guiados del Taller */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-400" />
                <span>Instrucciones Paso a Paso</span>
              </h2>
              <span className="text-xs font-mono text-slate-500">
                {selectedWorkshop.steps.length} Pasos
              </span>
            </div>

            <div className="space-y-4">
              {selectedWorkshop.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-white">
                      {step.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      Paso {idx + 1}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {step.explanation}
                  </p>

                  {/* Bloque de Comandos Copiable */}
                  {step.command && (
                    <div className="mt-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          <span>Comandos de Terminal / URL</span>
                        </span>
                        <button
                          onClick={() => handleCopy(`cmd-${idx}`, step.command!)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                          title="Copiar comando"
                        >
                          {copiedId === `cmd-${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-sans">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="font-sans">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-3 overflow-x-auto text-emerald-300 whitespace-pre-wrap leading-relaxed">
                        {step.command.startsWith('http') ? (
                          <a href={step.command} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                            <span>{step.command}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          step.command
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bloque de Código o Archivo de Configuración */}
                  {step.codeSnippet && (
                    <div className="mt-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 flex items-center gap-1.5 font-sans font-semibold">
                          <FileCode className="w-3.5 h-3.5 text-blue-400" />
                          <span>{step.codeSnippet.filename}</span>
                        </span>
                        <button
                          onClick={() => handleCopy(`code-${idx}`, step.codeSnippet!.code)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                          title="Copiar contenido del archivo"
                        >
                          {copiedId === `code-${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-sans">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="font-sans">Copiar archivo</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 overflow-x-auto text-slate-300 font-mono text-xs leading-relaxed bg-slate-950/90">
                        <code>{step.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Pro Tip */}
                  {step.tip && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border-l-2 border-orange-500/80 text-[11.5px] text-slate-300 font-sans leading-relaxed flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Checklist de Verificación de Éxito */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Checklist de Verificación de Éxito del Taller</span>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Marca cada casilla a medida que completes las acciones en tu entorno de trabajo para verificar que el taller está terminado:
            </p>

            <div className="space-y-2.5 pt-1">
              {selectedWorkshop.verificationChecklist.map((item, i) => {
                const key = `${selectedWorkshop.id}-check-${i}`;
                const isChecked = Boolean(completedItems[key]);
                return (
                  <div
                    key={i}
                    onClick={() => toggleChecklistItem(key)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by div onClick
                      className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                    />
                    <span className={`text-xs font-sans leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navegación al siguiente taller */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={onBackToDashboard}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Dashboard</span>
            </button>

            {(() => {
              const currentIndex = PRACTICES_DATABASE.findIndex((w) => w.id === selectedWorkshop.id);
              const nextWorkshop = PRACTICES_DATABASE[currentIndex + 1];
              if (!nextWorkshop) return null;
              return (
                <button
                  onClick={() => setSelectedWorkshop(nextWorkshop)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                >
                  <span>Siguiente: {nextWorkshop.title.split(':')[0]}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
};

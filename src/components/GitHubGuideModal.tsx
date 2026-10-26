import React from 'react';
import { Lesson } from '../types/lesson';
import { 
  Github, 
  ExternalLink, 
  CheckSquare, 
  Copy, 
  Check, 
  Sparkles, 
  Monitor, 
  UploadCloud, 
  PlusCircle, 
  GitCommit,
  CheckCircle2,
  FileCode,
  FolderGit2
} from 'lucide-react';

interface GitHubGuideModalProps {
  lesson: Lesson;
  onComplete: () => void;
  isCompleted: boolean;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({
  lesson,
  onComplete,
  isCompleted,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!lesson.isGitHubGuide || !lesson.gitHubGuideContent) return null;

  const content = lesson.gitHubGuideContent;

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 min-w-0 bg-slate-950 p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6 pb-8">
        {/* Cabecera Principal */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md">
            {lesson.id.includes('desktop') ? (
              <Monitor className="w-7 h-7 text-purple-400" />
            ) : (
              <Github className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {lesson.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Estimado: {lesson.timeEstimate}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{lesson.title}</h2>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {content.overview}
        </p>
      </div>

      {/* Mockup Visual Interactivo según el tema */}
      {lesson.id === 'github-repo-create' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2 text-slate-200 font-semibold">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Simulación: Formulario de Creación en GitHub.com
            </span>
            <span>github.com/new</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Nombre del Repositorio *</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-700 font-mono text-emerald-400 font-bold">
                <span>mi-primer-proyecto</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded ml-auto">
                  ✓ Disponible
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg border border-orange-500/40 bg-orange-500/5 flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <div>
                  <span className="font-semibold text-white">Public</span>
                  <p className="text-slate-400 text-[11px]">Cualquier persona en internet puede ver este repositorio.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-start gap-2.5 opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-600 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Private</span>
                  <p className="text-slate-400 text-[11px]">Solo tú y las personas que invites pueden verlo.</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-[11.5px] text-slate-300">
                <strong className="text-white">Add a README file:</strong> Recomendado para inicializar la rama main de inmediato con un archivo.
              </div>
            </div>
          </div>
        </div>
      )}

      {lesson.id === 'github-desktop-commit' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-300">
            <span className="flex items-center gap-2 font-semibold">
              <FolderGit2 className="w-4 h-4 text-purple-400" />
              Referencia Visual: Interfaz de GitHub Desktop
            </span>
            <span className="text-purple-400 font-mono text-[11px] bg-purple-500/10 px-2 py-0.5 rounded">
              Current repository: mi-primer-proyecto
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Panel de Cambios */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                1 Changed File
              </span>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-emerald-400 font-mono">README.md</span>
                <span className="text-emerald-400 font-bold">+1</span>
              </div>
            </div>

            {/* Caja de Commit */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-orange-400" />
                Commit to main
              </span>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-[11px] font-mono">
                feat: actualizar README
              </div>
              <div className="w-full py-1.5 bg-blue-600 text-white font-semibold rounded text-center text-[11px]">
                Commit to main
              </div>
            </div>

            {/* Botón Push */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                Sincronización
              </span>
              <div className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded text-center text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>Push origin (1 ↑)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pasos a seguir */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-orange-400" />
          <span>Pasos Guiados para la Capacitación</span>
        </h3>

        {content.steps.map((step, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{step.action}</span>
              <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                Paso {idx + 1}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {step.details}
            </p>

            {step.commandOrUrl && (
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                {step.commandOrUrl.startsWith('http') ? (
                  <a
                    href={step.commandOrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>{step.commandOrUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <code className="text-emerald-400 font-semibold">{step.commandOrUrl}</code>
                )}

                <button
                  onClick={() => handleCopy(idx, step.commandOrUrl!)}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Copiar texto o comando"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {step.tip && (
              <p className="text-[11.5px] text-amber-400/90 bg-amber-500/5 border-l-2 border-amber-500/40 p-2 rounded-r">
                💡 {step.tip}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Botón de Confirmación de Ejercicio */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          ¿Completaste los pasos indicados en esta lección?
        </div>
        <button
          onClick={onComplete}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isCompleted
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isCompleted ? '✓ Práctica Completada' : 'Marcar como Completada'}</span>
        </button>
      </div>
    </div>
  </div>
  );
};

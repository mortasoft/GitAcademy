import React from 'react';
import { Lesson } from '../types/lesson';
import { Github, ExternalLink, CheckSquare, Copy, Check, Sparkles } from 'lucide-react';

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
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto space-y-6">
      {/* Cabecera GitHub */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Práctica en GitHub Real
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{lesson.title}</h2>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {content.overview}
        </p>
      </div>

      {/* Pasos a seguir en GitHub.com */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-orange-400" />
          <span>Pasos Guiados para Realizar en GitHub</span>
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
          ¿Completaste los pasos indicados en tu cuenta de GitHub?
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
  );
};

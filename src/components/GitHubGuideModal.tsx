import React, { useState } from 'react';
import { Lesson } from '../types/lesson';
import { 
  Github, 
  ExternalLink, 
  CheckSquare, 
  Copy, 
  Check, 
  Monitor,
  ImageIcon,
  Maximize2,
  X
} from 'lucide-react';

interface GitHubGuideModalProps {
  lesson: Lesson;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({
  lesson,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; caption?: string } | null>(null);

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
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {content.overview}
          </p>
        </div>

        {/* Pasos a seguir */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-orange-400" />
            <span>Pasos Guiados para la Capacitación</span>
          </h3>

          {content.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{step.action}</span>
                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2.5 py-0.5 rounded">
                  Paso {idx + 1}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {step.details}
              </p>

              {/* Imagen Real de la Plataforma */}
              {step.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950/90 shadow-md group">
                  <div className="relative">
                    <img
                      src={step.imageUrl}
                      alt={step.imageCaption || step.action}
                      loading="lazy"
                      className="w-full max-h-96 object-contain bg-slate-950 p-2 cursor-pointer transition group-hover:opacity-95"
                      onClick={() => setPreviewImage({ url: step.imageUrl!, caption: step.imageCaption })}
                    />
                    <button
                      onClick={() => setPreviewImage({ url: step.imageUrl!, caption: step.imageCaption })}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition shadow"
                      title="Ampliar captura"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  {step.imageCaption && (
                    <div className="px-3.5 py-2 border-t border-slate-800/80 bg-slate-900/50 flex items-center gap-2 text-[11px] text-slate-400">
                      <ImageIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{step.imageCaption}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Comando o enlace copiable */}
              {step.commandOrUrl && (
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs mt-2">
                  {step.commandOrUrl.startsWith('http') ? (
                    <a
                      href={step.commandOrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1.5 truncate mr-2"
                    >
                      <span className="truncate">{step.commandOrUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <code className="text-emerald-400 font-semibold">{step.commandOrUrl}</code>
                  )}

                  <button
                    onClick={() => handleCopy(idx, step.commandOrUrl!)}
                    className="p-1 text-slate-400 hover:text-white transition shrink-0"
                    title="Copiar texto o enlace"
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
      </div>

      {/* Modal Lightbox para ampliar capturas de pantalla */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs font-semibold text-slate-300">
                {previewImage.caption || 'Captura de pantalla oficial de GitHub'}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950">
              <img
                src={previewImage.url}
                alt="Captura de pantalla ampliada"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

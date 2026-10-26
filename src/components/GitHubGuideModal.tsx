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
  X,
  GitBranch,
  GitMerge,
  GitPullRequest,
  ArrowUpRight,
  AlertTriangle,
  FileCode,
  Search,
  Lightbulb,
  Code2,
  RefreshCw,
  FolderGit2,
  ShieldCheck
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

  const renderMockup = (type?: string) => {
    if (!type) return null;

    if (type === 'branch-selector') {
      return (
        <div className="rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-xl mt-3 select-none">
          {/* Barra superior de GitHub Desktop */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium flex items-center gap-1.5 border border-slate-700">
                <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>mi-primer-proyecto</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón de Rama Actual desplegado */}
              <div className="px-3 py-1 rounded bg-orange-600/20 text-orange-400 font-semibold flex items-center gap-2 border border-orange-500/30">
                <GitBranch className="w-3.5 h-3.5" />
                <span>Current Branch: main</span>
              </div>
              <div className="px-3 py-1 rounded bg-slate-800 text-slate-300 flex items-center gap-1.5 border border-slate-700">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Fetch origin</span>
              </div>
            </div>
          </div>

          {/* Menú desplegable simulado de ramas */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800">
            <div className="max-w-md mx-auto bg-slate-950 rounded-xl border border-slate-800 shadow-2xl p-3 space-y-3">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-400">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Filter branches...</span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-500 px-2">Default branch</div>
                <div className="px-3 py-2 rounded-lg bg-orange-600/10 text-orange-300 flex items-center justify-between text-xs font-medium border border-orange-500/20">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-orange-400" />
                    <span>main</span>
                  </div>
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-mono">Actual</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-500 px-2">Recent branches</div>
                <div className="px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    <span>feature/nueva-interfaz</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">hace 10 min</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer">
                  <span>+ New Branch</span>
                  <span className="text-[11px] opacity-75 font-normal">(basada en main)</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-3.5 py-2 bg-slate-900 text-[11px] text-slate-400 flex items-center gap-2 border-t border-slate-800">
            <Monitor className="w-3.5 h-3.5 text-orange-400" />
            <span>Simulador de interfaz oficial de GitHub Desktop: selector y creación de ramas.</span>
          </div>
        </div>
      );
    }

    if (type === 'pull-request') {
      return (
        <div className="rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-xl mt-3 select-none">
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Current branch:</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30 flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                feature/nueva-interfaz
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">1 commit por subir</span>
              <div className="px-3 py-1 rounded bg-blue-600 text-white font-medium flex items-center gap-1.5 shadow-sm">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Push origin</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-950 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="text-sm font-bold text-white">Crear un Pull Request en GitHub</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Abre un Pull Request para solicitar la revisión de tus cambios de <code className="text-blue-400">feature/nueva-interfaz</code> hacia <code className="text-orange-400">main</code>.
              </p>
            </div>
            <div className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition">
              <Github className="w-4 h-4" />
              <span>Create Pull Request</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="px-3.5 py-2 bg-slate-900 text-[11px] text-slate-400 flex items-center gap-2 border-t border-slate-800">
            <Monitor className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulador de panel de Pull Requests en GitHub Desktop.</span>
          </div>
        </div>
      );
    }

    if (type === 'history-stash') {
      return (
        <div className="rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-xl mt-3 select-none">
          {/* Cabecera y panel dividido */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Lista de Historial */}
            <div className="p-3 bg-slate-900 space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-xs font-mono">Changes (0)</span>
                <span className="px-2.5 py-1 rounded bg-orange-600/20 text-orange-400 text-xs font-mono font-semibold border border-orange-500/30">History (3)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-white truncate">feat: agregar sección de testimonios</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                    <span>c3a1f9e</span>
                    <span>•</span>
                    <span>hace 15 min</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg hover:bg-slate-950/50 text-slate-400 space-y-1 transition">
                  <div className="font-medium text-slate-300 truncate">docs: actualizar instrucciones en README</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                    <span>9b8c2e1</span>
                    <span>•</span>
                    <span>hace 1 hora</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal de Stash simulado */}
            <div className="p-4 bg-slate-950 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Switch Branch (Cambios sin guardar)</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Tienes modificaciones locales en 2 archivos. ¿Qué deseas hacer con ellos al cambiar a otra rama?
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-orange-500/30 text-orange-300 flex items-start gap-2">
                    <input type="radio" checked readOnly className="mt-0.5" />
                    <div>
                      <div className="font-semibold">Leave my changes on main (Stash)</div>
                      <div className="text-[11px] text-slate-400">Guarda tus cambios temporalmente en esta rama para retomarlos después.</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 flex items-start gap-2">
                    <input type="radio" disabled className="mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-300">Bring my changes to new branch</div>
                      <div className="text-[11px] text-slate-400">Muda tus cambios sin commitear a la rama de destino.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer">Cancel</span>
                <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow cursor-pointer">Switch Branch</span>
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2 bg-slate-900 text-[11px] text-slate-400 flex items-center gap-2 border-t border-slate-800">
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulador de Historial y Asistente de Stash de GitHub Desktop.</span>
          </div>
        </div>
      );
    }

    if (type === 'conflict-resolver') {
      return (
        <div className="rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-xl mt-3 select-none">
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Conflicts encountered (1 conflicted file)</span>
            </div>
            <span className="text-[11px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Merging into main
            </span>
          </div>

          <div className="p-4 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-mono text-slate-200">README.md</span>
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono">Conflicto</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 border border-slate-700 cursor-pointer">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open in Visual Studio Code</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11.5px] text-slate-400 space-y-1 font-sans">
              <p className="text-slate-300">
                Al resolver los marcadores <code className="text-amber-400">&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> y guardar el archivo en VS Code, GitHub Desktop detectará automáticamente la solución y habilitará el botón inferior:
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Resuelve los archivos marcados para continuar</span>
              <div className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-xs opacity-60 flex items-center gap-1.5 cursor-not-allowed">
                <GitMerge className="w-3.5 h-3.5" />
                <span>Commit merge</span>
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2 bg-slate-900 text-[11px] text-slate-400 flex items-center gap-2 border-t border-slate-800">
            <Monitor className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulador del asistente de resolución de conflictos de GitHub Desktop.</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 min-w-0 bg-slate-950 p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6 pb-8">
        {/* Cabecera Principal */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md">
              {lesson.id.includes('desktop') ? (
                <Monitor className="w-7 h-7 text-purple-400" />
              ) : lesson.levelId === 'nivel-6' || lesson.category.includes('Seguridad') ? (
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
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

              {/* Renderizado de Mockup Oficial interactivo */}
              {step.mockupType && renderMockup(step.mockupType)}

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
                <p className="text-[11.5px] text-slate-300 bg-slate-950 border-l-2 border-orange-500/80 p-2.5 rounded-r font-sans leading-relaxed">
                  <span className="font-semibold text-orange-400">Nota:</span> {step.tip}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Sección: ¿En qué momento usar GitHub Desktop vs Terminal? */}
        {lesson.whenToUse && lesson.whenToUse.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Lightbulb className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">
                ¿En qué momento usar GitHub Desktop vs Terminal?
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Compara cuándo es más productivo utilizar la interfaz visual y en qué escenarios conviene recurrir a la línea de comandos:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {lesson.whenToUse.map((item, idx) => {
                const isGood = item.recommendation === 'recomendado';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-xs space-y-2 flex flex-col justify-between ${
                      isGood
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white text-xs">{item.title}</span>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            isGood
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {isGood ? '✓ Recomendado' : '⚠ Considerar Terminal'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11.5px] leading-relaxed">
                        {item.scenario}
                      </p>
                    </div>

                    {item.command && (
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">Equivalente terminal:</span>
                        <code className="text-amber-400 font-bold">{item.command}</code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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

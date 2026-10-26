import React, { useState, useRef, useEffect } from 'react';
import { GitState, CommandResult } from '../types/git';
import { CommandParser } from '../core/commandParser';
import { Terminal as TerminalIcon, CornerDownLeft, Play, Trash2, Copy, Check } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'system';
  text: string;
  branchName?: string;
}

// Analizador de secuencias de color ANSI para renderizar colores de terminal reales en React
const renderAnsi = (text: string): React.ReactNode => {
  if (!text) return text;
  const ansiRegex = /(?:\x1b|\u001b)?\[([0-9;]+)m/g;
  if (!text.match(ansiRegex)) {
    return text;
  }

  const parts = text.split(/(?:\x1b|\u001b)?\[[0-9;]+m/g);
  const codes: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = ansiRegex.exec(text)) !== null) {
    codes.push(match[1]);
  }

  let currentColor = '';
  let isBold = false;
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part) {
      if (currentColor || isBold) {
        elements.push(
          <span key={i} className={`${currentColor} ${isBold ? 'font-bold' : ''}`}>
            {part}
          </span>
        );
      } else {
        elements.push(part);
      }
    }

    if (i < codes.length) {
      const code = codes[i];
      if (code === '0' || code === '') {
        currentColor = '';
        isBold = false;
      } else if (code === '1') {
        isBold = true;
      } else if (code === '31' || code === '91') {
        currentColor = 'text-rose-400';
      } else if (code === '32' || code === '92') {
        currentColor = 'text-emerald-400';
      } else if (code === '33' || code === '93') {
        currentColor = 'text-amber-400';
      } else if (code === '34' || code === '94') {
        currentColor = 'text-blue-400';
      } else if (code === '35' || code === '95') {
        currentColor = 'text-purple-400';
      } else if (code === '36' || code === '96') {
        currentColor = 'text-cyan-400';
      }
    }
  }

  return elements;
};

interface TerminalProps {
  state: GitState;
  onStateChange: (newState: GitState, result: CommandResult) => void;
  suggestedCommand?: string;
  commandToInsert?: { text: string; id: number } | null;
}

export const Terminal: React.FC<TerminalProps> = ({
  state,
  onStateChange,
  suggestedCommand,
  commandToInsert,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Terminal de comandos Git.\nEscribe "ayuda" o "git --help" para consultar los comandos disponibles.',
    },
  ]);
  const [copied, setCopied] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentBranch = state.head.type === 'branch' ? state.head.target : `(${state.head.target.slice(0, 7)}...)`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Insertar comando dinámicamente desde el sidebar o atajos
  useEffect(() => {
    if (commandToInsert?.text !== undefined) {
      setInput(commandToInsert.text);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = commandToInsert.text.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  }, [commandToInsert]);

  const handleExecute = (cmdToRun?: string) => {
    const commandToExec = cmdToRun !== undefined ? cmdToRun : input;
    if (!commandToExec.trim()) return;

    const trimmed = commandToExec.trim();

    // Guardar en historial
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Agregar comando a las líneas
    const newCommandEntry: TerminalLine = {
      id: `cmd-${Date.now()}-${Math.random()}`,
      type: 'command',
      text: trimmed,
      branchName: currentBranch,
    };

    const res = CommandParser.execute(trimmed, state);

    if (res.output === '__CLEAR__') {
      setLines([]);
      setInput('');
      return;
    }

    const outputLines: TerminalLine[] = [];
    if (res.output) {
      outputLines.push({
        id: `out-${Date.now()}-${Math.random()}`,
        type: res.success ? 'output' : 'error',
        text: res.output,
      });
    }

    setLines((prev) => [...prev, newCommandEntry, ...outputLines]);
    setInput('');

    if (res.newState) {
      onStateChange(res.newState, res);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const candidates = [
        'git status', 'git add .', 'git commit -m ""', 'git branch', 
        'git checkout', 'git switch', 'git merge', 'git rebase', 
        'git log --oneline', 'git stash', 'git reset', 'git revert'
      ];
      const match = candidates.find((c) => c.startsWith(input));
      if (match) {
        setInput(match);
      }
    }
  };

  const handleClear = () => {
    setLines([]);
  };

  const handleCopyHistory = () => {
    const textToCopy = lines
      .map((l) => (l.type === 'command' ? `$ ${l.text}` : l.text))
      .join('\n')
      .replace(/(?:\x1b|\u001b)?\[[0-9;]*m/g, '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="flex flex-col h-full bg-slate-950 font-mono text-xs border border-slate-800 rounded-xl overflow-hidden shadow-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Barra superior de la ventana de la terminal */}
      <div className="h-9 bg-slate-900 border-b border-slate-800 px-3.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-slate-400">
          <TerminalIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-300">Terminal (git shell)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Chip de comando sugerido */}
          {suggestedCommand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setInput(suggestedCommand);
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                    const len = suggestedCommand.length;
                    inputRef.current.setSelectionRange(len, len);
                  }
                }, 50);
              }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[11px] transition"
              title="Cargar comando de la lección en la terminal"
            >
              <Play className="w-2.5 h-2.5 text-orange-400" />
              <span>Sugerencia: <code className="text-orange-300">{suggestedCommand}</code></span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyHistory();
            }}
            className="p-1 text-slate-400 hover:text-slate-200 transition"
            title="Copiar historial"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 text-slate-400 hover:text-slate-200 transition"
            title="Limpiar pantalla"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Salida de la Terminal */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2 selection:bg-slate-800">
        {lines.map((line) => {
          if (line.type === 'command') {
            return (
              <div key={line.id} className="flex items-start gap-2">
                <span className="text-emerald-400 font-medium select-none">$</span>
                <span className="text-slate-400 text-[11px] select-none font-sans bg-slate-900 px-1.5 py-0.2 rounded text-cyan-300 border border-slate-800">
                  {line.branchName || 'main'}
                </span>
                <span className="text-white font-medium">{line.text}</span>
              </div>
            );
          }

          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 whitespace-pre-wrap pl-2 border-l-2 border-rose-500/50 bg-rose-500/5 py-0.5">
                {renderAnsi(line.text)}
              </div>
            );
          }

          if (line.type === 'system') {
            return (
              <div key={line.id} className="text-slate-400 whitespace-pre-wrap pl-2 border-l-2 border-slate-700 bg-slate-900/40 py-0.5">
                {renderAnsi(line.text)}
              </div>
            );
          }

          // output normal
          return (
            <div key={line.id} className="text-slate-300 whitespace-pre-wrap pl-2 font-mono">
              {renderAnsi(line.text)}
            </div>
          );
        })}

        {/* Input actual */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-medium select-none shrink-0">$</span>
          <span className="text-slate-400 text-[11px] select-none font-sans bg-slate-900 px-1.5 py-0.2 rounded text-cyan-300 shrink-0 border border-slate-800">
            {currentBranch}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-transparent border-none outline-none text-white font-mono placeholder:text-slate-600 focus:ring-0 p-0"
              placeholder="escribe un comando git..."
            />
            <button
              onClick={() => handleExecute()}
              className="text-slate-500 hover:text-slate-200 p-1"
              title="Ejecutar"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

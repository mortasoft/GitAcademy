import React, { useState } from 'react';
import { GitState } from '../types/git';
import { computeGraphLayout } from '../core/graphLayout';
import { ZoomIn, ZoomOut, Maximize2, GitBranch as GitBranchIcon } from 'lucide-react';

interface GitGraphProps {
  state: GitState;
  onSelectCommit?: (commitId: string) => void;
}

const getCommitDisplayInfo = (commitId: string, fallbackIndex: number) => {
  const match = commitId.match(/^c(\d+)$/i);
  const num = match ? match[1] : (fallbackIndex + 1);
  return {
    title: `Commit #${num}`,
    id: commitId,
    full: `Commit #${num} (${commitId})`,
  };
};

export const GitGraph: React.FC<GitGraphProps> = ({ state, onSelectCommit }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const layout = computeGraphLayout(state);
  const selectedNode = layout.nodes.find((n) => n.commit.id === selectedNodeId);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.0));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col overflow-hidden border border-slate-800 rounded-2xl shadow-inner">
      {/* Barra de cabecera del Grafo */}
      <div className="h-10 border-b border-slate-800/80 bg-slate-900/60 px-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <GitBranchIcon className="w-4 h-4 text-orange-400" />
          <span className="font-semibold text-slate-200">Visualizador de Grafo Reactivo</span>
          <span className="text-[11px] text-slate-500 font-mono">
            ({layout.nodes.length} {layout.nodes.length === 1 ? 'commit' : 'commits'})
          </span>
        </div>

        {/* Controles de Zoom */}
        <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:text-white transition"
            title="Reducir zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1 text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:text-white transition"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-[1px] bg-slate-800 mx-1" />
          <button
            onClick={handleResetZoom}
            className="p-1 hover:text-white transition"
            title="Ajustar zoom al 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Área del Grafo SVG */}
      <div className="flex-1 overflow-auto relative p-6 cursor-grab active:cursor-grabbing">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.15s ease-out',
            width: `${layout.width}px`,
            height: `${layout.height}px`,
          }}
          className="relative"
        >
          <svg
            width={layout.width}
            height={layout.height}
            className="absolute top-0 left-0"
          >
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Dibujar Conexiones / Aristas */}
            {layout.edges.map((edge, index) => {
              // Curva suave cúbica Bezier
              const dx = edge.to.x - edge.from.x;
              const pathD = `M ${edge.from.x} ${edge.from.y} C ${edge.from.x + dx * 0.5} ${edge.from.y}, ${edge.to.x - dx * 0.5} ${edge.to.y}, ${edge.to.x} ${edge.to.y}`;

              return (
                <path
                  key={`edge-${index}`}
                  d={pathD}
                  fill="none"
                  stroke={edge.isMerge ? '#a855f7' : '#64748b'}
                  strokeWidth={edge.isMerge ? 3 : 2.5}
                  strokeDasharray={edge.isMerge ? '4 2' : undefined}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Conexión discontinua hacia el nodo fantasma de cambios pendientes */}
            {layout.ghostNode && (() => {
              const headNode = layout.nodes.find((n) => n.commit.id === layout.ghostNode?.headCommitId);
              if (!headNode) return null;
              const startX = headNode.x + 63;
              const endX = layout.ghostNode.x - 63;
              const dx = endX - startX;
              const ghostPath = `M ${startX} ${headNode.y} C ${startX + dx * 0.5} ${headNode.y}, ${endX - dx * 0.5} ${layout.ghostNode.y}, ${endX} ${layout.ghostNode.y}`;
              const strokeColor = layout.ghostNode.hasStaged ? '#10b981' : '#f59e0b';

              return (
                <path
                  d={ghostPath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  className="transition-all duration-300"
                />
              );
            })()}

            {/* Nodos de Commits */}
            {layout.nodes.map((node, nodeIdx) => {
              const isSelected = selectedNodeId === node.commit.id;
              const info = getCommitDisplayInfo(node.commit.id, nodeIdx);

              return (
                <g
                  key={`node-${node.commit.id}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedNodeId(node.commit.id);
                    if (onSelectCommit) onSelectCommit(node.commit.id);
                  }}
                >
                  {/* Halo de enfoque en HEAD */}
                  {node.isHead && (
                    <rect
                      x={node.x - 67}
                      y={node.y - 17}
                      width={134}
                      height={34}
                      rx={17}
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Cápsula Principal del Commit */}
                  <rect
                    x={node.x - 63}
                    y={node.y - 13}
                    width={126}
                    height={26}
                    rx={13}
                    fill={isSelected ? '#1e293b' : '#0f172a'}
                    stroke={isSelected ? '#ffffff' : node.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-all duration-150 group-hover:stroke-white shadow-sm"
                  />

                  {/* Punto indicador del carril / color de rama */}
                  <circle
                    cx={node.x - 47}
                    cy={node.y}
                    r={5}
                    fill={node.color}
                  />

                  {/* Texto: Commit #1 (c1) */}
                  <text
                    x={node.x - 34}
                    y={node.y + 3.5}
                    fill="#ffffff"
                    fontSize={10.5}
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {info.title}
                    <tspan fill="#94a3b8" fontWeight="normal"> ({info.id})</tspan>
                  </text>

                  {/* Etiquetas de Ramas y HEAD (Arriba) */}
                  <g transform={`translate(${node.x}, ${node.y - 28})`}>
                    <g className="flex flex-col items-center">
                      {/* Badge HEAD */}
                      {node.isHead && (
                        <g transform="translate(0, -22)">
                          <rect
                            x={-24}
                            y={-9}
                            width={48}
                            height={17}
                            rx={3}
                            fill="#ea580c"
                            stroke="#fdba74"
                            strokeWidth={1}
                          />
                          <text
                            x={0}
                            y={3}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={9}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            HEAD
                          </text>
                        </g>
                      )}

                      {/* Badges de Ramas */}
                      {node.branches.map((bName, bIdx) => (
                        <g key={bName} transform={`translate(0, ${-bIdx * 20})`}>
                          <rect
                            x={-(bName.length * 4.2 + 10)}
                            y={-9}
                            width={bName.length * 8.4 + 20}
                            height={18}
                            rx={4}
                            fill="#1e293b"
                            stroke={node.color}
                            strokeWidth={1.5}
                          />
                          <text
                            x={0}
                            y={3}
                            textAnchor="middle"
                            fill="#e2e8f0"
                            fontSize={9.5}
                            fontWeight="600"
                            fontFamily="monospace"
                          >
                            {bName}
                          </text>
                        </g>
                      ))}
                    </g>
                  </g>

                  {/* Etiquetas de Tags (Abajo) */}
                  {node.tags.map((tName, tIdx) => (
                    <g key={tName} transform={`translate(${node.x}, ${node.y + 30 + tIdx * 20})`}>
                      <rect
                        x={-(tName.length * 4.2 + 8)}
                        y={-8}
                        width={tName.length * 8.4 + 16}
                        height={16}
                        rx={3}
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={3}
                        textAnchor="middle"
                        fill="#6ee7b7"
                        fontSize={9}
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {tName}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}

            {/* Nodo fantasma de cambios no confirmados (Working Tree / Staging) */}
            {layout.ghostNode && (() => {
              const g = layout.ghostNode;
              const isStaged = g.hasStaged;
              const mainColor = isStaged ? '#10b981' : '#f59e0b';
              const bgColor = isStaged ? '#064e3b' : '#451a03';
              const badgeText = isStaged ? 'STAGED' : 'MODIFICADO';
              const badgeTextColor = isStaged ? '#a7f3d0' : '#fde68a';

              const allChangedFiles = Array.from(new Set([...g.stagedFiles, ...g.workingFiles]));

              return (
                <g key="ghost-node" className="select-none">
                  {/* Badge superior de estado */}
                  <g transform={`translate(${g.x}, ${g.y - 28})`}>
                    <rect
                      x={-45}
                      y={-9}
                      width={90}
                      height={18}
                      rx={4}
                      fill={bgColor}
                      stroke={mainColor}
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                    />
                    <text
                      x={0}
                      y={3.5}
                      textAnchor="middle"
                      fill={badgeTextColor}
                      fontSize={8.5}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {badgeText}
                    </text>
                  </g>

                  {/* Cápsula punteada del nodo fantasma */}
                  <rect
                    x={g.x - 63}
                    y={g.y - 13}
                    width={126}
                    height={26}
                    rx={13}
                    fill={bgColor}
                    fillOpacity={0.6}
                    stroke={mainColor}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <circle
                    cx={g.x - 47}
                    cy={g.y}
                    r={4.5}
                    fill={mainColor}
                  />
                  <text
                    x={g.x - 34}
                    y={g.y + 3.5}
                    fill={mainColor}
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {isStaged ? '✓ Staged' : '... Modificado'}
                  </text>

                  {/* Etiquetas flotantes con los nombres de los archivos */}
                  <g transform={`translate(${g.x}, ${g.y + 28})`}>
                    {allChangedFiles.map((file, fIdx) => {
                      const fileIsStaged = g.stagedFiles.includes(file);
                      const fileColor = fileIsStaged ? '#10b981' : '#f59e0b';
                      const labelWidth = file.length * 7 + 24;
                      return (
                        <g key={file} transform={`translate(0, ${fIdx * 20})`}>
                          <rect
                            x={-labelWidth / 2}
                            y={-8}
                            width={labelWidth}
                            height={17}
                            rx={4}
                            fill="#0f172a"
                            stroke={fileColor}
                            strokeWidth={1}
                          />
                          <circle cx={-labelWidth / 2 + 8} cy={0.5} r={2.5} fill={fileColor} />
                          <text
                            x={4}
                            y={3.5}
                            textAnchor="middle"
                            fill="#f1f5f9"
                            fontSize={9.5}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {file}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Drawer / Tarjeta de detalles del commit seleccionado */}
      {selectedNode && (
        <div className="absolute bottom-3 left-4 right-4 bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between z-10 text-xs">
          <div className="flex items-center gap-3">
            <div
              className="px-2.5 py-1 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white shadow shrink-0"
              style={{ backgroundColor: selectedNode.color }}
            >
              {getCommitDisplayInfo(selectedNode.commit.id, 0).full}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">{selectedNode.commit.message}</span>
                {selectedNode.isHead && (
                  <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px]">
                    HEAD actual
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-[11px] flex items-center gap-3 mt-0.5">
                <span>{selectedNode.commit.author}</span>
                <span>•</span>
                <span>Padres: {selectedNode.commit.parentIds.join(', ') || '(ninguno / root)'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedNodeId(null)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

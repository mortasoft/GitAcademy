import React, { useState } from 'react';
import { GitState, GitCommit } from '../types/git';
import { computeGraphLayout } from '../core/graphLayout';
import { getCommitHash } from '../core/gitEngine';
import { ZoomIn, ZoomOut, Maximize2, GitBranch as GitBranchIcon } from 'lucide-react';

interface GitGraphProps {
  state: GitState;
  onSelectCommit?: (commitId: string) => void;
  onSelectBranch?: (branchName: string) => void;
}

const getCommitDisplayInfo = (commit: GitCommit | string, fallbackIndex: number) => {
  const commitId = typeof commit === 'string' ? commit : commit.id;
  const hash = getCommitHash(commit, fallbackIndex);
  const match = commitId.match(/^c(\d+)$/i);
  const num = match ? match[1] : (fallbackIndex + 1);
  return {
    title: `Commit #${num}`,
    id: commitId,
    hash,
    full: `Commit #${num} (${hash})`,
  };
};

export const GitGraph: React.FC<GitGraphProps> = ({ state, onSelectCommit, onSelectBranch }) => {
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

            {/* Rieles Guía Verticales para cada Rama */}
            {layout.branchLanes.map((lane) => (
              <g key={`rail-${lane.name}`}>
                <line
                  x1={lane.x}
                  y1={52}
                  x2={lane.x}
                  y2={layout.railBottomY}
                  stroke={lane.color}
                  strokeWidth={lane.isCurrent ? 2 : 1.5}
                  strokeOpacity={lane.isCurrent ? 0.35 : 0.18}
                  strokeDasharray="5 4"
                />
              </g>
            ))}

            {/* Conectores hacia ramas que aún no tienen commits propios */}
            {layout.branchLanes.map((lane) => {
              if (lane.hasOwnCommits || !lane.originPos) return null;
              const startX = lane.originPos.x;
              const startY = lane.originPos.y;
              const endX = lane.x;
              const endY = lane.originPos.y + 40;
              const dy = endY - startY;

              return (
                <g key={`sprout-${lane.name}`}>
                  <path
                    d={`M ${startX} ${startY} C ${startX} ${startY + dy * 0.5}, ${endX} ${endY - dy * 0.5}, ${endX} ${endY}`}
                    fill="none"
                    stroke={lane.color}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    className="transition-all duration-300"
                  />
                  {/* Badge en el carril indicando rama creada lista */}
                  <g transform={`translate(${endX}, ${endY})`}>
                    <rect
                      x={-60}
                      y={-12}
                      width={120}
                      height={24}
                      rx={12}
                      fill="#0f172a"
                      stroke={lane.color}
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                    <circle cx={-44} cy={0} r={3.5} fill={lane.color} />
                    <text
                      x={-32}
                      y={3.5}
                      fill={lane.color}
                      fontSize={9.5}
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      (rama lista)
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Dibujar Conexiones / Aristas Verticales */}
            {layout.edges.map((edge, index) => {
              const isStraight = edge.from.x === edge.to.x;
              const dy = edge.to.y - edge.from.y;
              const pathD = isStraight
                ? `M ${edge.from.x} ${edge.from.y} L ${edge.to.x} ${edge.to.y}`
                : `M ${edge.from.x} ${edge.from.y} C ${edge.from.x} ${edge.from.y + dy * 0.5}, ${edge.to.x} ${edge.to.y - dy * 0.5}, ${edge.to.x} ${edge.to.y}`;

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
              const startX = headNode.x;
              const startY = headNode.y + 14;
              const endX = layout.ghostNode.x;
              const endY = layout.ghostNode.y - 14;
              const isStraight = startX === endX;
              const dy = endY - startY;
              const ghostPath = isStraight
                ? `M ${startX} ${startY} L ${endX} ${endY}`
                : `M ${startX} ${startY} C ${startX} ${startY + dy * 0.5}, ${endX} ${endY - dy * 0.5}, ${endX} ${endY}`;
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
              const info = getCommitDisplayInfo(node.commit, nodeIdx);

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
                      x={node.x - 84}
                      y={node.y - 18}
                      width={168}
                      height={36}
                      rx={18}
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Cápsula Principal del Commit: 160x28 */}
                  <rect
                    x={node.x - 80}
                    y={node.y - 14}
                    width={160}
                    height={28}
                    rx={14}
                    fill={isSelected ? '#1e293b' : '#0f172a'}
                    stroke={isSelected ? '#ffffff' : node.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className="transition-all duration-150 group-hover:stroke-white shadow-sm"
                  />

                  {/* Punto indicador del carril / color de rama */}
                  <circle
                    cx={node.x - 66}
                    cy={node.y}
                    r={5}
                    fill={node.color}
                  />

                  {/* Texto: Commit #1 (6b4550a) */}
                  <text
                    x={node.x - 52}
                    y={node.y + 4}
                    fill="#ffffff"
                    fontSize={10.5}
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {info.title}
                    <tspan fill="#94a3b8" fontWeight="normal"> ({info.hash})</tspan>
                  </text>

                  {/* Badges horizontales de HEAD, Ramas y Tags a la derecha del commit */}
                  {(() => {
                    let badgeOffset = 88;
                    const badges: React.ReactNode[] = [];

                    if (node.isHead) {
                      const w = 44;
                      badges.push(
                        <g key="head" transform={`translate(${node.x + badgeOffset}, ${node.y - 10})`}>
                          <rect width={w} height={20} rx={4} fill="#ea580c" stroke="#fdba74" strokeWidth={1} />
                          <text
                            x={w / 2}
                            y={13.5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={9.5}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            HEAD
                          </text>
                        </g>
                      );
                      badgeOffset += w + 6;
                    }

                    node.branches.forEach((bName) => {
                      const w = Math.max(bName.length * 7.5 + 16, 44);
                      badges.push(
                        <g key={`branch-${bName}`} transform={`translate(${node.x + badgeOffset}, ${node.y - 10})`}>
                          <rect width={w} height={20} rx={4} fill="#0f172a" stroke={node.color} strokeWidth={1.5} />
                          <text
                            x={w / 2}
                            y={13.5}
                            textAnchor="middle"
                            fill="#e2e8f0"
                            fontSize={9.5}
                            fontWeight="600"
                            fontFamily="monospace"
                          >
                            {bName}
                          </text>
                        </g>
                      );
                      badgeOffset += w + 6;
                    });

                    node.tags.forEach((tName) => {
                      const w = Math.max(tName.length * 7.5 + 16, 40);
                      badges.push(
                        <g key={`tag-${tName}`} transform={`translate(${node.x + badgeOffset}, ${node.y - 9})`}>
                          <rect width={w} height={18} rx={3} fill="#064e3b" stroke="#10b981" strokeWidth={1} />
                          <text
                            x={w / 2}
                            y={12.5}
                            textAnchor="middle"
                            fill="#6ee7b7"
                            fontSize={9}
                            fontWeight="600"
                            fontFamily="monospace"
                          >
                            {tName}
                          </text>
                        </g>
                      );
                      badgeOffset += w + 6;
                    });

                    return badges;
                  })()}
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
                  {/* Cápsula punteada del nodo fantasma: 160x28 */}
                  <rect
                    x={g.x - 80}
                    y={g.y - 14}
                    width={160}
                    height={28}
                    rx={14}
                    fill={bgColor}
                    fillOpacity={0.6}
                    stroke={mainColor}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <circle
                    cx={g.x - 66}
                    cy={g.y}
                    r={4.5}
                    fill={mainColor}
                  />
                  <text
                    x={g.x - 52}
                    y={g.y + 4}
                    fill={mainColor}
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {isStaged ? '✓ Staged' : '... Modificado'}
                  </text>

                  {/* Badges de estado y archivos a la derecha del nodo fantasma */}
                  {(() => {
                    let ghostOffset = 88;
                    const badges: React.ReactNode[] = [];

                    // Badge de estado (STAGED o MODIFICADO)
                    const statusW = 84;
                    badges.push(
                      <g key="ghost-status" transform={`translate(${g.x + ghostOffset}, ${g.y - 10})`}>
                        <rect
                          width={statusW}
                          height={20}
                          rx={4}
                          fill={bgColor}
                          stroke={mainColor}
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                        />
                        <text
                          x={statusW / 2}
                          y={13.5}
                          textAnchor="middle"
                          fill={badgeTextColor}
                          fontSize={9}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {badgeText}
                        </text>
                      </g>
                    );
                    ghostOffset += statusW + 6;

                    // Etiquetas con los nombres de los archivos modificados
                    allChangedFiles.forEach((file) => {
                      const fileIsStaged = g.stagedFiles.includes(file);
                      const fileColor = fileIsStaged ? '#10b981' : '#f59e0b';
                      const labelWidth = file.length * 7 + 22;

                      badges.push(
                        <g key={`ghost-file-${file}`} transform={`translate(${g.x + ghostOffset}, ${g.y - 9})`}>
                          <rect
                            width={labelWidth}
                            height={18}
                            rx={4}
                            fill="#0f172a"
                            stroke={fileColor}
                            strokeWidth={1}
                          />
                          <circle cx={7} cy={9} r={2.5} fill={fileColor} />
                          <text
                            x={14 + (labelWidth - 14) / 2}
                            y={12.5}
                            textAnchor="middle"
                            fill="#f1f5f9"
                            fontSize={9}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {file}
                          </text>
                        </g>
                      );
                      ghostOffset += labelWidth + 6;
                    });

                    return badges;
                  })()}
                </g>
              );
            })()}

            {/* Encabezados de Columna Interactivos de las Ramas */}
            {layout.branchLanes.map((lane) => {
              const headerW = Math.max(lane.name.length * 8 + 66, 120);
              const headerH = 30;
              const headerX = lane.x - headerW / 2;
              const headerY = 18;

              return (
                <g
                  key={`header-${lane.name}`}
                  className="cursor-pointer group select-none transition-transform"
                  onClick={() => {
                    if (onSelectBranch) onSelectBranch(lane.name);
                  }}
                >
                  {/* Fondo y borde del encabezado */}
                  <rect
                    x={headerX}
                    y={headerY}
                    width={headerW}
                    height={headerH}
                    rx={15}
                    fill="#0f172a"
                    stroke={lane.color}
                    strokeWidth={lane.isCurrent ? 2.5 : 1.5}
                    className="transition-all duration-150 group-hover:stroke-white shadow-md"
                  />

                  {/* Halo sutil si es la rama ACTIVA */}
                  {lane.isCurrent && (
                    <rect
                      x={headerX - 3}
                      y={headerY - 3}
                      width={headerW + 6}
                      height={headerH + 6}
                      rx={18}
                      fill="none"
                      stroke={lane.color}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      strokeDasharray="3 2"
                    />
                  )}

                  {/* Indicador de color de rama */}
                  <circle
                    cx={headerX + 16}
                    cy={headerY + 15}
                    r={5}
                    fill={lane.color}
                  />

                  {/* Nombre de la rama */}
                  <text
                    x={headerX + 28}
                    y={headerY + 18.5}
                    fill="#f8fafc"
                    fontSize={10.5}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {lane.name}
                  </text>

                  {/* Badge HEAD si es la rama actual */}
                  {lane.isCurrent && (
                    <g transform={`translate(${headerX + headerW - 38}, ${headerY + 7.5})`}>
                      <rect
                        x={0}
                        y={0}
                        width={32}
                        height={15}
                        rx={3}
                        fill="#ea580c"
                      />
                      <text
                        x={16}
                        y={10.5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={8}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        HEAD
                      </text>
                    </g>
                  )}

                  {/* Conector indicador hacia abajo hacia el riel */}
                  <path
                    d={`M ${lane.x - 3} ${headerY + headerH + 1} L ${lane.x} ${headerY + headerH + 4} L ${lane.x + 3} ${headerY + headerH + 1}`}
                    fill="none"
                    stroke={lane.color}
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
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
              {getCommitDisplayInfo(selectedNode.commit, 0).full}
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
                <span>Padres: {selectedNode.commit.parentIds.map((pId) => getCommitDisplayInfo(pId, 0).hash).join(', ') || '(ninguno / root)'}</span>
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

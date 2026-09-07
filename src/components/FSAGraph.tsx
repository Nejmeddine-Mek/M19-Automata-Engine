import { useState, useEffect, useRef } from "react";
import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { ThemeType } from "../App";

interface FSAGraphProps {
  definition: FsaDefinition | null;
  activeStates?: string[];
  theme: ThemeType;
}

interface NodePos {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  labels: string[];
}

export default function FSAGraph({ definition, activeStates = [], theme }: FSAGraphProps) {
  const [nodePositions, setNodePositions] = useState<Map<string, NodePos>>(new Map());
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute node positions and transition edges whenever definition changes
  useEffect(() => {
    if (!definition) {
      setNodePositions(new Map());
      return;
    }

    const statesSet = new Set<string>();
    if (definition.initial) statesSet.add(definition.initial);
    if (definition.finalStates) {
      definition.finalStates.forEach((s) => statesSet.add(s));
    }
    if (definition.stateTransition) {
      definition.stateTransition.forEach((symbolMap, fromState) => {
        statesSet.add(fromState);
        symbolMap.forEach((nextStates) => {
          nextStates.forEach((toState) => statesSet.add(toState));
        });
      });
    }

    const stateList = Array.from(statesSet);
    const total = stateList.length;
    const width = 600;
    const height = 320;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const newPositions = new Map<string, NodePos>();
    stateList.forEach((state, i) => {
      // Circular layout
      const angle = (2 * Math.PI * i) / Math.max(total, 1) - Math.PI / 2;
      const x = total === 1 ? centerX : centerX + radius * Math.cos(angle);
      const y = total === 1 ? centerY : centerY + radius * Math.sin(angle);
      newPositions.set(state, { id: state, x, y });
    });

    setNodePositions(newPositions);
  }, [definition]);

  // Handle Dragging
  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(30, Math.min(rect.width - 30, e.clientX - rect.left));
    const y = Math.max(30, Math.min(rect.height - 30, e.clientY - rect.top));

    setNodePositions((prev) => {
      const next = new Map(prev);
      const node = next.get(draggingNode);
      if (node) {
        next.set(draggingNode, { ...node, x, y });
      }
      return next;
    });
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  if (!definition) {
    return (
      <div className={`w-full h-64 flex items-center justify-center ${theme.fontMono} ${theme.textMuted} border ${theme.borderSubtle} rounded-lg ${theme.bgPanelInner}`}>
        No FSA definition loaded for diagram visualization.
      </div>
    );
  }

  // Build edges list grouped by (from -> to)
  const edgesMap = new Map<string, Edge>();
  if (definition.stateTransition) {
    definition.stateTransition.forEach((symbolMap, fromState) => {
      symbolMap.forEach((nextStates, symbol) => {
        nextStates.forEach((toState) => {
          const key = `${fromState}->${toState}`;
          const existing = edgesMap.get(key);
          if (existing) {
            if (!existing.labels.includes(symbol)) {
              existing.labels.push(symbol);
            }
          } else {
            edgesMap.set(key, { from: fromState, to: toState, labels: [symbol] });
          }
        });
      });
    });
  }

  const edges = Array.from(edgesMap.values());
  const nodes = Array.from(nodePositions.values());
  const NODE_RADIUS = 22;

  return (
    <div className={`w-full flex flex-col items-center justify-center p-3 border ${theme.border} rounded-lg ${theme.bgPanelInner} shadow-sm select-none`}>
      <div className="flex items-center justify-between w-full mb-1 px-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${theme.fontMono} ${theme.textTitle}`}>
          ⚙️ FSA State Transition Diagram
        </span>
        <span className={`text-[10px] ${theme.fontMono} ${theme.textMuted}`}>
          Drag nodes to reposition
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 600 320"
        className="w-full h-72 cursor-crosshair bg-zinc-950/60 rounded-md border border-zinc-800/80 overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Arrowhead marker for edges */}
          <marker
            id="fsa-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
          </marker>

          {/* Start arrow marker */}
          <marker
            id="start-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* ── Render Edges (Transitions) ──────────────────────────────────── */}
        {edges.map((edge, idx) => {
          const source = nodePositions.get(edge.from);
          const target = nodePositions.get(edge.to);
          if (!source || !target) return null;

          const labelText = edge.labels.join(", ");

          // Self-loop (fromState === toState)
          if (edge.from === edge.to) {
            const loopX = source.x;
            const loopY = source.y - NODE_RADIUS;
            const pathD = `M ${loopX - 10} ${loopY} C ${loopX - 25} ${loopY - 35}, ${loopX + 25} ${loopY - 35}, ${loopX + 10} ${loopY}`;

            return (
              <g key={`edge-self-${idx}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  markerEnd="url(#fsa-arrow)"
                />
                <text
                  x={loopX}
                  y={loopY - 38}
                  textAnchor="middle"
                  fill="#38bdf8"
                  className="font-mono text-[11px] font-bold fill-sky-400"
                >
                  {labelText}
                </text>
              </g>
            );
          }

          // Check if reverse edge exists (bidirectional)
          const hasReverse = edgesMap.has(`${edge.to}->${edge.from}`);

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.hypot(dx, dy) || 1;

          // Shorten path to touch node border, not center
          const offsetX = (dx / dist) * NODE_RADIUS;
          const offsetY = (dy / dist) * NODE_RADIUS;

          const startX = source.x + offsetX;
          const startY = source.y + offsetY;
          const endX = target.x - offsetX;
          const endY = target.y - offsetY;

          // Curve offset for bidirectional edges
          const curveOffset = hasReverse ? 25 : 0;
          const midX = (startX + endX) / 2 - (dy / dist) * curveOffset;
          const midY = (startY + endY) / 2 + (dx / dist) * curveOffset;

          const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

          return (
            <g key={`edge-${idx}`}>
              <path
                d={pathD}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                markerEnd="url(#fsa-arrow)"
              />
              <rect
                x={midX - (labelText.length * 4 + 4)}
                y={midY - 10}
                width={labelText.length * 8 + 8}
                height="16"
                rx="4"
                fill="#09090b"
                stroke="#18181b"
                strokeWidth="1"
              />
              <text
                x={midX}
                y={midY + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono text-[11px] font-bold fill-sky-400"
              >
                {labelText}
              </text>
            </g>
          );
        })}

        {/* ── Render Nodes (States) ────────────────────────────────────────── */}
        {nodes.map((node) => {
          const isInitial = definition.initial === node.id;
          const isFinal = definition.finalStates ? definition.finalStates.has(node.id) : false;
          const isActive = activeStates.includes(node.id);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
              className="cursor-grab active:cursor-grabbing"
            >
              {/* Initial State Entry Pointer Arrow */}
              {isInitial && (
                <g transform="translate(-42, 0)">
                  <line
                    x1="0"
                    y1="0"
                    x2="16"
                    y2="0"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    markerEnd="url(#start-arrow)"
                  />
                  <text
                    x="-8"
                    y="-6"
                    className="font-mono text-[9px] font-bold fill-sky-400 uppercase"
                  >
                    Start
                  </text>
                </g>
              )}

              {/* Active State Outer Glowing Pulse Ring */}
              {isActive && (
                <circle
                  r={NODE_RADIUS + 6}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="animate-ping opacity-75"
                />
              )}

              {/* Base Circle */}
              <circle
                r={NODE_RADIUS}
                fill={isActive ? "#0369a1" : "#18181b"}
                stroke={isActive ? "#38bdf8" : isFinal ? "#10b981" : "#3f3f46"}
                strokeWidth={isActive ? "2.5" : "2"}
                className="transition-colors duration-200 shadow-lg"
              />

              {/* Accept State Concentric Double Ring */}
              {isFinal && (
                <circle
                  r={NODE_RADIUS - 4}
                  fill="none"
                  stroke={isActive ? "#7dd3fc" : "#10b981"}
                  strokeWidth="1.5"
                />
              )}

              {/* State Label Text */}
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className={`font-mono text-xs font-bold pointer-events-none select-none ${
                  isActive ? "fill-white" : isFinal ? "fill-emerald-300" : "fill-zinc-200"
                }`}
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

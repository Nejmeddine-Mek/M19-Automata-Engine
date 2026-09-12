import { useState, useEffect, useRef } from "react";
import type { ThemeType } from "../App";

export interface ActionTransition {
  action: string[];
  nextStates: string[];
}

export interface LBADefinition {
  initial: string;
  finalStates: Set<string>;
  beginningSymbol: string;
  endSymbol: string;
  rightSymbol: string;
  leftSymbol: string;
  stateTransition: Map<string, Map<string, ActionTransition>>;
}

interface LBAGraphProps {
  definition: LBADefinition | null;
  activeStates?: string[];
  theme: ThemeType;
  language?: "en" | "fr";
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

export default function LBAGraph({ definition, activeStates = [], theme, language = "en" }: LBAGraphProps) {
  const [nodePositions, setNodePositions] = useState<Map<string, NodePos>>(new Map());
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 }); // Tracks where exactly you clicked on the node

  const isFr = language === "fr";

  // Dimensions
  const VIEWBOX_WIDTH = 720;
  const VIEWBOX_HEIGHT = 400;

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
        symbolMap.forEach((actionTrans) => {
          actionTrans.nextStates.forEach((toState) => statesSet.add(toState));
        });
      });
    }

    const stateList = Array.from(statesSet);
    const total = stateList.length;
    const centerX = VIEWBOX_WIDTH / 2;
    const centerY = VIEWBOX_HEIGHT / 2;
    const radius = Math.min(VIEWBOX_WIDTH, VIEWBOX_HEIGHT) * 0.35;

    const newPositions = new Map<string, NodePos>();
    stateList.forEach((state, i) => {
      const angle = (2 * Math.PI * i) / Math.max(total, 1) - Math.PI / 2;
      const x = total === 1 ? centerX : centerX + radius * Math.cos(angle);
      const y = total === 1 ? centerY : centerY + radius * Math.sin(angle);
      newPositions.set(state, { id: state, x, y });
    });

    setNodePositions(newPositions);
  }, [definition]);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = VIEWBOX_WIDTH / rect.width;
    const scaleY = VIEWBOX_HEIGHT / rect.height;
    
    // Map screen pixel to viewBox coordinate
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const node = nodePositions.get(id);
    if (node) {
      // Calculate difference between mouse click and node center
      dragOffset.current = {
        x: mouseX - node.x,
        y: mouseY - node.y
      };
    }
    
    setDraggingNode(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = VIEWBOX_WIDTH / rect.width;
    const scaleY = VIEWBOX_HEIGHT / rect.height;

    // Apply scale and offset so the node doesn't jump
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const x = Math.max(30, Math.min(VIEWBOX_WIDTH - 30, mouseX - dragOffset.current.x));
    const y = Math.max(30, Math.min(VIEWBOX_HEIGHT - 30, mouseY - dragOffset.current.y));

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

  const handleSavePNG = () => {
    if (!svgRef.current) return;

    const clonedSvg = svgRef.current.cloneNode(true) as SVGSVGElement;
    const pingElements = clonedSvg.querySelectorAll(".animate-ping");
    pingElements.forEach((el) => el.remove());

    clonedSvg.querySelectorAll("marker path").forEach((el) => {
      el.setAttribute("fill", "#000000");
    });

    clonedSvg.querySelectorAll("path, line").forEach((el) => {
      if (el.getAttribute("stroke")) {
        el.setAttribute("stroke", "#000000");
      }
    });

    clonedSvg.querySelectorAll("circle").forEach((el) => {
      const isRing = el.getAttribute("fill") === "none";
      if (isRing) {
        el.setAttribute("stroke", "#000000");
      } else {
        el.setAttribute("fill", "#ffffff");
        el.setAttribute("stroke", "#000000");
        el.setAttribute("stroke-width", "2");
      }
    });

    clonedSvg.querySelectorAll("rect").forEach((el) => {
      el.setAttribute("fill", "#ffffff");
      el.setAttribute("stroke", "#ffffff");
    });

    clonedSvg.querySelectorAll("text").forEach((el) => {
      el.setAttribute("fill", "#000000");
      el.removeAttribute("class");
      el.setAttribute(
        "style",
        "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-weight: 700; fill: #000000;"
      );
    });

    let defs = clonedSvg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      clonedSvg.insertBefore(defs, clonedSvg.firstChild);
    }
    const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleEl.textContent = `
      text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-weight: 700; fill: #000000 !important; }
    `;
    defs.appendChild(styleEl);

    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("width", String(VIEWBOX_WIDTH));
    clonedSvg.setAttribute("height", String(VIEWBOX_HEIGHT));

    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = VIEWBOX_WIDTH * scale;
      canvas.height = VIEWBOX_HEIGHT * scale;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.scale(scale, scale);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, VIEWBOX_WIDTH, VIEWBOX_HEIGHT);
        ctx.drawImage(img, 0, 0, VIEWBOX_WIDTH, VIEWBOX_HEIGHT);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = "lba_graph.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  if (!definition) {
    return (
      <div className={`w-full h-[400px] flex items-center justify-center ${theme.fontMono} ${theme.textMuted} border ${theme.borderSubtle} rounded-lg ${theme.bgPanelInner}`}>
        {isFr ? "Aucune définition LBA chargée pour la visualisation du diagramme." : "No LBA definition loaded for diagram visualization."}
      </div>
    );
  }

  const edgesMap = new Map<string, Edge>();
  if (definition.stateTransition) {
    definition.stateTransition.forEach((symbolMap, fromState) => {
      symbolMap.forEach((actionTrans, symbol) => {
        actionTrans.nextStates.forEach((toState) => {
          const key = `${fromState}->${toState}`;
          const actionStr = actionTrans.action.join(",");
          const labelString = `${symbol}/${actionStr}`;
          
          const existing = edgesMap.get(key);
          if (existing) {
            if (!existing.labels.includes(labelString)) {
              existing.labels.push(labelString);
            }
          } else {
            edgesMap.set(key, { from: fromState, to: toState, labels: [labelString] });
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
          {isFr ? "⚙️ Diagramme de Transitions d'États LBA" : "⚙️ LBA State Transition Diagram"}
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] ${theme.fontMono} ${theme.textMuted}`}>
            {isFr ? "Glisser les nœuds pour repositionner" : "Drag nodes to reposition"}
          </span>
          <button
            onClick={handleSavePNG}
            className={`px-2 py-1 text-[11px] font-medium rounded flex items-center gap-1.5 transition-colors border ${theme.border} ${theme.textTitle} hover:border-sky-500 hover:text-sky-400`}
            title={isFr ? "Enregistrer sous forme d'image PNG" : "Save graph as PNG"}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isFr ? "Enregistrer PNG" : "Save PNG"}
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="w-full h-[400px] cursor-crosshair bg-zinc-950/60 rounded-md border border-zinc-800/80 overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="lba-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
          </marker>

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

        {edges.map((edge, idx) => {
          const source = nodePositions.get(edge.from);
          const target = nodePositions.get(edge.to);
          if (!source || !target) return null;

          const labelText = edge.labels.join(" | ");

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
                  markerEnd="url(#lba-arrow)"
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

          const hasReverse = edgesMap.has(`${edge.to}->${edge.from}`);

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.hypot(dx, dy) || 1;

          const offsetX = (dx / dist) * NODE_RADIUS;
          const offsetY = (dy / dist) * NODE_RADIUS;

          const startX = source.x + offsetX;
          const startY = source.y + offsetY;
          const endX = target.x - offsetX;
          const endY = target.y - offsetY;

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
                markerEnd="url(#lba-arrow)"
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
                    {isFr ? "Début" : "Start"}
                  </text>
                </g>
              )}

              {isActive && (
                <circle
                  r={NODE_RADIUS + 6}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="animate-ping opacity-75"
                />
              )}

              <circle
                r={NODE_RADIUS}
                fill={isActive ? "#0369a1" : "#18181b"}
                stroke={isActive ? "#38bdf8" : isFinal ? "#10b981" : "#3f3f46"}
                strokeWidth={isActive ? "2.5" : "2"}
                className="transition-colors duration-200 shadow-lg"
              />

              {isFinal && (
                <circle
                  r={NODE_RADIUS - 4}
                  fill="none"
                  stroke={isActive ? "#7dd3fc" : "#10b981"}
                  strokeWidth="1.5"
                />
              )}

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
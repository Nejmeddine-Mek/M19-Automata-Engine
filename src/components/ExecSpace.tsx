import React, { useState } from 'react';
import type { ActiveTape } from '../models/interfaces/activeTapeConfigs';
import type { ExecutionStatus } from '../models/interfaces/executionStatus';
import Tape from './Tape';
import Stack from './Stack';
import FSAGraph from './FSAGraph';
import type { FsaDefinition } from '../models/interfaces/FsaDefinition';
import type { PDADefinition } from '../models/interfaces/PDADefinition';
import type { LBADefinition } from '../models/interfaces/LBADefinition';
import type { TMDefinition } from '../models/interfaces/TMDefinition';

export interface ThemeConfig {
  bgApp: string;
  bgSidebar: string;
  bgPanelInner: string;
  bgInput: string;
  border: string;
  borderSubtle: string;
  textTitle: string;
  textInput: string;
  textMuted: string;
  focusRing: string;
  fontSans: string;
  fontMono: string;
}

interface ExecSpaceProps {
  theme: ThemeConfig;
  language?: "en" | "fr";
  activeTapes: ActiveTape[];
  executionStatus: ExecutionStatus;
  machineDefinition?: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null;
  canStepBack: boolean;
  canStepForward: boolean;
  onExecute: (inputTape: string, animationDelay: number) => void;
  onStep: () => void;
  onRun: () => void;
  onPause: () => void;
  onHalt: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
}

export function ExecSpace({
  theme,
  language = "en",
  activeTapes,
  executionStatus,
  machineDefinition,
  canStepBack,
  canStepForward,
  onExecute,
  onStep,
  onRun,
  onPause,
  onHalt,
  onStepBack,
  onStepForward,
}: ExecSpaceProps) {
  const [inputArg, setInputArg] = useState<string>('');
  const [animSpeed, setAnimSpeed] = useState<number>(800); // Speed in ms
  const [showDiagram, setShowDiagram] = useState<boolean>(true);

  const isFr = language === "fr";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute(inputArg, animSpeed);
  };

  const { isExecuting, isHalted, isAccepted, isRejected } = executionStatus;

  return (
    <div className={`w-full flex flex-col ${theme.bgPanelInner} border ${theme.border} rounded-lg shadow-sm ${theme.fontSans}`}>
      {/* ── Environment Execution Setup Toolbar ───────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className={`flex flex-wrap items-center justify-between gap-4 p-3 border-b ${theme.borderSubtle}`}
      >
        {/* Machine Input Argument */}
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <label 
            htmlFor="exec-input-arg" 
            className={`text-xs font-semibold uppercase tracking-wider ${theme.textTitle} ${theme.fontMono}`}
          >
            {isFr ? "Entrée:" : "Input:"}
          </label>
          <input
            id="exec-input-arg"
            type="text"
            value={inputArg}
            onChange={(e) => setInputArg(e.target.value)}
            placeholder="e.g. w = 1011001"
            disabled={isExecuting}
            className={`flex-1 px-3 py-1.5 text-sm ${theme.fontMono} ${theme.bgInput} ${theme.textInput} border ${theme.border} rounded outline-none ${theme.focusRing} disabled:opacity-50 transition-all placeholder:${theme.textMuted}`}
          />
        </div>

        {/* Speed Slider */}
        <div className={`flex items-center gap-3 px-3 border-x ${theme.borderSubtle}`}>
          <label 
            htmlFor="speed-range" 
            className={`text-xs ${theme.fontMono} uppercase tracking-wider ${theme.textMuted} whitespace-nowrap`}
          >
            {isFr ? "Délai:" : "Delay:"} <span className={`font-bold ${theme.textTitle} w-12 inline-block text-right`}>{animSpeed}ms</span>
          </label>
          <input
            id="speed-range"
            type="range"
            min="50"
            max="1500"
            step="50"
            value={animSpeed}
            onChange={(e) => setAnimSpeed(Number(e.target.value))}
            disabled={isExecuting}
            className="w-28 accent-sky-500 bg-gray-200 rounded cursor-pointer disabled:opacity-30"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* History Back */}
          <button
            type="button"
            onClick={onStepBack}
            disabled={!canStepBack || isExecuting}
            title={isFr ? "Reculer" : "Step Back"}
            className="px-2.5 py-1.5 text-xs font-semibold font-mono bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded text-zinc-200 cursor-pointer"
          >
            ◀
          </button>

          {/* Step Forward */}
          <button
            type="button"
            onClick={onStep}
            disabled={isHalted || isExecuting}
            title={isFr ? "Avancer d'un pas" : "Step Forward"}
            className="px-3 py-1.5 text-xs font-semibold font-mono bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded text-zinc-200 cursor-pointer"
          >
            {isFr ? "Pas ▶" : "Step ▶"}
          </button>

          {/* History Forward */}
          <button
            type="button"
            onClick={onStepForward}
            disabled={!canStepForward || isExecuting}
            title={isFr ? "Avancer (Historique)" : "Step Forward (History)"}
            className="px-2.5 py-1.5 text-xs font-semibold font-mono bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded text-zinc-200 cursor-pointer"
          >
            ▶
          </button>

          {/* Run / Pause Toggle */}
          {isExecuting ? (
            <button
              type="button"
              onClick={onPause}
              className="px-4 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white rounded transition-all shadow-sm cursor-pointer"
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={onRun}
              disabled={isHalted || activeTapes.length === 0}
              className="px-4 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded transition-all shadow-sm cursor-pointer"
            >
              {isFr ? "Exécuter" : "Run"}
            </button>
          )}

          {/* Execute (Initialize) Button */}
          <button
            type="submit"
            disabled={isExecuting}
            className="px-4 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider bg-sky-600 hover:bg-sky-500 text-white rounded transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isFr ? "Charger & Init" : "Load & Init"}
          </button>

          {/* Halt Action Button */}
          <button
            type="button"
            disabled={isHalted || activeTapes.length === 0}
            onClick={onHalt}
            className="px-4 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white rounded transition-all shadow-sm disabled:opacity-40 cursor-pointer"
          >
            {isFr ? "Arrêter" : "Halt"}
          </button>

          {/* Diagram Toggle Button */}
          {machineDefinition && 'epsilon' in machineDefinition && (
            <button
              type="button"
              onClick={() => setShowDiagram(!showDiagram)}
              className={`px-3 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider rounded transition-all shadow-sm cursor-pointer ${
                showDiagram ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {showDiagram ? (isFr ? 'Masquer Schéma' : 'Hide Diagram') : (isFr ? 'Afficher Schéma' : 'Show Diagram')}
            </button>
          )}
        </div>
      </form>

      {/* Status Bar Banner */}
      {(isAccepted || isRejected || isHalted) && (
        <div className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between border-b ${theme.borderSubtle} ${
          isAccepted ? 'bg-emerald-950/60 text-emerald-400' : isRejected ? 'bg-rose-950/60 text-rose-400' : 'bg-amber-950/60 text-amber-400'
        }`}>
          <span>
            {isAccepted
              ? (isFr ? '✓ Entrée Acceptée' : '✓ Input Accepted')
              : isRejected
              ? (isFr ? '✗ Entrée Rejetée' : '✗ Input Rejected')
              : (isFr ? '⏸ Exécution Arrêtée' : '⏸ Execution Halted')}
          </span>
          <span className="text-[10px] opacity-80">
            {isFr ? "Nombre de pas:" : "Step Count:"} {executionStatus.stepCount}
          </span>
        </div>
      )}

      {/* 2. Visualizer Workspace */}
      <div className={`flex-1 w-full ${theme.bgPanelInner} border ${theme.border} rounded-lg p-6 flex flex-col gap-6 items-center justify-start shadow-sm overflow-y-auto`}>
        {/* FSA State Transition Diagram */}
        {showDiagram && machineDefinition && 'epsilon' in machineDefinition && (
          <div className="w-full">
            <FSAGraph
              definition={machineDefinition as FsaDefinition}
              activeStates={activeTapes.map((t) => t.currentState).filter(Boolean) as string[]}
              theme={theme}
              language={language}
            />
          </div>
        )}
        {activeTapes && activeTapes.length > 0 ? (
          <div className="flex flex-col gap-4 w-full h-full justify-start">
            {activeTapes.map((tape: ActiveTape) => {
              const parentTape = activeTapes.find((t) => t.id === tape.parentId);
              const parentIndex = parentTape ? parentTape.index : undefined;

              return (
                <div key={tape.id} className="flex items-center gap-4 w-full">
                  {/* Tape Component */}
                  <div className="flex-1">
                    <Tape
                      id={tape.id}
                      theme={theme}
                      index={tape.index}
                      parentIndex={parentIndex}
                      tapeData={tape.tapeValue}
                      headPosition={tape.currentHeadPosition}
                      currentState={tape.currentState}
                      status={tape.status}
                      animationSpeed={animSpeed}
                    />
                  </div>
                  {/* Stack (renders only if tape.stack !== null) */}
                  {tape.stack !== null && (
                    <div className={`flex flex-col items-center p-3 min-w-[120px] ${theme.bgPanelInner} border ${theme.border} rounded-lg`}>
                      <span className={`text-[10px] font-bold ${theme.fontMono} uppercase ${theme.textMuted} mb-2`}>
                        Stack
                      </span>
                      <Stack />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <span className={`text-sm ${theme.fontMono} ${theme.textMuted}`}>
            No execution state loaded. Enter input above and click Load & Init.
          </span>
        )}
      </div>
    </div>
  );
}

export default ExecSpace;
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
import OperationsModal from './OperationsModal';
import LBAGraph from './LBAGraph';

import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from '../models/interfaces/configs';

export interface ThemeConfig {
  bgApp: string;
  bgPanel: string;
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
  machineConfig?: FSAConfig | PDAConfig | LBAConfig | TMConfig | null;
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
  machineConfig,
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

  const [ShowOperationsModal, setShowOperationsModal] = useState(false);
  
  const isFr = language === "fr";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute(inputArg, animSpeed);
  };

  const { isExecuting, isHalted, isAccepted, isRejected, errorMessage } = executionStatus;

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
            className="px-2.5 py-1.5 text-xs font-semibold font-mono bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 disabled:opacity-40 rounded cursor-pointer transition-colors border border-slate-300 dark:border-zinc-700 flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Step Forward */}
          <button
            type="button"
            onClick={onStep}
            disabled={isHalted || isExecuting}
            title={isFr ? "Avancer d'un pas" : "Step Forward"}
            className="px-3 py-1.5 text-xs font-semibold font-mono bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 disabled:opacity-40 rounded cursor-pointer transition-colors border border-slate-300 dark:border-zinc-700 flex items-center gap-1"
          >
            <span>{isFr ? "Pas" : "Step"}</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* History Forward */}
          <button
            type="button"
            onClick={onStepForward}
            disabled={!canStepForward || isExecuting}
            title={isFr ? "Avancer (Historique)" : "Step Forward (History)"}
            className="px-2.5 py-1.5 text-xs font-semibold font-mono bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 disabled:opacity-40 rounded cursor-pointer transition-colors border border-slate-300 dark:border-zinc-700 flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Run / Pause Toggle */}
          {isExecuting ? (
            <button
              type="button"
              onClick={onPause}
              className="px-4 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white rounded transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRun}
              disabled={isHalted || activeTapes.length === 0}
              className="px-4 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{isFr ? "Exécuter" : "Run"}</span>
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
          {machineDefinition &&('epsilon' in machineDefinition || 'endSymbol' in machineDefinition )&& (
            <button
              type="button"
              onClick={() => setShowDiagram(!showDiagram)}
              className={`px-3 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider rounded transition-all shadow-sm cursor-pointer border ${
                showDiagram 
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500 border-cyan-500' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border-slate-300 dark:border-zinc-700'
              }`}
            >
              {showDiagram ? (isFr ? 'Masquer Schéma' : 'Hide Diagram') : (isFr ? 'Afficher Schéma' : 'Show Diagram')}
            </button>
          )}
          {/* Operations button */}
          {machineDefinition &&'epsilon' in machineDefinition&& (
            <button
              type="button"
              onClick={() => setShowOperationsModal(true)}
              className="px-3 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider rounded transition-all shadow-sm cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1.5"
            >
              {(isFr ? 'Opérations et algorithmes' : 'Operations & Algorithms')}
            </button>
          )}
        </div>
      </form>

      {/* ── Prominent Error Banner Display ────────────────────────── */}
      {errorMessage && (
        <div className="mx-3 my-2 p-3 bg-rose-50 border border-rose-300 text-rose-900 dark:bg-rose-950/90 dark:border-rose-600 dark:text-rose-200 rounded-md text-xs font-mono flex items-start gap-2.5 shadow-sm">
          <svg className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <span className="font-bold block uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-0.5">
              {isFr ? "Erreur de Syntaxe / Exécution" : "Syntax / Execution Error"}
            </span>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Status Bar Banner */}
      {!errorMessage && (isAccepted || isRejected || isHalted) && (
        <div className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between border-b ${theme.borderSubtle} ${
          isAccepted 
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' 
            : isRejected 
            ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400' 
            : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
        }`}>
          <span className="flex items-center gap-1.5">
            {isAccepted ? (
              <>
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{isFr ? 'Entrée Acceptée' : 'Input Accepted'}</span>
              </>
            ) : isRejected ? (
              <>
                <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{isFr ? 'Entrée Rejetée' : 'Input Rejected'}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                <span>{isFr ? 'Exécution Arrêtée' : 'Execution Halted'}</span>
              </>
            )}
          </span>
          <span className="text-[10px] opacity-80">
            {isFr ? "Nombre de pas:" : "Step Count:"} {executionStatus.stepCount}
          </span>
        </div>
      )}

      {/* 2. Visualizer Workspace */}
      <div className={`flex-1 w-full ${theme.bgPanelInner} border ${theme.border} rounded-lg p-6 flex flex-col gap-6 items-center justify-start shadow-sm overflow-y-auto`}>
        {/* FSA State Transition Diagram */}
        {showDiagram && machineDefinition && 'endSymbol' in machineDefinition && (
          <div className='w-full'>
            <LBAGraph
              definition={machineDefinition as LBADefinition}
              activeStates={activeTapes.map(tape => tape.currentState).filter(Boolean) as string[]}
              theme={theme}
              language={language} 
            />
          </div>
        )}
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
                      lastInstruction={tape.lastInstruction}
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
            {isFr ? "Aucun état d'exécution chargé. Entrez une chaîne et cliquez sur Charger & Init." : "No execution state loaded. Enter input above and click Load & Init."}
          </span>
        )}
      </div>
      {ShowOperationsModal && (
        <OperationsModal isOpen={ShowOperationsModal} onClose={() => setShowOperationsModal(false)} definition={machineDefinition as FsaDefinition} machineConfig={machineConfig} theme={theme} language={language}/>
      )}
    </div>
  );
}

export default ExecSpace;
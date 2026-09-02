
import React, { useState } from 'react';
import type { ActiveTape } from '../models/interfaces/activeTapeConfigs';
import Tape from './Tape';
import Stack from './Stack';
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
  onExecute?: (isJumpToResults: boolean, animationDelay: number, inputTape: string) => void;
  isExecuting?: boolean;
  activeTapes: any

}

export function ExecSpace({ theme, onExecute, isExecuting = false, activeTapes}: ExecSpaceProps) {
  const [inputArg, setInputArg] = useState<string>('');
  const [animSpeed, setAnimSpeed] = useState<number>(500); // Speed in ms
  const [jumpToResults, setJumpToResults] = useState<boolean>(false);
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onExecute) {

      onExecute(jumpToResults, animSpeed, inputArg);
    }
  };

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
            Input:
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
            Delay: <span className={`font-bold ${theme.textTitle} w-12 inline-block text-right`}>{animSpeed}ms</span>
          </label>
          <input
            id="speed-range"
            type="range"
            min="50"
            max="1500"
            step="50"
            value={animSpeed}
            onChange={(e) => setAnimSpeed(Number(e.target.value))}
            disabled={jumpToResults || isExecuting}
            className="w-28 accent-sky-500 bg-gray-200 rounded cursor-pointer disabled:opacity-30"
          />
        </div>

        {/* Jump to Results Checkbox */}
        <label className={`flex items-center gap-2 cursor-pointer text-xs ${theme.fontMono} ${theme.textTitle} hover:${theme.textInput} select-none`}>
          <input
            type="checkbox"
            checked={jumpToResults}
            onChange={(e) => setJumpToResults(e.target.checked)}
            disabled={isExecuting}
            className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500/30 cursor-pointer accent-sky-500 disabled:opacity-50"
          />
          Jump to Results
        </label>

        {/* Execute Action Button */}
        <button
          type="submit"

          disabled={isExecuting}
          className={`px-4 py-1.5 text-xs font-semibold ${theme.fontMono} uppercase tracking-wider bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isExecuting ? 'Running...' : 'Execute'}
        </button>
                {/* Execute Action Button */}
        <button
        type="button"
        disabled={!isExecuting}
        className={`px-4 py-1.5 text-xs font-semibold ${theme.fontMono} uppercase tracking-wider 
            bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white 
            rounded transition-all duration-150 shadow-sm 
            disabled:bg-gray-200 disabled:text-gray-400 disabled:border-transparent 
            disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-60
            focus:outline-none focus:ring-2 focus:ring-rose-500/40`}
        >
        Halt
        </button>
      </form>
      {/* 2. Visualizer Workspace (Expands to fill all remaining vertical space) */}
      <div className={`flex-1 w-full ${theme.bgPanelInner} border ${theme.border} rounded-lg p-6 flex items-center justify-center shadow-sm`}>
        {activeTapes && activeTapes.length > 0 ? (
          <div className="flex flex-col gap-4 w-full h-full justify-start">
            {activeTapes.map((tape: ActiveTape, index: number) => (
              <div key={index} className="flex items-center gap-4 w-full">
                {/* Tape Component */}
                <div className="flex-1">
                  <Tape theme={theme} index={index} parentIndex={tape.parentIndex} tapeData={tape.tapeValue} headPosition={tape.currentHeadPosition}/>
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
            ))}
          </div>
        ) : (
          <span className={`text-sm ${theme.fontMono} ${theme.textMuted}`}>
            No execution state loaded. Enter input above and click Execute.
          </span>
        )}
      </div>
    </div>
  );
}

export default ExecSpace
import type { ThemeType } from '../App';

interface TapeProps {
  id: string;
  theme: ThemeType;
  index: number;
  parentIndex?: number;
  tapeData: string[];
  headPosition?: number;
  currentState?: string;
  lastInstruction?: string;
  animationSpeed?: number;
  status?: 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'HALTED';
}
const hashString = (str: string): number => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }

  return hash;
}
function getThreadColor(id: string, index: number, parentIndex?: number): { border: string; bg: string; text: string; triangle: string } {
  const hues = [
    { border: 'border-sky-500',     bg: 'bg-sky-500/10',     text: 'text-sky-700 dark:text-sky-400',       triangle: 'border-b-sky-700 dark:border-b-sky-400' },
    { border: 'border-indigo-500',  bg: 'bg-indigo-500/10',  text: 'text-indigo-700 dark:text-indigo-400', triangle: 'border-b-indigo-700 dark:border-b-indigo-400' },
    { border: 'border-violet-500',  bg: 'bg-violet-500/10',  text: 'text-violet-700 dark:text-violet-400', triangle: 'border-b-violet-700 dark:border-b-violet-400' },
    { border: 'border-purple-500',  bg: 'bg-purple-500/10',  text: 'text-purple-700 dark:text-purple-400', triangle: 'border-b-purple-700 dark:border-b-purple-400' },
    { border: 'border-fuchsia-500', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-700 dark:text-fuchsia-400', triangle: 'border-b-fuchsia-700 dark:border-b-fuchsia-400' },
    { border: 'border-pink-500',    bg: 'bg-pink-500/10',    text: 'text-pink-700 dark:text-pink-400',     triangle: 'border-b-pink-700 dark:border-b-pink-400' },
    { border: 'border-rose-500',    bg: 'bg-rose-500/10',    text: 'text-rose-700 dark:text-rose-400',     triangle: 'border-b-rose-700 dark:border-b-rose-400' },
    { border: 'border-red-500',     bg: 'bg-red-500/10',     text: 'text-red-700 dark:text-red-400',       triangle: 'border-b-red-700 dark:border-b-red-400' },
    { border: 'border-orange-500',  bg: 'bg-orange-500/10',  text: 'text-orange-700 dark:text-orange-400', triangle: 'border-b-orange-700 dark:border-b-orange-400' },
    { border: 'border-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-800 dark:text-amber-400',   triangle: 'border-b-amber-800 dark:border-b-amber-400' },
    { border: 'border-yellow-500',  bg: 'bg-yellow-500/10',  text: 'text-yellow-800 dark:text-yellow-400', triangle: 'border-b-yellow-800 dark:border-b-yellow-400' },
    { border: 'border-lime-500',    bg: 'bg-lime-500/10',    text: 'text-lime-800 dark:text-lime-400',     triangle: 'border-b-lime-800 dark:border-b-lime-400' },
    { border: 'border-green-500',   bg: 'bg-green-500/10',   text: 'text-green-800 dark:text-green-400',   triangle: 'border-b-green-800 dark:border-b-green-400' },
    { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-800 dark:text-emerald-400', triangle: 'border-b-emerald-800 dark:border-b-emerald-400' },
    { border: 'border-teal-500',    bg: 'bg-teal-500/10',    text: 'text-teal-800 dark:text-teal-400',     triangle: 'border-b-teal-800 dark:border-b-teal-400' },
    { border: 'border-cyan-500',    bg: 'bg-cyan-500/10',    text: 'text-cyan-800 dark:text-cyan-400',     triangle: 'border-b-cyan-800 dark:border-b-cyan-400' },
    { border: 'border-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-700 dark:text-blue-400',     triangle: 'border-b-blue-700 dark:border-b-blue-400' },
  ];

  
  const seed = parentIndex !== undefined ? (index * 31 + parentIndex * 17 + hashString(id)) : index + hashString(id);
  return hues[Math.abs(seed) % hues.length];
}

export default function Tape({
  id,
  theme,
  index,
  parentIndex,
  tapeData = [],
  headPosition = 0,
  currentState,
  lastInstruction,
  status = 'ACTIVE',
}: TapeProps) {
  const accent = getThreadColor(id, index, parentIndex);
  const displayTape = tapeData;
  const WINDOW_RADIUS = 5;
  const visibleStartIndex = Math.max(0, headPosition - WINDOW_RADIUS);
  const visibleEndIndex = Math.min(displayTape.length - 1, headPosition + WINDOW_RADIUS);

  const visibleTape = displayTape.slice(visibleStartIndex, visibleEndIndex + 1);
  const renderedHeadIndex = headPosition - visibleStartIndex;

  return (
    <div 
      className={`w-full flex flex-col p-3 ${theme.bgPanelInner} border ${theme.border} rounded-lg shadow-sm ${theme.fontSans} transition-all duration-200`}
    >
      {/* Thread Metadata Header */}
      <div className="flex flex-wrap items-center justify-between mb-2 px-1 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.fontMono} rounded uppercase border ${accent.border} ${accent.bg} ${accent.text}`}>
            Thread #{index}-{Math.abs(hashString(id) % 1000)}
          </span>

          {parentIndex !== undefined && (
            <span className={`text-[11px] ${theme.fontMono} ${theme.textMuted}`}>
              ← parent #{parentIndex}
            </span>
          )}
          {currentState && (
            <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.fontMono} rounded bg-slate-100 dark:bg-zinc-800/90 border border-slate-300 dark:border-zinc-700 text-sky-700 dark:text-cyan-400 shadow-xs`}>
              State: <span className="text-slate-900 dark:text-zinc-100">{currentState}</span>
            </span>
          )}
          {lastInstruction && (
            <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.fontMono} rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300`}>
              Instr: <span className="text-amber-900 dark:text-amber-200">{lastInstruction}</span>
            </span>
          )}
          {status && status !== 'ACTIVE' && (
            <span className={`px-1.5 py-0.5 text-[9px] font-bold ${theme.fontMono} rounded uppercase ${
              status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {status}
            </span>
          )}
        </div>
        <span className={`text-[11px] ${theme.fontMono} ${theme.textMuted}`}>
          Head Pos: <span className={`${theme.textInput} font-bold`}>{headPosition}</span>
        </span>
      </div>

      {/* Tape Cells Viewport Container (Windowed & Clipped Overflow) */}
      <div className="relative w-full max-w-xl mx-auto overflow-hidden flex flex-col items-center justify-center py-2 min-h-[90px]">
        {/* Sliding Tape Track (Windowed around headPosition) */}
        <div
          className="flex items-center gap-1.5 transition-transform duration-300 ease-in-out whitespace-nowrap"
          style={{
            transform: `translateX(calc(50% - ${renderedHeadIndex * 46 + 20}px))`,
          }}
        >
          {visibleTape.map((symbol, i) => {
            const idx = visibleStartIndex + i;
            const isHead = idx === headPosition;

            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center justify-center w-10 h-11 shrink-0 rounded border transition-all duration-200 select-none
                  ${theme.fontMono} text-sm font-bold
                  ${isHead 
                    ? `${accent.bg} ${accent.border} border-2 ${accent.text} shadow-md z-10 scale-105` 
                    : `${theme.bgInput} ${theme.border} ${theme.textInput} shadow-2xs`
                  }`}
              >
                <span>{symbol}</span>
              </div>
            );
          })}
        </div>

        {/* Fixed Center R/W Head Indicator */}
        <div className="flex flex-col items-center justify-center mt-1 z-20 pointer-events-none">
          <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] ${accent.triangle}`} />
          <div className={`text-[10px] font-bold uppercase tracking-wider ${theme.fontMono} ${accent.text}`}>
            ▲ R/W Head
          </div>
        </div>
      </div>
    </div>
  );
}
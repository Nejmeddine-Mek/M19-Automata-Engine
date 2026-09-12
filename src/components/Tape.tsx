import type { ThemeType } from '../App';

interface TapeProps {
  id: string;
  theme: ThemeType;
  index: number;
  parentIndex?: number;
  tapeData: string[];
  headPosition?: number;
  currentState?: string;
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
function getThreadColor(id: string, index: number, parentIndex?: number): { border: string; bg: string; text: string } {
  const hues = [
    { border: 'border-sky-500',     bg: 'bg-sky-500/10',     text: 'text-sky-600' },
    { border: 'border-indigo-500',  bg: 'bg-indigo-500/10',  text: 'text-indigo-600' },
    { border: 'border-violet-500',  bg: 'bg-violet-500/10',  text: 'text-violet-600' },
    { border: 'border-purple-500',  bg: 'bg-purple-500/10',  text: 'text-purple-600' },
    { border: 'border-fuchsia-500', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-600' },
    { border: 'border-pink-500',    bg: 'bg-pink-500/10',    text: 'text-pink-600' },
    { border: 'border-rose-500',    bg: 'bg-rose-500/10',    text: 'text-rose-600' },
    { border: 'border-red-500',     bg: 'bg-red-500/10',     text: 'text-red-600' },
    { border: 'border-orange-500',  bg: 'bg-orange-500/10',  text: 'text-orange-600' },
    { border: 'border-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-600' },
    { border: 'border-yellow-500',  bg: 'bg-yellow-500/10',  text: 'text-yellow-600' },
    { border: 'border-lime-500',    bg: 'bg-lime-500/10',    text: 'text-lime-600' },
    { border: 'border-green-500',   bg: 'bg-green-500/10',   text: 'text-green-600' },
    { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
    { border: 'border-teal-500',    bg: 'bg-teal-500/10',    text: 'text-teal-600' },
    { border: 'border-cyan-500',    bg: 'bg-cyan-500/10',    text: 'text-cyan-600' },
    { border: 'border-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-600' },
  ];

  
  const seed = parentIndex !== undefined ? (index * 31 + parentIndex * 17 + hashString(id)) : index + hashString(id);
  return hues[Math.abs(seed) % hues.length];
}

export default function Tape({
  id,
  theme,
  index,
  parentIndex,
  tapeData = ['⊔'],
  headPosition = 0,
  currentState,
  status = 'ACTIVE',
}: TapeProps) {
  const accent = getThreadColor(id, index, parentIndex);
  const displayTape = tapeData.length > 0 ? tapeData : ['⊔'];
  const WINDOW_RADIUS = 5; // 5 cells left + 1 center + 5 cells right = 11 visible cells window
  const visibleStartIndex = Math.max(0, headPosition - WINDOW_RADIUS);
  const visibleEndIndex = Math.min(displayTape.length - 1, headPosition + WINDOW_RADIUS);

  const visibleTape = displayTape.slice(visibleStartIndex, visibleEndIndex + 1);
  const renderedHeadIndex = headPosition - visibleStartIndex;

  return (
    <div 
      className={`w-full flex flex-col p-3 ${theme.bgPanelInner} border ${theme.border} rounded-lg shadow-sm ${theme.fontSans} transition-all duration-200`}
    >
      {/* Thread Metadata Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.fontMono} rounded uppercase border ${accent.border} ${accent.bg} ${accent.text}`}>
            Thread #{index}-{Math.abs(hashString(id) % 1000)}
          </span>


          {parentIndex !== undefined && (
            <span className={`text-[11px] ${theme.fontMono} ${theme.textMuted}`}>
              ← parent #{parentIndex}
            </span>
          )}
          {currentState && (
            <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.fontMono} rounded bg-zinc-800/90 border border-zinc-700 text-cyan-400 shadow-xs`}>
              State: <span className="text-zinc-100">{currentState}</span>
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
                    : `${theme.bgInput} ${theme.borderSubtle} ${theme.textInput} opacity-80`
                  }`}
              >
                <span>{symbol}</span>
{/**
                <span className={`absolute bottom-0.5 text-[9px] font-normal ${isHead ? accent.text : theme.textMuted}`}>
                  {idx}
                </span>
                */}
              </div>
            );
          })}
        </div>

        {/* Fixed Center R/W Head Indicator */}
        <div className="flex flex-col items-center justify-center mt-1 z-20 pointer-events-none">
          <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] ${accent.text.replace('text-', 'border-b-')}`} />
          <div className={`text-[10px] font-bold uppercase tracking-wider ${theme.fontMono} ${accent.text}`}>
            ▲ R/W Head
          </div>
        </div>
      </div>
    </div>
  );
}
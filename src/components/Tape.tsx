
import type { ThemeType } from '../App';

interface TapeProps {
  theme: ThemeType;
  index: number;            // Current thread/instance index
  parentIndex?: number;     // Parent thread index (for branching lineage)
  tapeData?: string[];      // Tape symbols array
  headPosition?: number;    // Active tape head index
  blankSymbol?: string;     // Default blank symbol (e.g. "B" or "⊔")
}

// Helper to generate a distinct accent hue based on thread lineage
function getThreadColor(index: number, parentIndex?: number): { border: string; bg: string; text: string; ring: string } {
  const hues = [
    { border: 'border-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-600', ring: 'ring-sky-500' },
    { border: 'border-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-600', ring: 'ring-indigo-500' },
    { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600', ring: 'ring-emerald-500' },
    { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600', ring: 'ring-amber-500' },
    { border: 'border-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-600', ring: 'ring-rose-500' },
    { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600', ring: 'ring-purple-500' },
    { border: 'border-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-600', ring: 'ring-teal-500' },
  ];
  
  // Use index hash offset by parentIndex for branch tracking
  const seed = parentIndex !== undefined ? (index * 31 + parentIndex * 17) : index;
  return hues[Math.abs(seed) % hues.length];
}

export function Tape({
  theme,
  index,
  parentIndex,
  tapeData = ['1', '0', '1', '1', '0'],
  headPosition = 2,
  blankSymbol = '⊔'
}: TapeProps) {
  const accent = getThreadColor(index, parentIndex);

  // Pad viewable range around current head position (e.g. 5 cells left, 5 cells right)
  const VIEW_RADIUS = 5;
  const visibleIndices: number[] = [];
  for (let i = headPosition - VIEW_RADIUS; i <= headPosition + VIEW_RADIUS; i++) {
    visibleIndices.push(i);
  }

  return (
    <div className={`w-full flex flex-col p-3 ${theme.bgPanelInner} border ${theme.border} rounded-lg shadow-sm ${theme.fontSans}`}>
      {/* ── Thread Metadata Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.fontMono} rounded uppercase border ${accent.border} ${accent.bg} ${accent.text}`}>
            Thread #{index}
          </span>
          {parentIndex !== undefined && (
            <span className={`text-[11px] ${theme.fontMono} ${theme.textMuted}`}>
              ← parent #{parentIndex}
            </span>
          )}
        </div>
        <span className={`text-[11px] ${theme.fontMono} ${theme.textMuted}`}>
          Head Pos: <span className={`${theme.textInput} font-bold`}>{headPosition}</span>
        </span>
      </div>

      {/* ── Tape Track Container ─────────────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center py-2 overflow-x-auto">
        
        {/* Static Center Head Pointer (Top) */}
        <div className="z-10 -mb-1 flex flex-col items-center">
          <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${accent.text.replace('text-', 'border-t-')}`} />
        </div>

        {/* Horizontal Cell Strip */}
        <div className="flex items-center gap-1.5 px-4 py-1">
          {visibleIndices.map((idx) => {
            const isHead = idx === headPosition;
            const symbol = (idx >= 0 && idx < tapeData.length) ? tapeData[idx] : blankSymbol;

            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center justify-center w-10 h-11 rounded border transition-all duration-200 select-none
                  ${theme.fontMono} text-sm font-bold
                  ${isHead 
                    ? `${accent.bg} ${accent.border} border-2 ${accent.text} shadow-sm scale-105 z-10` 
                    : `${theme.bgInput} ${theme.borderSubtle} ${theme.textInput} opacity-80`
                  }`}
              >
                {/* Symbol Value */}
                <span>{symbol}</span>

                {/* Index Label (Bottom micro-text) */}
                <span className={`absolute bottom-0.5 text-[9px] font-normal ${isHead ? accent.text : theme.textMuted}`}>
                  {idx}
                </span>
              </div>
            );
          })}
        </div>

        {/* Static Center Head Pointer (Bottom Label) */}
        <div className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${theme.fontMono} ${accent.text}`}>
          ▲ R/W Head
        </div>
      </div>
    </div>
  );
}

export default Tape
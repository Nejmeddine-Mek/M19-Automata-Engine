import { useEffect, useState, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import type { ThemeType } from '../App';
import type { TapeStepChange } from '../models/interfaces/activeTapeConfigs'
import type { TapeHandle } from '../models/interfaces/TapeHandle';

interface TapeProps {
  id: string;
  theme: ThemeType;
  index: number;
  parentIndex?: number;
  initialTapeData: string[];
  initialHeadPosition?: number;
  animationSpeed: number;
  onRegisterTape: (id: string, handle: TapeHandle) => void;
  onUnregisterTape: (id: string) => void;
}

function getThreadColor(index: number, parentIndex?: number): { border: string; bg: string; text: string } {
  const hues = [
    { border: 'border-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-600' },
    { border: 'border-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-600' },
    { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
    { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600' },
    { border: 'border-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-600' },
    { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600' },
    { border: 'border-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-600' },
  ];
  
  const seed = parentIndex !== undefined ? (index * 31 + parentIndex * 17) : index;
  return hues[Math.abs(seed) % hues.length];
}

export const Tape = forwardRef<TapeHandle, TapeProps>(function Tape(
  {
    id,
    theme,
    index,
    parentIndex,
    initialTapeData,
    initialHeadPosition = 0,
    animationSpeed,
    onRegisterTape,
    onUnregisterTape,
  },
  ref
) {
  // --- 1. LOCAL STATE VARIABLES ---
  const [tapeData, setTapeData] = useState<string[]>(
    initialTapeData.length > 0 ? initialTapeData : ['⊔']
  );
  const [headPosition, setHeadPosition] = useState<number>(initialHeadPosition);

  // Visual effect states
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Mutable ref prevents stale closure in writeSymbol
  const headPosRef = useRef(headPosition);
  headPosRef.current = headPosition;

  const accent = getThreadColor(index, parentIndex);

  // --- 2. PASSIVE ATOMIC OPERATIONS ---

  const writeSymbol = (symbol: string) => {
    setTapeData((prev) => {
      const next = [...prev];
      next[headPosRef.current] = symbol;
      return next;
    });

    setIsWriting(true);
    setTimeout(() => setIsWriting(false), animationSpeed);
  };

  const moveHead = (direction: 'LEFT' | 'RIGHT' | 'HOLD') => {
    if (direction === 'HOLD') return;

    setHeadPosition((prev) => (direction === 'LEFT' ? prev - 1 : prev + 1));

    setIsMoving(true);
    setTimeout(() => setIsMoving(false), animationSpeed);
  };

  const updateTape = (newTape: string[], newHeadPosition: number) => {
    setTapeData(newTape);
    setHeadPosition(newHeadPosition);

    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), animationSpeed);
  };

  const applyStepChange = (stepChange: TapeStepChange) => {
    if (stepChange.action === 'WRITE' && stepChange.writtenSymbol !== undefined) {
      writeSymbol(stepChange.writtenSymbol);
    } else if (stepChange.action === 'MOVE' && stepChange.direction) {
      moveHead(stepChange.direction);
    }
  };

  // --- 3. EXPOSE IMPERATIVE HANDLE ---

  const handleAPI: TapeHandle = useMemo(
    () => ({
      writeSymbol,
      moveHead,
      updateTape,
      applyStepChange,
      getSnapshot: () => ({
        tapeValue: tapeData,
        currentHeadPosition: headPosition,
      }),
    }),
    // Include dependencies so handleAPI stays fresh
    [writeSymbol, moveHead, updateTape, applyStepChange, tapeData, headPosition]
  )


  useImperativeHandle(ref, () => handleAPI);

  // --- 4. LIFECYCLE REGISTRATION ---
  console.log(onRegisterTape, onUnregisterTape)
  console.log("tape mounted, reached the useEffect point")
  useEffect(() => {
    console.log("pushing, tape mounted")
    onRegisterTape(id, handleAPI);

    return () => {
      onUnregisterTape(id);
    };
  }, [id, onRegisterTape, onUnregisterTape])

  // --- 5. RENDER UI ---

  return (
    <div 
      className={`w-full flex flex-col p-3 ${theme.bgPanelInner} border ${theme.border} rounded-lg shadow-sm ${theme.fontSans} transition-all duration-200
        ${isWriting ? 'ring-2 ring-amber-400/60' : ''}
        ${isRegenerating ? 'ring-2 ring-emerald-400/60 scale-[1.01]' : ''}
      `}
    >
      {/* Thread Metadata Header */}
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

      {/* Tape Cells */}
      <div className="relative flex flex-col items-center justify-center py-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 px-4 py-1">
          {tapeData.map((symbol, idx) => {
            const isHead = idx === headPosition;

            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center justify-center w-10 h-11 rounded border transition-all duration-200 select-none
                  ${theme.fontMono} text-sm font-bold
                  ${isHead 
                    ? `${accent.bg} ${accent.border} border-2 ${accent.text} shadow-sm z-10 
                       ${isMoving ? 'scale-110 ring-2 ring-sky-400/50' : 'scale-105'}` 
                    : `${theme.bgInput} ${theme.borderSubtle} ${theme.textInput} opacity-80`
                  }`}
              >
                {/* Pointer Arrow */}
                {isHead && (
                  <div className={`absolute -top-2 z-20 flex flex-col items-center transition-transform duration-150 ${isMoving ? '-translate-y-1' : ''}`}>
                    <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] ${accent.text.replace('text-', 'border-t-')}`} />
                  </div>
                )}

                <span>{symbol}</span>

                <span className={`absolute bottom-0.5 text-[9px] font-normal ${isHead ? accent.text : theme.textMuted}`}>
                  {idx}
                </span>
              </div>
            );
          })}
        </div>

        <div className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${theme.fontMono} ${accent.text}`}>
          ▲ R/W Head
        </div>
      </div>
    </div>
  );
});

export default Tape;
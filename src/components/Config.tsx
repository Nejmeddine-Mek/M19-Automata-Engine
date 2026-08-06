import { useState } from 'react';
import type { ThemeType } from '../App';

export type AutomatonType = 'TM' | 'LBA' | 'PDA' | 'FSA';

interface ConfigProps {
  theme: ThemeType;
}

export default function Config({ theme }: ConfigProps) {
  const [selectedType, setSelectedType] = useState<AutomatonType>('FSA');

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-semibold uppercase tracking-wider ${theme.textTitle}`}>
          Automaton Type
        </label>
        
        <div className="relative w-full">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AutomatonType)}
            className={`w-full appearance-none px-3 py-2 pr-8 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-lg text-sm font-medium transition-colors ${theme.focusRing} cursor-pointer outline-none`}
          >
            <option value="FSA" className={`${theme.bgInput} ${theme.border} ${theme.textInput}`}>Finite State Automata (FSA)</option>
            <option value="PDA" className={`${theme.bgInput} ${theme.border} ${theme.textInput}`}>PushDown Automata (PDA)</option>
            <option value="LBA" className={`${theme.bgInput} ${theme.border} ${theme.textInput}`}>Linear Bounded Automaton (LBA)</option>
            <option value="TM" className={`${theme.bgInput} ${theme.border} ${theme.textInput}`}>Turing Machine (TM)</option>
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        <div>
            <h4>Automaton Configuration</h4>
            {(
                () => {
                    switch (selectedType) {
                        case 'FSA':
                            return <p className="text-xs">FSA Config: Initial state & alphabet settings</p>;

                        case 'PDA':
                            return <p className="text-xs">PDA Config: Stack alphabet & initial symbol</p>;

                        case 'LBA':
                            return <p className="text-xs">LBA Config: Tape boundary limits & alphabet</p>;

                        case 'TM':
                            return <p className="text-xs">TM Config: Blank symbol & multi-tape controls</p>;

                        default:
                            return null;
                            }
                }
            )()}
          </div>

      </div>
    </div>
  );
}
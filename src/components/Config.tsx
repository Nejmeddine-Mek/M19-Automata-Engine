import React, { useState } from 'react';
import type { ThemeType } from '../App';

export type AutomatonType = 'TM' | 'LBA' | 'PDA' | 'FSA';

interface ConfigProps {
  theme: ThemeType;
}

export default function Config({ theme }: ConfigProps) {
  const [selectedType, setSelectedType] = useState<AutomatonType>('FSA');

  // Shared Engine Config
  const [alphabet, setAlphabet] = useState('a, b, c');
  const [epsilonSymbol, setEpsilonSymbol] = useState('ε');

  // PDA Specific
  const [stackInitialSymbol, setStackInitialSymbol] = useState('Z0');
  const [stackAlphabet, setStackAlphabet] = useState('0, 1, Z0');

  // LBA Specific
  const [leftBoundSymbol, setLeftBoundSymbol] = useState('<');
  const [rightBoundSymbol, setRightBoundSymbol] = useState('>');

  // TM Specific
  const [blankSymbol, setBlankSymbol] = useState('⊔');

  // UI state for saved feedback
  const [saved, setSaved] = useState(false);

  // Save configuration handler
  const handleSave = () => {
    // TODO: Connect to engine / parent state dispatch

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'FSA':
        return null; // FSA only needs basic Alphabet & Epsilon

      case 'PDA':
        return (
          <>
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                Initial Stack Symbol (Z₀)
              </label>
              <input
                type="text"
                value={stackInitialSymbol}
                onChange={(e) => setStackInitialSymbol(e.target.value)}
                className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                Stack Alphabet (Γ)
              </label>
              <input
                type="text"
                value={stackAlphabet}
                onChange={(e) => setStackAlphabet(e.target.value)}
                className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
              />
            </div>
          </>
        );

      case 'LBA':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                Left Marker (⊏)
              </label>
              <input
                type="text"
                value={leftBoundSymbol}
                onChange={(e) => setLeftBoundSymbol(e.target.value)}
                className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                Right Marker (⊐)
              </label>
              <input
                type="text"
                value={rightBoundSymbol}
                onChange={(e) => setRightBoundSymbol(e.target.value)}
                className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
              />
            </div>
          </div>
        );

      case 'TM':
        return (
          <div className="flex flex-col gap-1">
            <label className={`text-[11px] font-medium ${theme.textTitle}`}>
              Blank Symbol (B)
            </label>
            <input
              type="text"
              value={blankSymbol}
              onChange={(e) => setBlankSymbol(e.target.value)}
              className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Automaton Type Selector */}
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
          
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      <hr className={theme.borderSubtle} />

      {/* Engine Parameters */}
      <div className="flex flex-col gap-3">
        <h4 className={`text-xs font-semibold uppercase tracking-wider ${theme.textTitle}`}>
          Global Symbols & Markers
        </h4>

        {/* Input Tape Alphabet (Sigma) */}
        <div className="flex flex-col gap-1">
          <label className={`text-[11px] font-medium ${theme.textTitle}`}>
            Input Alphabet (Σ)
          </label>
          <input
            type="text"
            value={alphabet}
            onChange={(e) => setAlphabet(e.target.value)}
            placeholder="e.g. a, b, c"
            className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
          />
        </div>

        {/* Epsilon Notation */}
        <div className="flex flex-col gap-1">
          <label className={`text-[11px] font-medium ${theme.textTitle}`}>
            Epsilon Symbol (ε / λ)
          </label>
          <input
            type="text"
            value={epsilonSymbol}
            onChange={(e) => setEpsilonSymbol(e.target.value)}
            className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
          />
        </div>

        {/* Specialized Fields per Automaton */}
        {renderTypeSpecificFields()}
      </div>

      <hr className={theme.borderSubtle} />

      {/* Save Action Bar */}
      <div className="flex items-center justify-between pt-1">
        {saved ? (
          <span className="text-xs font-mono text-emerald-600 font-medium">
            ✓ Saved
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold ${theme.fontMono} uppercase tracking-wider 
            bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-md transition-all shadow-sm ${theme.focusRing}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Config
        </button>
      </div>
    </div>
  );
}
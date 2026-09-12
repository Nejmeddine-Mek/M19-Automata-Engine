import { useState } from 'react';
import type { ThemeType } from '../App';
import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from '../models/interfaces/configs';

export type AutomatonType = 'TM' | 'LBA' | 'PDA' | 'FSA';

interface ConfigProps {
  theme: ThemeType; // Replace with your actual theme type
  language?: "en" | "fr";
  onChangeConfig: (config: FSAConfig | PDAConfig | LBAConfig | TMConfig | null) => void;
}

export default function Config({ theme, language = "en", onChangeConfig }: ConfigProps) {
  const [selectedType, setSelectedType] = useState<AutomatonType>('FSA');

  const isFr = language === "fr";

  // Shared Engine Config
  const [alphabet, setAlphabet] = useState('a, b, c');
  const [epsilonSymbol, setEpsilonSymbol] = useState('e');

  // PDA Specific
  const [stackInitialSymbol, setStackInitialSymbol] = useState('Z0');
  const [stackAlphabet, setStackAlphabet] = useState('0, 1, Z0');

  // LBA Specific
  const [leftBoundSymbol, setLeftBoundSymbol] = useState('<');
  const [rightBoundSymbol, setRightBoundSymbol] = useState('>');
  const [auxiliaryAlphabet, setAuxiliaryAlphabet] = useState('x, y')
  // TM Specific
  const [blankSymbol, setBlankSymbol] = useState('⊔');
  const [rightSymbol, setRightSymbol] = useState('R')
  const [leftSymbol, setLeftSymbol] = useState('L')

  // UI state for saved feedback
  const [saved, setSaved] = useState(false);

  // Save configuration handler
  const handleSave = () => {
    // TODO: Connect to engine / parent state dispatch
    setSaved(true)
    const parsedLetters = alphabet.split(',').map(letter => letter.trim())
    const parsedAuxAlphabet = auxiliaryAlphabet.split(',').map(letter => letter.trim())
    console.log(parsedAuxAlphabet)
    switch(selectedType){
      case 'FSA':
        onChangeConfig({
          machineType : 'FSA',
          alphabet: parsedLetters,
          epsilon : epsilonSymbol.trim()
        }) 
        break
      case 'PDA':
        onChangeConfig(        {
          machineType: 'PDA'
        })
        break
      case 'LBA': {
        const lba: LBAConfig = {
          machineType: 'LBA',
          alphabet: [...parsedLetters, ...parsedAuxAlphabet],
          auxiliaryAlphabet: parsedAuxAlphabet,
          startSymbol: leftBoundSymbol,
          endSymbol: rightBoundSymbol,
          right: rightSymbol,
          left: leftSymbol
        }
        onChangeConfig(lba)
        break
      }
      case 'TM':
        onChangeConfig({
          machineType: 'TM',
          alphabet: parsedLetters,
          right: rightSymbol.trim(),
          left: leftSymbol.trim(),
          emptyTape: blankSymbol.trim()
        })
        break
      default:
        break
    }
  };

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'FSA':
        return (
          <>
            {/* Epsilon Notation */}
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                {isFr ? "Symbole Epsilon (ε)" : "Epsilon Symbol (ε)"}
              </label>
              <input
                type="text"
                value={epsilonSymbol}
                onChange={(e) => setEpsilonSymbol(e.target.value)}
                className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
              />
            </div>
          </>)

      case 'PDA':
        return (
          <>
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                {isFr ? "Symbole Initial de Pile (Z₀)" : "Initial Stack Symbol (Z₀)"}
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
                {isFr ? "Alphabet de Pile (Γ)" : "Stack Alphabet (Γ)"}
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
          <div className="flex flex-col gap-2">
            {/* Auxiliary Alphabet */}
            <div className="flex flex-col gap-1">
              <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                {isFr ? "Alphabet Auxiliaire" : "Auxiliary Alphabet"}
              </label>
              <input
                type="text"
                value={auxiliaryAlphabet}
                onChange={(e) => setAuxiliaryAlphabet(e.target.value)}
                placeholder="e.g. x, y"
                className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
              />
            </div>

            {/* Left & Right Markers */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                  {isFr ? "Marqueur Gauche (⊏)" : "Left Marker (⊏)"}
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
                  {isFr ? "Marqueur Droit (⊐)" : "Right Marker (⊐)"}
                </label>
                <input
                  type="text"
                  value={rightBoundSymbol}
                  onChange={(e) => setRightBoundSymbol(e.target.value)}
                  className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
                />
              </div>
            </div>

            {/* Right & Left Movement Symbols */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                  {isFr ? "Symbole Droit (R)" : "Right Symbol (R)"}
                </label>
                <input
                  type="text"
                  maxLength={1}
                  value={rightSymbol}
                  onChange={(e) => setRightSymbol(e.target.value)}
                  placeholder="R"
                  className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                  {isFr ? "Symbole Gauche (L)" : "Left Symbol (L)"}
                </label>
                <input
                  type="text"
                  maxLength={1}
                  value={leftSymbol}
                  onChange={(e) => setLeftSymbol(e.target.value)}
                  placeholder="L"
                  className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
                />
              </div>
            </div>
          </div>
          
        );
        case 'TM':
          return (
            <div className="flex flex-col gap-3 w-full">
              {/* Top Row: Blank Symbol */}
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                  {isFr ? "Symbole Vide (B)" : "Blank Symbol (B)"}
                </label>
                <input
                  type="text"
                  maxLength={1}
                  value={blankSymbol}
                  onChange={(e) => setBlankSymbol(e.target.value)}
                  className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
                />
              </div>

              {/* Bottom Row: Right and Left Movement Symbols */}
              <div className="flex flex-row items-center gap-3 w-full">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                    {isFr ? "Symbole Droit (R)" : "Right Symbol (R)"}
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={rightSymbol}
                    onChange={(e) => setRightSymbol(e.target.value)}
                    placeholder="R"
                    className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
                  />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label className={`text-[11px] font-medium ${theme.textTitle}`}>
                    {isFr ? "Symbole Gauche (L)" : "Left Symbol (L)"}
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={leftSymbol}
                    onChange={(e) => setLeftSymbol(e.target.value)}
                    placeholder="L"
                    className={`px-2.5 py-1.5 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-md text-xs font-mono outline-none ${theme.focusRing}`}
                  />
                </div>
              </div>
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
          {isFr ? "Type d'Automate" : "Automaton Type"}
        </label>
        
        <div className="relative w-full">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AutomatonType)}
            className={`w-full appearance-none px-3 py-2 pr-8 ${theme.bgInput} ${theme.border} ${theme.textInput} border rounded-lg text-sm font-medium transition-colors ${theme.focusRing} cursor-pointer outline-none`}
          >
            <option value="FSA" className={`${theme.bgInput} ${theme.border} ${theme.textInput}`}>
              {isFr ? "Automate à États Finis (FSA)" : "Finite State Automata (FSA)"}
            </option>
            <option value="PDA" className={`${theme.bgInput} ${theme.border} ${theme.textInput}`}>
              {isFr ? "Automate à Pile (PDA)" : "PushDown Automata (PDA)"}
            </option>
            <option value="LBA" className={`${theme.bgInput} ${theme.border} ${theme.textInput}`}>
              {isFr ? "Automate Borné Linéaire (LBA)" : "Linear Bounded Automaton (LBA)"}
            </option>
            <option value="TM" className={`${theme.bgInput} ${theme.border} ${theme.textInput}`}>
              {isFr ? "Machine de Turing (TM)" : "Turing Machine (TM)"}
            </option>
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
          {isFr ? "Symboles & Marqueurs Globaux" : "Global Symbols & Markers"}
        </h4>

        {/* Input Tape Alphabet (Sigma) */}
        <div className="flex flex-col gap-1">
          <label className={`text-[11px] font-medium ${theme.textTitle}`}>
            {isFr ? "Alphabet d'entrée (Σ)" : "Input Alphabet (Σ)"}
          </label>
          <input
            type="text"
            value={alphabet}
            onChange={(e) => setAlphabet(e.target.value)}
            placeholder="e.g. a, b, c"
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
            {isFr ? "✓ Enregistré" : "✓ Saved"}
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
          {isFr ? "Enregistrer Config" : "Save Config"}
        </button>
      </div>
    </div>
  );
}
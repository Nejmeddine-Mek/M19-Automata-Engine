import { useState, useEffect } from "react";
import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { ThemeType } from "../App";
import FSAGraph from "./FSAGraph";
import { mirrorFSA } from "../algorithms/mirror";
import { determinizeFSA } from "../algorithms/NFAtoDFA";
import { degeneralizeFSA } from "../algorithms/FSADegenralization";

import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "../models/interfaces/configs";
import { complementFSA } from "../algorithms/complement.";
import { trimFSA } from "../algorithms/trim";

interface OperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  definition: FsaDefinition | null;
  machineConfig?: FSAConfig | PDAConfig | LBAConfig | TMConfig | null;
  theme: ThemeType;
  language?: "en" | "fr";
}

// The new struct array format you requested
export interface OperationStep {
  def: FsaDefinition;
  remark: string;
}

export default function OperationsModal({
  isOpen,
  onClose,
  definition,
  machineConfig,
  theme,
  language = "en",
}: OperationsModalProps) {
  const isFr = language === "fr";

  // State for the selected operation and its generated steps
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationSteps, setOperationSteps] = useState<OperationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setActiveOperation(null);
      setOperationSteps([]);
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || !definition) return null;

  // ── Algorithm Handlers (TODO implementations) ───────────────────────

  const handleRunMirror = () => {
    setActiveOperation("mirror");
    setCurrentStepIndex(0);

    // TODO: Implement the actual L^R algorithm here
    // It should return an array of OperationStep objects
    const mockSteps: OperationStep[] = mirrorFSA(definition, language)
    setOperationSteps(mockSteps);
  };

  const handleRunNfaToDfa = () => {
    setActiveOperation("nfa2dfa");
    setCurrentStepIndex(0);
    
    // TODO: Implement NFA to DFA subset construction here
    const mockSteps: OperationStep[] = determinizeFSA(definition, language)
    setOperationSteps(mockSteps);
  };

  // ── Navigation ──────────────────────────────────────────────────────

  const currentStep = operationSteps[currentStepIndex];
  const totalSteps = operationSteps.length;
  const hasSteps = totalSteps > 0;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };
  const handleDegeneralization = () => {
    setActiveOperation("degeneralization");
    setCurrentStepIndex(0);
    const mockSteps: OperationStep[] = degeneralizeFSA(definition, language)

    setOperationSteps(mockSteps)
 }

 const handleComplement = () => {
    setActiveOperation("complement");
    setCurrentStepIndex(0);
    const mockSteps: OperationStep[] = complementFSA(definition, new Set((machineConfig as FSAConfig).alphabet), language)

    setOperationSteps(mockSteps)
 }
  const handleTrimFsa = () => {
    setActiveOperation("trim")
    setCurrentStepIndex(0)
    const mockSteps: OperationStep[] = trimFSA(definition, language)

    setOperationSteps(mockSteps)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      {/* Expanded max-width for side-by-side view */}
      <div className={`w-full max-w-5xl border ${theme.border} ${theme.bgPanelInner} rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.fontMono} ${theme.textTitle}`}>
              {isFr ? "Hub des Opérations" : "Operations Hub"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-zinc-800 ${theme.textMuted} hover:text-white transition-colors cursor-pointer`}
          >
            ✕
          </button>
        </div>

        {/* Options Stripe */}
        <div className={`flex items-center gap-3 px-5 py-3 border-b ${theme.border} bg-zinc-950/40 overflow-x-auto`}>
          <button
            onClick={handleRunMirror}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeOperation === "mirror" 
                ? "bg-indigo-600 text-white" 
                : `border border-zinc-700 ${theme.textMuted} hover:bg-zinc-800`
            }`}
          >
            {isFr ? "Automate Miroir (L^R)" : "Mirror Automaton (L^R)"}
          </button>
          
          <button
            onClick={handleRunNfaToDfa}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeOperation === "nfa2dfa" 
                ? "bg-indigo-600 text-white" 
                : `border border-zinc-700 ${theme.textMuted} hover:bg-zinc-800`
            }`}
          >
            {isFr ? "Déterminisation (NFA → DFA)" : "Determinization (NFA → DFA)"}
          </button>
                    <button
            onClick={handleDegeneralization}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeOperation === "degeneralization" 
                ? "bg-indigo-600 text-white" 
                : `border border-zinc-700 ${theme.textMuted} hover:bg-zinc-800`
            }`}
          >
            {isFr ? "Dégénéralisation (Mots → Caractères)" : "Degeneralization (Words → Characters)"}
          </button>
          <button
            onClick={handleComplement}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeOperation === "complement" 
                ? "bg-indigo-600 text-white" 
                : `border border-zinc-700 ${theme.textMuted} hover:bg-zinc-800`
            }`}
          >
            {isFr ? "Complément (États Inversés)" : "Complement (Inverted States)"}
          </button>
          <button
            onClick={handleTrimFsa}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeOperation === "trim" 
                ? "bg-indigo-600 text-white" 
                : `border border-zinc-700 ${theme.textMuted} hover:bg-zinc-800`
            }`}
          >
            {isFr ? "Élagage (Inaccessibles & Puits)" : "Trimming (Unreachable & Dead)"}
          </button>
        </div>

        {/* Modal Body: Side-by-Side Grid Layout */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch min-h-[460px]">
          {!hasSteps ? (
            <div className={`col-span-2 flex items-center justify-center border border-dashed ${theme.border} rounded-lg ${theme.textMuted} font-mono text-sm py-20`}>
              {isFr ? "Sélectionnez une opération ci-dessus pour commencer." : "Select an operation above to begin."}
            </div>
          ) : (
            <>
              {/* Left Column: Interactive Graph */}
              <div className={`flex items-center justify-center border ${theme.border} rounded-lg bg-zinc-950/30 p-2 overflow-hidden`}>
                <FSAGraph definition={currentStep.def} theme={theme} language={language} />
              </div>

              {/* Right Column: Explanation & Code Preview Panel */}
              <div className={`p-4 border ${theme.border} rounded-lg bg-zinc-950/50 font-mono text-xs ${theme.textMuted} flex flex-col gap-2 overflow-y-auto max-h-[440px]`}>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-sky-400 uppercase tracking-wide text-[10px]">
                    {isFr ? `Étape ${currentStepIndex + 1} sur ${totalSteps}` : `Step ${currentStepIndex + 1} of ${totalSteps}`}
                  </span>
                </div>
                {/* whitespace-pre-line ensures \n translates to actual line breaks */}
                <p className="whitespace-pre-line leading-relaxed text-zinc-200 mt-1">
                  {currentStep.remark}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className={`flex items-center justify-between px-5 py-3 border-t ${theme.border} bg-zinc-950/40`}>
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={!hasSteps || currentStepIndex === 0}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isFr ? "← Précédent" : "← Previous"}
          </button>

          {hasSteps && (
            <span className={`text-xs font-mono ${theme.textMuted}`}>
              {isFr ? `Étape ${currentStepIndex + 1} sur ${totalSteps}` : `Step ${currentStepIndex + 1} of ${totalSteps}`}
            </span>
          )}

          <button
            onClick={handleNext}
            disabled={!hasSteps}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {!hasSteps 
              ? (isFr ? "En attente..." : "Waiting...") 
              : currentStepIndex === totalSteps - 1 
                ? (isFr ? "✓ Terminer" : "✓ Finish") 
                : (isFr ? "Suivant →" : "Next →")}
          </button>
        </div>

      </div>
    </div>
  );
}
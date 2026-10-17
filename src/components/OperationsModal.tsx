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
import { fsaToRegex } from "../algorithms/DfaToRegex";
import { fsaToGrammar } from "../algorithms/dfaToGrammar";
import { regexToFsa } from "../algorithms/regexToFsa";
import { grammarToFsa } from "../algorithms/grammarToFsa";

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

  const handleFsaToRegex = () => {
    setActiveOperation("dfaToRegex")
    setCurrentStepIndex(0)
    const mockSteps = fsaToRegex(definition, (machineConfig as FSAConfig).alphabet, language)

    setOperationSteps(mockSteps)
  }
  const handleFsaToGrammar = () => {
    setActiveOperation("grammar")
    setCurrentStepIndex(0)
    const mockSteps = fsaToGrammar(definition, language)

    setOperationSteps(mockSteps)
  }
  const handleRunRegexToFsa = () => {
    const userInput = window.prompt(
        isFr 
            ? "Entrez l'expression régulière (utilisez 'E' pour tout l'alphabet) :" 
            : "Enter the regular expression (use 'E' for all alphabet):",
        "a|E*" // default example
    );

    // If the user typed something and didn't hit cancel
    if (userInput && userInput.trim() !== "") {
        setActiveOperation("regexToFsa");
        setCurrentStepIndex(0);
        // Pass the string to our algorithm!
        const steps = regexToFsa(userInput.replace(/\s+/g, ''), language); 
        setOperationSteps(steps);
    }
  };
  const handleRunGrammarToFsa = () => {
    const userInput = window.prompt(
        isFr 
            ? "Entrez la grammaire régulière (ex: S -> aA | b, A -> aS | e) :" 
            : "Enter regular grammar (e.g., S -> aA | b, A -> aS | e):",
        "S -> aA | b, A -> aS | e"
    );

    if (userInput && userInput.trim() !== "") {
        setActiveOperation("grammarToFsa");
        setCurrentStepIndex(0);
        // Clean spaces around arrows and pipes for safety, though the algorithm handles trims
        const steps = grammarToFsa(userInput, language); 
        setOperationSteps(steps);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      {/* Expanded max-width for side-by-side view */}
      <div className={`w-full max-w-5xl border ${theme.border} ${theme.bgPanelInner} rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.fontMono} ${theme.textTitle}`}>
              {isFr ? "Hub des Opérations" : "Operations Hub"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:${theme.bgPanelInner} ${theme.textMuted} hover:${theme.textInput} transition-colors cursor-pointer`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Options Stripe */}
        <div className={`flex items-center gap-2.5 px-5 py-3 border-b ${theme.border} bg-slate-100 dark:bg-zinc-950/40 overflow-x-auto`}>
          {[
            { id: "mirror", label: isFr ? "Automate Miroir (L^R)" : "Mirror Automaton (L^R)", handler: handleRunMirror },
            { id: "nfa2dfa", label: isFr ? "Déterminisation (NFA → DFA)" : "Determinization (NFA → DFA)", handler: handleRunNfaToDfa },
            { id: "degeneralization", label: isFr ? "Dégénéralisation (Mots → Caractères)" : "Degeneralization (Words → Characters)", handler: handleDegeneralization },
            { id: "complement", label: isFr ? "Complément (États Inversés)" : "Complement (Inverted States)", handler: handleComplement },
            { id: "trim", label: isFr ? "Élagage (Inaccessibles & Puits)" : "Trimming (Unreachable & Dead)", handler: handleTrimFsa },
            { id: "dfaToRegex", label: isFr ? "FSA vers Regex (Élimination)" : "FSA to Regex (State Elimination)", handler: handleFsaToRegex },
            { id: "grammar", label: isFr ? "DFA vers Grammaire" : "DFA to Grammar", handler: handleFsaToGrammar },
            { id: "regexToFsa", label: isFr ? "Regex vers FSA" : "Regex to FSA", handler: handleRunRegexToFsa },
            { id: "grammarToFsa", label: isFr ? "Grammaire vers FSA" : "Grammar to FSA", handler: handleRunGrammarToFsa },
          ].map((op) => (
            <button
              key={op.id}
              onClick={op.handler}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeOperation === op.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : `border border-slate-300 dark:border-zinc-700 ${theme.textTitle} hover:bg-slate-200 dark:hover:bg-zinc-800`
              }`}
            >
              {op.label}
            </button>
          ))}
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
              <div className={`flex items-center justify-center border ${theme.border} rounded-lg bg-slate-50 dark:bg-zinc-950/30 p-2 overflow-hidden`}>
                <FSAGraph definition={currentStep.def} theme={theme} language={language} />
              </div>

              {/* Right Column: Explanation & Code Preview Panel */}
              <div className={`p-4 border ${theme.border} rounded-lg bg-white dark:bg-zinc-950/50 font-mono text-xs flex flex-col gap-2 overflow-y-auto max-h-[440px] shadow-xs`}>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <span className="font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wide text-[10px]">
                    {isFr ? `Étape ${currentStepIndex + 1} sur ${totalSteps}` : `Step ${currentStepIndex + 1} of ${totalSteps}`}
                  </span>
                </div>
                {/* whitespace-pre-line ensures \n translates to actual line breaks */}
                <p className="whitespace-pre-line leading-relaxed text-slate-950 dark:text-zinc-200 mt-1 font-medium">
                  {currentStep.remark}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className={`flex items-center justify-between px-5 py-3 border-t ${theme.border} bg-slate-100 dark:bg-zinc-950/40`}>
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={!hasSteps || currentStepIndex === 0}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
                ? (isFr ? "Terminer" : "Finish") 
                : (isFr ? "Suivant →" : "Next →")}
          </button>
        </div>

      </div>
    </div>
  );
}
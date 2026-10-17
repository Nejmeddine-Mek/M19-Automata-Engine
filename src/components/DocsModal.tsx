import { useState } from "react";
import type { ThemeType } from "../App";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  language?: "en" | "fr";
}

type DocTab = "howto" | "fsa" | "lba" | "tm";

export default function DocsModal({
  isOpen,
  onClose,
  theme,
  language = "en",
}: DocsModalProps) {
  const [activeTab, setActiveTab] = useState<DocTab>("howto");
  const isFr = language === "fr";

  if (!isOpen) return null;

  const TABS: { id: DocTab; labelEn: string; labelFr: string }[] = [
    { id: "howto", labelEn: "App Guide", labelFr: "Guide de l'App" },
    { id: "fsa", labelEn: "FSA (Finite State)", labelFr: "FSA (Automates Finis)" },
    { id: "lba", labelEn: "LBA (Linear Bounded)", labelFr: "LBA (Bornés Linéairement)" },
    { id: "tm", labelEn: "TM (Turing Machine)", labelFr: "TM (Machine de Turing)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[85vh] ${theme.bgSidebar} border ${theme.border} rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
      >
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.borderSubtle} ${theme.bgPanelInner}`}>
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h2 className={`text-base font-bold ${theme.fontMono} ${theme.textInput}`}>
                {isFr ? "Documentation et Manuels" : "Documentation & Manuals"}
              </h2>
              <p className={`text-xs ${theme.textMuted}`}>
                {isFr ? "Apprenez à utiliser l'application et révisez la théorie." : "Learn how to use the app and review theoretical models."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textInput} transition-colors cursor-pointer text-sm`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Tabs Stripe ─────────────────────────────────────────────── */}
        <div className={`flex items-center gap-1.5 px-6 py-2.5 border-b ${theme.borderSubtle} overflow-x-auto scrollbar-none`}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-sky-600 text-white shadow-sm font-semibold"
                  : `border border-slate-300 dark:border-zinc-700/60 ${theme.textMuted} hover:bg-slate-100 dark:hover:bg-zinc-800`
              }`}
            >
              <span>{isFr ? tab.labelFr : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* ── Content Body ────────────────────────────────────────────── */}
        <div className={`flex-1 p-6 overflow-y-auto space-y-6 text-sm ${theme.textInput} leading-relaxed`}>
          
          {/* TAB 1: HOW TO USE */}
          {activeTab === "howto" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-zinc-700 pb-2 mb-4 text-sky-600 dark:text-sky-400">
                {isFr ? "Comment utiliser l'espace de travail" : "How to use the workspace"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${theme.borderSubtle} ${theme.bgPanelInner}`}>
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-zinc-100">
                    <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span>{isFr ? "Éditeur Visuel" : "Visual Editor"}</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-zinc-300">
                    <li>{isFr ? "Double-cliquez sur le canvas pour créer un état." : "Double-click the canvas to create a state."}</li>
                    <li>{isFr ? "Maintenez Shift + Glissez pour créer une transition." : "Hold Shift + Drag between states to create a transition."}</li>
                    <li>{isFr ? "Double-cliquez sur un état pour le marquer comme final." : "Double-click a state to toggle it as a final state."}</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-xl border ${theme.borderSubtle} ${theme.bgPanelInner}`}>
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-zinc-100">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{isFr ? "Opérations & Algorithmes" : "Operations & Algorithms"}</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-zinc-300">
                    <li>{isFr ? "Ouvrez le Hub d'Opérations en bas." : "Open the Operations Hub at the bottom."}</li>
                    <li>{isFr ? "Sélectionnez un algorithme (Déterminisation, Élagage, etc.)." : "Select an algorithm (Determinization, Trimming, etc.)."}</li>
                    <li>{isFr ? "Naviguez étape par étape pour voir les transformations." : "Navigate step-by-step to view the transformations."}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FSA */}
          {activeTab === "fsa" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-zinc-700 pb-2 mb-4 text-sky-600 dark:text-sky-400">
                {isFr ? "Automates Finis (FSA)" : "Finite State Automata (FSA)"}
              </h3>
              
              <div className={`p-4 rounded-xl border ${theme.borderSubtle} ${theme.bgPanelInner} font-mono text-xs`}>
                <h4 className="font-bold text-sky-600 dark:text-sky-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>{isFr ? "Syntaxe du Code (DSL)" : "Code Syntax (DSL)"}</span>
                </h4>
                <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-700 dark:text-zinc-300">
                  <li><strong>initial:</strong> {isFr ? "Exactement 1 état" : "Exactly 1 state"}</li>
                  <li><strong>final:</strong> {isFr ? "1 ou plusieurs états séparés par des virgules" : "1 or more states separated by commas"}</li>
                  <li><strong>Transition:</strong> <code className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 font-mono text-[11px] border border-slate-300 dark:border-zinc-700 font-semibold">&lt;state, read_symbol, next_state&gt;</code></li>
                  <li className="text-sky-700 dark:text-sky-400 italic border-l-2 border-sky-500 pl-2">
                    {isFr ? "L'ordre des lignes de transition n'a pas d'importance." : "The order of transition lines is not important."}
                  </li>
                </ul>
                <div className="bg-white dark:bg-black/50 p-3.5 rounded-lg border border-slate-300 dark:border-zinc-800 text-slate-950 dark:text-zinc-100 font-mono text-xs shadow-xs">
                  <span className="text-slate-500 dark:text-zinc-500 block mb-1"># Example</span>
                  <span className="text-sky-700 dark:text-sky-300 font-bold">initial:</span> q0<br/>
                  <span className="text-sky-700 dark:text-sky-300 font-bold">final:</span> q2, q3<br/>
                  q0, a, q1<br/>
                  q1, b, q2
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LBA */}
          {activeTab === "lba" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-zinc-700 pb-2 mb-4 text-sky-600 dark:text-sky-400">
                {isFr ? "Automates Bornés Linéairement (LBA)" : "Linear Bounded Automata (LBA)"}
              </h3>
              
              <div className={`p-4 rounded-xl border ${theme.borderSubtle} ${theme.bgPanelInner} font-mono text-xs`}>
                <h4 className="font-bold text-sky-600 dark:text-sky-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>{isFr ? "Syntaxe du Code (DSL)" : "Code Syntax (DSL)"}</span>
                </h4>
                <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-700 dark:text-zinc-300">
                  <li><strong>Headers:</strong> {isFr ? "Mêmes que FSA (initial, final)" : "Same as FSA (initial, final)"}</li>
                  <li><strong>Transition:</strong> <code className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 font-mono text-[11px] border border-slate-300 dark:border-zinc-700 font-semibold">&lt;state, read_symbol, action, next_state&gt;</code></li>
                  <li className="text-slate-600 dark:text-zinc-400">
                    {isFr ? "L'action (action) peut être l'écriture d'un symbole OU un déplacement (ex: L, R)." : "The action can be writing a new symbol OR moving the head (e.g., L, R)."}
                  </li>
                </ul>
                
                <div className="bg-white dark:bg-black/50 p-3.5 rounded-lg border border-slate-300 dark:border-zinc-800 mt-4 space-y-2 shadow-xs">
                  <p className="font-bold text-sky-700 dark:text-sky-300">{isFr ? "Règles du Ruban LBA" : "LBA Tape Rules"}</p>
                  <p className="text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {isFr 
                      ? "La tête de lecture commence par défaut sur le marqueur gauche ('C'). Lorsque vous atteignez le marqueur de fin de droite ('$'), vous devez configurer une transition pour vous déplacer vers la droite afin de terminer et valider la lecture complète du ruban." 
                      : "The read head starts at the left marker (default is 'C'). When you reach the right end marker ('$'), you must make a move right to successfully finish reading all tape."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TM */}
          {activeTab === "tm" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b border-slate-200 dark:border-zinc-700 pb-2 mb-4 text-sky-600 dark:text-sky-400">
                {isFr ? "Machines de Turing (TM)" : "Turing Machines (TM)"}
              </h3>
              
              <div className={`p-4 rounded-xl border ${theme.borderSubtle} ${theme.bgPanelInner} font-mono text-xs`}>
                <h4 className="font-bold text-sky-600 dark:text-sky-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>{isFr ? "Syntaxe & Mode Calculateur" : "Syntax & Calculator Mode"}</span>
                </h4>
                
                <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-700 dark:text-zinc-300">
                  <li><strong>Syntax:</strong> {isFr ? "Similaire au LBA :" : "Similar to LBA:"} <code className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 font-mono text-[11px] border border-slate-300 dark:border-zinc-700 font-semibold">&lt;state, read_symbol, action, next_state&gt;</code></li>
                  <li><strong>Tape:</strong> {isFr ? "Contrairement au LBA, le ruban de la TM est infini." : "Unlike the LBA, the TM tape is infinite."}</li>
                </ul>

                <div className="bg-white dark:bg-black/50 p-3.5 rounded-lg border border-slate-300 dark:border-zinc-800 mt-4 space-y-2 shadow-xs">
                  <p className="font-bold text-sky-700 dark:text-sky-300">{isFr ? "Mode Calculateur" : "Calculator Mode"}</p>
                  <p className="text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {isFr 
                      ? "Il n'y a aucune différence syntaxique que vous utilisiez la machine comme automate de reconnaissance ou comme calculateur de fonctions." 
                      : "There is no syntactic difference whether you use the machine as a language recognizing automaton or as a function calculator."}
                  </p>
                  <p className="text-slate-700 dark:text-zinc-300 border-t border-slate-200 dark:border-zinc-700/50 pt-2 mt-2">
                    {isFr 
                      ? "Astuce : Lors de l'utilisation en mode calculateur, ignorez les statuts d'exécution de l'interface (Accepté / Rejeté / Arrêté). Concentrez-vous plutôt sur la vérification visuelle des symboles résultants sur le ruban final." 
                      : "Tip: When using it as a calculator, ignore the UI's execution remarks (Accepted / Rejected / Halted). Instead, manually verify your results by checking the symbols left on the final tape."}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Modal Footer ────────────────────────────────────────────── */}
        <div className={`flex items-center justify-end px-6 py-3 border-t ${theme.borderSubtle} ${theme.bgPanelInner}`}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            {isFr ? "Fermer" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
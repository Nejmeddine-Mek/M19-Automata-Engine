import { useState, useEffect } from "react";
import type { ThemeType } from "../App";

interface OnboardingModalProps {
  theme: ThemeType;
  language?: "en" | "fr";
  isOpen?: boolean;
  onClose: () => void;
  onLoadExample?: () => void;
}

const ONBOARDING_KEY = "m19_onboarding_completed";

export function shouldShowOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) !== "true";
  } catch {
    return true;
  }
}

export function markOnboardingCompleted(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "true");
  } catch (e) {
    console.error("Failed to save onboarding status", e);
  }
}

export default function OnboardingModal({
  theme,
  language = "en",
  isOpen = true,
  onClose,
  onLoadExample,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isFr = language === "fr";

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinish = (loadExample = false) => {
    markOnboardingCompleted();
    onClose();
    if (loadExample && onLoadExample) {
      onLoadExample();
    }
  };

  const steps = [
    {
      titleEn: "Welcome to M19 Automata Simulator!",
      titleFr: "Bienvenue sur M19 Automata Simulator !",
      subtitleEn: "An interactive theoretical engine for Finite State Automata, Linear Bounded Automata, and Turing Machines.",
      subtitleFr: "Un moteur théorique interactif pour Automates Finis, Automates Bornés Linéairement et Machines de Turing.",
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      ),
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
          <p>
            {isFr
              ? "Cet outil est conçu pour vous aider à prototyper, simuler pas à pas et comprendre le fonctionnement des machines théoriques et la théorie des langages formels."
              : "This tool is crafted to help you prototype, step-by-step simulate, and deeply understand the mechanics of theoretical machines and formal language theory."}
          </p>
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className={`p-3 rounded-xl border border-slate-300 dark:border-zinc-800 ${theme.bgPanelInner} flex flex-col items-center text-center shadow-xs`}>
              <span className="font-bold text-sky-700 dark:text-sky-400 font-mono text-sm">FSA</span>
              <span className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                {isFr ? "Automates Finis Déterministes & Non-déterministes (DFA / NFA)" : "Finite State Automata (DFA & NFA)"}
              </span>
            </div>
            <div className={`p-3 rounded-xl border border-slate-300 dark:border-zinc-800 ${theme.bgPanelInner} flex flex-col items-center text-center shadow-xs`}>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 font-mono text-sm">LBA</span>
              <span className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                {isFr ? "Automates Bornés Linéairement (Marqueurs C et $)" : "Linear Bounded Automata (C & $ Markers)"}
              </span>
            </div>
            <div className={`p-3 rounded-xl border border-slate-300 dark:border-zinc-800 ${theme.bgPanelInner} flex flex-col items-center text-center shadow-xs`}>
              <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono text-sm">TM</span>
              <span className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                {isFr ? "Machines de Turing (Ruban infini & Calculateur)" : "Turing Machines (Infinite Tape & Calculator)"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      titleEn: "Step 1: Configure & Code Your Machine",
      titleFr: "Étape 1 : Configurez & Codez Votre Automate",
      subtitleEn: "Use the panels on the right sidebar to define alphabets and transition logic.",
      subtitleFr: "Utilisez les panneaux de droite pour définir les alphabets et les transitions.",
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      ),
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
          <div className="space-y-2">
            <div className={`p-3 rounded-xl border border-slate-300 dark:border-zinc-800 ${theme.bgPanelInner} shadow-xs`}>
              <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {isFr ? "Panneau Configuration" : "Config Window"}
              </span>
              <p className="text-slate-600 dark:text-zinc-400">
                {isFr
                  ? "Sélectionnez le type d'automate et spécifiez l'alphabet d'entrée (Σ), les symboles d'arrêt, ou les symboles de déplacement."
                  : "Choose the machine model and declare your alphabet symbols (Σ), tape markers, or read head movement triggers."}
              </p>
            </div>
            <div className={`p-3 rounded-xl border border-slate-300 dark:border-zinc-800 ${theme.bgPanelInner} shadow-xs`}>
              <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isFr ? "Éditeur IDE (Syntaxe DSL)" : "IDE Code Editor (DSL Syntax)"}
              </span>
              <p className="text-slate-600 dark:text-zinc-400">
                {isFr
                  ? "Définissez 'initial: q0', 'final: q1', puis vos lignes de transition (ex: 'q0, a, q1' ou 'q0, 0, R, q1'). Vous pouvez aussi sauvegarder vos fichiers en JSON."
                  : "Declare 'initial: q0', 'final: q1', then transition lines (e.g. 'q0, a, q1' or 'q0, 0, R, q1'). Download or load JSON anytime."}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      titleEn: "Step 2: Interactive Execution & Multi-Tape",
      titleFr: "Étape 2 : Exécution & Rubans Multi-Threads",
      subtitleEn: "Test inputs, control speed, and watch state diagrams update live.",
      subtitleFr: "Testez vos chaînes, contrôlez la vitesse et observez le graphe en temps réel.",
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>{isFr ? "Champ d'entrée :" : "Input Tape :"}</strong>{" "}
              {isFr
                ? "Saisissez votre mot w (ex: '1011' ou 'abba') puis appuyez sur Entrée ou cliquez sur 'Charger & Init'."
                : "Type your input string w (e.g. '1011' or 'abba') and click 'Load & Init'."}
            </li>
            <li>
              <strong>{isFr ? "Diagramme Dynamique :" : "State Diagram :"}</strong>{" "}
              {isFr
                ? "L'état actif s'anime et émet des pulsations lumineuses. Vous pouvez glisser les nœuds pour réorganiser le graphe."
                : "The active state pulses in real time. Drag and drop nodes to re-organize the layout."}
            </li>
            <li>
              <strong>{isFr ? "Non-déterminisme (NFA) :" : "Nondeterminism (NFA) :"}</strong>{" "}
              {isFr
                ? "Si une transition se divise, l'application génère automatiquement plusieurs rubans parallèles pour explorer chaque branche."
                : "If transitions branch, the simulator automatically spawns parallel tape threads to trace every execution path."}
            </li>
            <li>
              <strong>{isFr ? "Historique Réversible :" : "Step Back & Forward :"}</strong>{" "}
              {isFr
                ? "Reculez ou avancez pas à pas dans l'historique d'exécution à tout moment."
                : "Step backward and forward through simulation history at any time."}
            </li>
          </ul>
        </div>
      ),
    },
    {
      titleEn: "Step 3: Algorithms & AI Chatbot Assistant",
      titleFr: "Étape 3 : Algorithmes & Assistant Chatbot IA",
      subtitleEn: "Theoretical algorithms and instant interactive assistance at your fingertips.",
      subtitleFr: "Algorithmes théoriques et assistance instantanée au creux de votre main.",
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
      ),
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
          <div className="space-y-2">
            <div className={`p-3 rounded-xl border border-slate-300 dark:border-zinc-800 ${theme.bgPanelInner} shadow-xs`}>
              <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1">
                {isFr ? "Bibliothèque d'Algorithmes (En-tête)" : "Algorithms Library (Header)"}
              </span>
              <p className="text-slate-600 dark:text-zinc-400">
                {isFr
                  ? "Consultez les algorithmes officiels (Déterminisation NFA → DFA, Élimination d'États, DFA vers Grammaire) avec pseudo-code complet."
                  : "Inspect formal transformations (NFA to DFA, State Elimination, DFA to Grammar, Trimming) with complete pseudo-code."}
              </p>
            </div>
            <div className={`p-3 rounded-xl border border-slate-300 dark:border-zinc-800 ${theme.bgPanelInner} shadow-xs`}>
              <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1">
                {isFr ? "Chatbot Intelligent (Bouton rond en bas à gauche)" : "AI Assistant (Floating circle bottom-left)"}
              </span>
              <p className="text-slate-600 dark:text-zinc-400">
                {isFr
                  ? "Connectez votre clé API Gemini gratuite depuis les Paramètres pour poser des questions sur votre code DSL, les cours et déboguer vos automates."
                  : "Provide your free Gemini API key in Settings to ask questions, inspect why strings fail, and learn formal theory."}
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div
        className={`w-full max-w-xl ${theme.bgSidebar} border border-slate-300 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b border-slate-300 dark:border-zinc-800 flex items-start gap-4 ${theme.bgPanelInner}`}>
          {current.icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                {isFr ? `Guide Rapide • Étape ${currentStep + 1} / ${steps.length}` : `Quick Tour • Step ${currentStep + 1} of ${steps.length}`}
              </span>
              <button
                type="button"
                onClick={() => handleFinish(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer text-sm font-mono p-1 rounded-lg"
                title={isFr ? "Passer le guide" : "Skip tour"}
              >
                ✕
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-zinc-100 mt-1 leading-snug">
              {isFr ? current.titleFr : current.titleEn}
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              {isFr ? current.subtitleFr : current.subtitleEn}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">{current.content}</div>

        {/* Modal Footer Controls */}
        <div className={`px-6 py-4 border-t border-slate-300 dark:border-zinc-800 flex items-center justify-between ${theme.bgPanelInner}`}>
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? "bg-sky-600 w-6"
                    : "bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                {isFr ? "← Précédent" : "← Back"}
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-1.5 text-xs font-mono font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                <span>{isFr ? "Suivant →" : "Next →"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFinish(true)}
                  className="px-3.5 py-1.5 text-xs font-mono font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  <span>{isFr ? "Tester un Exemple" : "Load Sample"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="px-4 py-1.5 text-xs font-mono font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {isFr ? "Commencer !" : "Get Started !"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


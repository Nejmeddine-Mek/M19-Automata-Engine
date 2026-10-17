import { useState } from "react";
import type { ThemeType } from "../App";
import AlgorithmsModal from "./AlgorithmsModal";
import DocsModal from "./DocsModal";
import { PRELOADED_PROGRAMS, type PreloadedProgram } from "../utils/programLoader";

interface HeaderProps {
  theme: ThemeType;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  language?: "en" | "fr";
  onSelectProgram?: (program: PreloadedProgram) => void;
  currentProgramId?: string;
}

export default function Header({
  theme,
  onOpenSettings,
  onOpenHelp,
  language = "en",
  onSelectProgram,
  currentProgramId = "",
}: HeaderProps) {
  const isFr = language === "fr";
  const [isAlgorithmsModalOpen, setIsAlgorithmsModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  return (
    <header className={`w-full h-[80px] ${theme.bgSidebar} ${theme.border} border-b px-6 flex items-center justify-between shadow-sm shrink-0`}>
      {/* ── Left Side: Logo & Title ──────────────────────────────────── */}
      <div className="flex items-center space-x-3">
        {/* Logo Icon */}
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-white shadow-inner">
          M
        </div>
        <div>
          <h1 className={`text-xl font-bold tracking-wide ${theme.textInput}`}>
            M19 Automata Simulator
          </h1>
          <span className={`text-[11px] font-mono ${theme.textMuted} hidden sm:block`}>
            {isFr ? "Simulateur Théorique & Moteur d'Exécution" : "Theoretical Simulator & Execution Engine"}
          </span>
        </div>
      </div>

      {/* ── Center: Pre-Loaded Machine Library Dropdown ─────────────── */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="preloaded-programs-select"
          className={`text-xs font-mono font-semibold uppercase tracking-wider ${theme.textTitle} hidden md:flex items-center gap-1.5`}
        >
          <svg className="w-3.5 h-3.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>{isFr ? "Exemples :" : "Examples:"}</span>
        </label>

        <div className="relative">
          <select
            id="preloaded-programs-select"
            value={currentProgramId}
            onChange={(e) => {
              const selected = PRELOADED_PROGRAMS.find((p) => p.id === e.target.value);
              if (selected && onSelectProgram) {
                onSelectProgram(selected);
              }
            }}
            className={`appearance-none text-xs font-mono font-medium px-3 py-1.5 pr-8 rounded-xl border ${theme.border} ${theme.bgPanelInner} ${theme.textInput} hover:border-sky-500/60 focus:outline-none ${theme.focusRing} cursor-pointer transition-all shadow-xs`}
          >
            <option value="" disabled className={`${theme.bgSidebar} ${theme.textMuted}`}>
              {isFr ? "— Choisir un automate pré-chargé —" : "— Select pre-loaded machine —"}
            </option>
            {PRELOADED_PROGRAMS.map((prog) => (
              <option key={prog.id} value={prog.id} className={`${theme.bgSidebar} ${theme.textInput}`}>
                {prog.name}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 dark:text-zinc-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Right Side: Docs & Settings Buttons ──────────────────────── */}
      <div className="flex items-center space-x-3">
        {/* ── Algorithms Library Button ────────────────────────────────────── */}
        <button
          onClick={() => setIsAlgorithmsModalOpen(true)}
          className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border ${theme.border} ${theme.bgPanelInner} ${theme.textInput} hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm`}
          title={isFr ? "Bibliothèque d'Algorithmes" : "Algorithms Library"}
        >
          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>{isFr ? "Algorithmes" : "Algorithms"}</span>
        </button>
        {/* Documentation Button */}
        <button
          type="button"
          onClick={() => setIsDocsModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold ${theme.fontMono} uppercase tracking-wider 
            ${theme.bgPanelInner} ${theme.textTitle} hover:${theme.textInput} 
            border ${theme.borderSubtle} rounded-lg transition-all shadow-sm 
            hover:border-sky-500/50 ${theme.focusRing}`}
        >
          {/* Book / Docs Icon */}
          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {isFr ? "Documentation" : "Docs"}
        </button>

        {/* Quick Tour / Help Button */}
        <button
          type="button"
          onClick={onOpenHelp}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${theme.fontMono} uppercase tracking-wider 
            ${theme.bgPanelInner} ${theme.textTitle} hover:${theme.textInput} 
            border ${theme.borderSubtle} rounded-lg transition-all shadow-sm 
            hover:border-amber-500/50 ${theme.focusRing}`}
          title={isFr ? "Revoir le guide d'utilisation" : "Re-open user onboarding guide"}
        >
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{isFr ? "Guide" : "Tour"}</span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold ${theme.fontMono} uppercase tracking-wider 
            ${theme.bgPanelInner} ${theme.textTitle} hover:${theme.textInput} 
            border ${theme.borderSubtle} rounded-lg transition-all shadow-sm 
            hover:border-sky-500/50 ${theme.focusRing}`}
        >
          {/* Gear / Settings Icon */}
          <svg className="w-4 h-4 text-gray-400 hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isFr ? "Paramètres" : "Settings"}
        </button>
      </div>
      <DocsModal theme={theme} language={language} onClose={() => setIsDocsModalOpen(false)} isOpen={isDocsModalOpen} />
      <AlgorithmsModal theme={theme} onClose={() => setIsAlgorithmsModalOpen(false) } language={language} isOpen={isAlgorithmsModalOpen}/>
    </header>
  );
}
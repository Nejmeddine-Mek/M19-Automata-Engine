import type { ThemeType } from "../App";

interface HeaderProps {
  theme: ThemeType;
}

export default function Header({ theme }: HeaderProps) {
  return (
    <header className={`w-full h-[80px] ${theme.bgSidebar} ${theme.border} border-b px-6 flex items-center justify-between shadow-sm shrink-0`}>
      {/* ── Left Side: Logo & Title ──────────────────────────────────── */}
      <div className="flex items-center space-x-3">
        {/* Logo Icon */}
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-white shadow-inner">
          M
        </div>
        <h1 className={`text-xl font-bold tracking-wide ${theme.textInput}`}>
          M19 Automata Simulator
        </h1>
      </div>

      {/* ── Right Side: Docs & Settings Buttons ──────────────────────── */}
      <div className="flex items-center space-x-3">
        {/* Documentation Button */}
        <button
          type="button"
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold ${theme.fontMono} uppercase tracking-wider 
            ${theme.bgPanelInner} ${theme.textTitle} hover:${theme.textInput} 
            border ${theme.borderSubtle} rounded-lg transition-all shadow-sm 
            hover:border-sky-500/50 ${theme.focusRing}`}
        >
          {/* Book / Docs Icon */}
          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Docs
        </button>

        {/* Settings Button */}
        <button
          type="button"
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold ${theme.fontMono} uppercase tracking-wider 
            ${theme.bgPanelInner} ${theme.textTitle} hover:${theme.textInput} 
            border ${theme.borderSubtle} rounded-lg transition-all shadow-sm 
            hover:border-sky-500/50 ${theme.focusRing}`}
        >
          {/* Gear / Settings Icon */}
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>
    </header>
  );
}
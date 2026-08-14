import { useState } from "react";
import Config from "./components/Config";
import Header from "./components/Header";
import { ParsingManager } from "./models/managers/ParsingManager";
import ExecSpace from "./components/ExecSpace";
/*
export const THEME = {
  bgApp: "bg-gray-100",
  bgSidebar: "bg-gray-200/50",
  bgPanelInner: "bg-white",
  bgInput: "bg-gray-50",
  border: "border-gray-300",
  borderSubtle: "border-gray-200",
  textTitle: "text-gray-600",
  textInput: "text-gray-900",
  textMuted: "text-gray-500",
  focusRing: "focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500",
  fontSans: "font-sans",
  fontMono: "font-mono",
};*/

export const THEME = {
  bgApp: "bg-zinc-950",
  bgSidebar: "bg-zinc-900/90",
  bgPanelInner: "bg-zinc-900/40",
  bgInput: "bg-zinc-950/80",
  border: "border-zinc-800",
  borderSubtle: "border-zinc-800/50",
  textTitle: "text-zinc-400",
  textInput: "text-zinc-100",
  textMuted: "text-zinc-500",
  focusRing: "focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500",
  fontSans: "font-sans",
  fontMono: "font-mono",
};

export type ThemeType = typeof THEME;

export default function App() {
  const [showConfigWindow, SetShowConfigWindow] = useState(true)
  const [showIde, setShowIde] = useState(false)
  const manager = new ParsingManager('FSA')
  manager.test()
  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${THEME.bgApp} text-slate-100 ${THEME.fontSans}`}>
      <Header theme={THEME}/>

      <main className="flex flex-1 w-full overflow-hidden">
        {/* Workspace */}
        <section className={`w-[75%] h-full ${THEME.bgApp} ${THEME.border} border-r p-6 flex flex-col justify-start items-stretch gap-4 overflow-y-auto`}>
          {/* 1. Toolbar pinned at the top */}
          <div className="w-full shrink-0">
            <ExecSpace theme={THEME}/>
          </div>

          {/* 2. Visualizer Workspace (Expands to fill all remaining vertical space) */}
          <div className={`flex-1 w-full ${THEME.bgPanelInner} border ${THEME.border} rounded-lg p-6 flex items-center justify-center shadow-sm`}>
            <span className={`text-sm ${THEME.fontMono} ${THEME.textMuted}`}>
              No execution state loaded. Enter input above and click Execute.
            </span>
          </div>
        </section>

        {/* Sidebar */}
        <section className={`w-[25%] h-full ${THEME.bgSidebar} flex flex-col`}>
          {/* IDE Window */}
          <div className={`${showIde ? "flex-1" : "flex-none"} ${THEME.border} border-b p-4 flex flex-col transition-all duration-200 min-h-0`}>
            {/* Header / Toggle Button */}
            <button
              onClick={() => setShowIde(!showIde)}
              className="flex items-center justify-between w-full mb-2 group cursor-pointer border-none bg-transparent p-0 text-left outline-none"
            >
              <h2 className={`text-xs font-semibold uppercase tracking-wider ${THEME.textTitle} group-hover:text-gray-900 transition-colors`}>
                IDE Window
              </h2>
              
              {/* Chevron Arrow */}
              <svg
                className={`w-4 h-4 ${THEME.textMuted} transform transition-transform duration-200 ${
                  showIde ? "rotate-0" : "-rotate-90"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collapsable Content */}
            {showIde && (
              <div className={`flex-1 ${THEME.bgPanelInner} rounded-lg p-3 text-sm ${THEME.fontMono} ${THEME.textMuted} ${THEME.borderSubtle} border overflow-y-auto`}>
                // Code editor goes here...
              </div>
            )}
          </div>

          {/* Config Window */}
          <div className={`${showConfigWindow ? "flex-1" : "flex-none"} p-4 flex flex-col transition-all duration-200 min-h-0`}>
            {/* Header / Toggle Button */}
            <button
              onClick={() => SetShowConfigWindow(!showConfigWindow)}
              className="flex items-center justify-between w-full mb-2 group cursor-pointer border-none bg-transparent p-0 text-left outline-none"
            >
              <h2 className={`text-xs font-semibold uppercase tracking-wider ${THEME.textTitle} group-hover:text-gray-900 transition-colors`}>
                Config Window
              </h2>
              
              {/* Chevron Arrow */}
              <svg
                className={`w-4 h-4 ${THEME.textMuted} transform transition-transform duration-200 ${
                  showConfigWindow ? "rotate-0" : "-rotate-90"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collapsable Content */}
            {showConfigWindow && (
              <div className={`flex-1 ${THEME.bgPanelInner} rounded-lg p-3 text-sm ${THEME.textMuted} ${THEME.borderSubtle} border overflow-y-auto`}>
                <Config theme={THEME} />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
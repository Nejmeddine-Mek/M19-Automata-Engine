import { useState } from "react";
import Config from "./components/Config";
import Header from "./components/Header";
import ExecSpace from "./components/ExecSpace";
import IDE from "./components/IDE";
import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "./models/interfaces/configs";
import { useAutomataEngine } from "./hooks/useAutomataEngine";

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
  const [code, setCode] = useState<string>('');
  const [showConfigWindow, SetShowConfigWindow] = useState(true);
  const [showIde, setShowIde] = useState(true);
  const [machineConfig, setMachineConfig] = useState<FSAConfig | PDAConfig | LBAConfig | TMConfig | null>(null);

  // Hook owns all engine instances and immutable state snapshots
  const engine = useAutomataEngine();

  const handleExecute = (inputTape: string, animationDelay: number) => {
    if (!machineConfig || code.length === 0) {
      console.error("No machine config or code to parse");
      return;
    }
    engine.execute(machineConfig, code, inputTape, animationDelay);
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${THEME.bgApp} text-slate-100 ${THEME.fontSans}`}>
      <Header theme={THEME}/>

      <main className="flex flex-1 w-full overflow-hidden">
        {/* Workspace */}
        <section className={`w-[75%] h-full ${THEME.bgApp} ${THEME.border} border-r p-6 flex flex-col justify-start items-stretch gap-4 overflow-y-auto`}>
          {/* 1. Toolbar pinned at the top */}
          <div className="w-full shrink-0">
            <ExecSpace
              theme={THEME}
              activeTapes={engine.activeTapes}
              executionStatus={engine.executionStatus}
              machineDefinition={engine.machineDefinition}
              canStepBack={engine.canStepBack}
              canStepForward={engine.canStepForward}
              onExecute={handleExecute}
              onStep={engine.step}
              onRun={engine.run}
              onPause={engine.pause}
              onHalt={engine.halt}
              onStepBack={engine.stepBack}
              onStepForward={engine.stepForward}
            />
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
              <div className={`flex-1 ${THEME.bgPanelInner} rounded-lg p-3 text-sm ${THEME.fontMono} ${THEME.textMuted} ${THEME.borderSubtle} border overflow-hidden flex flex-col h-64`}>
                <IDE 
                  code={code} 
                  onChange={setCode} 
                  THEME={THEME} 
                />
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
                <Config theme={THEME} onChangeConfig={setMachineConfig} />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
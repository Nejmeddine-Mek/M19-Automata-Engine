import { useState } from "react";
import Config from "./components/Config";
import Header from "./components/Header";
import ExecSpace from "./components/ExecSpace";
import IDE from "./components/IDE";
import SettingsModal, { type AppSettings } from "./components/SettingsModal";
import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "./models/interfaces/configs";
import { useAutomataEngine } from "./hooks/useAutomataEngine";

export const DARK_THEME = {
  bgApp: "bg-zinc-950",
  bgSidebar: "bg-zinc-900/90",
  bgPanelInner: "bg-zinc-900/40",
  bgInput: "bg-zinc-950/80",
  bgPanel: "bg-zinc-900",
  border: "border-zinc-800",
  borderSubtle: "border-zinc-800/50",
  textTitle: "text-zinc-400",
  textInput: "text-zinc-100",
  textMuted: "text-zinc-500",
  focusRing: "focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500",
  fontSans: "font-sans",
  fontMono: "font-mono",
};

export const LIGHT_THEME = {
  bgApp: "bg-slate-100",
  bgSidebar: "bg-white",
  bgPanelInner: "bg-slate-50",
  bgInput: "bg-white",
  bgPanel: "bg-white",
  border: "border-slate-300",
  borderSubtle: "border-slate-200",
  textTitle: "text-slate-600",
  textInput: "text-slate-900",
  textMuted: "text-slate-500",
  focusRing: "focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500",
  fontSans: "font-sans",
  fontMono: "font-mono",
};

export const THEME = DARK_THEME;
export type ThemeType = typeof DARK_THEME;

const SETTINGS_KEY = "m19_automata_settings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  themeMode: "dark",
  fontFamily: "mono",
  fontSize: "medium",
  fontWeight: "normal",
};

export default function App() {
  const [code, setCode] = useState<string>("");
  const [showConfigWindow, SetShowConfigWindow] = useState(true);
  const [showIde, setShowIde] = useState(true);
  const [machineConfig, setMachineConfig] = useState<FSAConfig | PDAConfig | LBAConfig | TMConfig | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
    return DEFAULT_SETTINGS;
  });

  const activeTheme = settings.themeMode === "light" ? LIGHT_THEME : DARK_THEME;

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings to localStorage", e);
    }
  };

  const getFontStyle = () => {
    let fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    if (settings.fontFamily === "sans") {
      fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    } else if (settings.fontFamily === "serif") {
      fontFamily = "Georgia, Cambria, 'Times New Roman', Times, serif";
    }

    let fontSize = "14px";
    if (settings.fontSize === "small") fontSize = "12px";
    if (settings.fontSize === "large") fontSize = "16px";

    let fontWeight = "400";
    if (settings.fontWeight === "medium") fontWeight = "500";
    if (settings.fontWeight === "bold") fontWeight = "700";

    return {
      fontFamily,
      fontSize,
      fontWeight,
    };
  };

  const engine = useAutomataEngine();

  const handleExecute = (inputTape: string, animationDelay: number) => {
    if (!machineConfig || code.length === 0) {
      console.error("No machine config or code to parse");
      return;
    }
    engine.execute(machineConfig, code, inputTape, animationDelay);
  };

  const activeInstructions = engine.activeTapes
    .map((t) => t.lastInstruction)
    .filter(Boolean) as string[];

  const handleSaveAutomaton = () => {
    const data = {
      version: "1.0",
      machineConfig,
      code,
    };
    const jsonStr = JSON.stringify(data, null, 2);

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `m19_${machineConfig?.machineType?.toLowerCase() || "automaton"}.json`;
    a.click();
    URL.revokeObjectURL(url);

    try {
      localStorage.setItem("m19_saved_automaton", jsonStr);
    } catch (e) {
      console.error("Failed to save automaton to localStorage", e);
    }
  };

  const handleLoadAutomaton = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.machineConfig) setMachineConfig(parsed.machineConfig);
      else if (parsed.config) setMachineConfig(parsed.config);

      if (typeof parsed.code === "string") setCode(parsed.code);
    } catch (e) {
      console.error("Invalid JSON content", e);
      alert(settings.language === "fr" ? "Fichier JSON invalide." : "Invalid JSON file structure.");
    }
  };

  return (
    <div
      style={getFontStyle()}
      className={`flex flex-col h-screen w-screen overflow-hidden ${activeTheme.bgApp} ${activeTheme.textInput} transition-colors duration-200`}
    >
      <Header
        theme={activeTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        language={settings.language}
      />

      <main className="flex flex-1 w-full overflow-hidden">
        {/* Workspace */}
        <section className={`w-[75%] h-full ${activeTheme.bgApp} ${activeTheme.border} border-r p-6 flex flex-col justify-start items-stretch gap-4 overflow-y-auto`}>
          {/* 1. Toolbar pinned at the top */}
          <div className="w-full shrink-0">
            <ExecSpace
              theme={activeTheme}
              language={settings.language}
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
        <section className={`w-[25%] h-full ${activeTheme.bgSidebar} flex flex-col`}>
          {/* IDE Window */}
          <div className={`${showIde ? "flex-1" : "flex-none"} ${activeTheme.border} border-b p-4 flex flex-col transition-all duration-200 min-h-0`}>
            {/* Header / Toggle Button */}
            <button
              onClick={() => setShowIde(!showIde)}
              className="flex items-center justify-between w-full mb-2 group cursor-pointer border-none bg-transparent p-0 text-left outline-none"
            >
              <h2 className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.textTitle} group-hover:text-sky-400 transition-colors`}>
                {settings.language === "fr" ? "Éditeur IDE" : "IDE Window"}
              </h2>
              
              {/* Chevron Arrow */}
              <svg
                className={`w-4 h-4 ${activeTheme.textMuted} transform transition-transform duration-200 ${
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
              <div className={`flex-1 ${activeTheme.bgPanelInner} rounded-lg p-3 text-sm ${activeTheme.fontMono} ${activeTheme.textMuted} ${activeTheme.borderSubtle} border overflow-hidden flex flex-col h-64`}>
                <IDE 
                  code={code} 
                  onChange={setCode}
                  activeInstructions={activeInstructions}
                  language={settings.language}
                  onSave={handleSaveAutomaton}
                  onLoad={handleLoadAutomaton}
                  THEME={activeTheme} 
                />
              </div>
            )}
          </div>

          {/* Config Window */}
          <div className={`${showConfigWindow ? "flex-1" : "flex-none" } border-b p-4 flex flex-col transition-all duration-200 min-h-0`}>
            {/* Header / Toggle Button */}
            <button
              onClick={() => SetShowConfigWindow(!showConfigWindow)}
              className="flex items-center justify-between w-full mb-2 group cursor-pointer border-none bg-transparent p-0 text-left outline-none"
            >
              <h2 className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.textTitle} group-hover:text-sky-400 transition-colors`}>
                {settings.language === "fr" ? "Panneau Configuration" : "Config Window"}
              </h2>
              
              {/* Chevron Arrow */}
              <svg
                className={`w-4 h-4 ${activeTheme.textMuted} transform transition-transform duration-200 ${
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
              <div className={`flex-1 ${activeTheme.bgPanelInner} rounded-lg p-3 text-sm ${activeTheme.textMuted} ${activeTheme.borderSubtle} border overflow-y-auto`}>
                <Config theme={activeTheme} language={settings.language} onChangeConfig={setMachineConfig} />
              </div>
            )}
          </div>
          
        </section>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        theme={activeTheme}
      />
    </div>
  );
}
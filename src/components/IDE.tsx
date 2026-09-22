import React, { useRef } from "react";

interface IDEProps {
  code: string;
  onChange: (value: string) => void;
  activeInstructions?: string[];
  language?: "en" | "fr";
  onSave?: () => void;
  onLoad?: (jsonStr: string) => void;
  THEME?: Record<string, string>;
}

export default function IDE({
  code,
  onChange,
  activeInstructions = [],
  language = "en",
  onSave,
  onLoad,
}: IDEProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFr = language === "fr";

  const lines = code.split("\n");

  // Normalize tokens to check if a line matches any active instruction
  const isLineActive = (lineContent: string): boolean => {
    const trimmedLine = lineContent.trim();
    if (!trimmedLine || trimmedLine.startsWith("//") || trimmedLine.startsWith("#")) {
      return false;
    }

    const lineTokens = trimmedLine.split(",").map((t) => t.trim());

    return activeInstructions.some((instr) => {
      const instrTokens = instr.trim().split(",").map((t) => t.trim());
      if (lineTokens.length !== instrTokens.length) return false;
      return lineTokens.every((tok, idx) => tok === instrTokens[idx]);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content && onLoad) {
        onLoad(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleLoadLocalStorage = () => {
    const saved = localStorage.getItem("m19_saved_automaton");
    if (saved && onLoad) {
      onLoad(saved);
    } else {
      alert(isFr ? "Aucun automate sauvegardé dans le stockage local." : "No saved automaton found in local storage.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          
        </div>

        {/* Save / Load Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSave}
            title={isFr ? "Sauvegarder l'Automate (JSON + LocalStorage)" : "Save Automaton (JSON + LocalStorage)"}
            className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-600/80 hover:bg-emerald-500 text-white rounded cursor-pointer transition-all flex items-center gap-1"
          >
            💾 {isFr ? "Sauvegarder" : "Save"}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={isFr ? "Charger un fichier JSON d'automate" : "Load Automaton JSON File"}
            className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-sky-600/80 hover:bg-sky-500 text-white rounded cursor-pointer transition-all flex items-center gap-1"
          >
            📂 {isFr ? "Fichier" : "File"}
          </button>
{/*
          <button
            type="button"
            onClick={handleLoadLocalStorage}
            title={isFr ? "Charger depuis LocalStorage" : "Load from LocalStorage"}
            className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-600/80 hover:bg-indigo-500 text-white rounded cursor-pointer transition-all flex items-center gap-1"
          >
            ⚡ {isFr ? "Local" : "Local"}
          </button> */}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Editor Body with Gutter */}
      <div className="flex-1 flex w-full h-full overflow-hidden rounded bg-zinc-950/60 border border-zinc-800">
        {/* Line Gutter with Active Pointer Indicators */}
        <div className="flex flex-col shrink-0 select-none py-2 px-1 text-right text-zinc-600 font-mono text-xs border-r border-zinc-800 bg-zinc-900/40 min-w-[36px]">
          {lines.map((line, idx) => {
            const active = isLineActive(line);
            return (
              <div
                key={idx}
                className={`flex items-center justify-end gap-1 h-[22px] leading-[22px] px-1 font-mono text-[11px] ${
                  active ? "text-amber-400 font-bold bg-amber-500/20 rounded-xs" : ""
                }`}
              >
                {active && <span className="text-amber-400 animate-pulse text-[10px]">▶</span>}
                <span>{idx + 1}</span>
              </div>
            );
          })}
        </div>

        {/* Text Area Code Editor */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full flex-1 bg-transparent text-emerald-400 font-mono text-xs p-2 leading-[22px] resize-none focus:outline-none overflow-y-auto"
          placeholder="initial: q0&#10;final: q1&#10;q0, a, q1"
        />
      </div>
    </div>
  );
}
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

  return (
    <div className="flex flex-col h-full w-full">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300 dark:border-zinc-800 text-xs select-none">
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
            className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>{isFr ? "Sauvegarder" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={isFr ? "Charger un fichier JSON d'automate" : "Load Automaton JSON File"}
            className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 rounded cursor-pointer transition-all flex items-center gap-1.5 border border-slate-300 dark:border-zinc-700 shadow-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{isFr ? "Fichier" : "File"}</span>
          </button>

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
      <div className="flex-1 flex w-full h-full overflow-hidden rounded-lg bg-white dark:bg-zinc-950/60 border border-slate-300 dark:border-zinc-800 shadow-xs">
        {/* Line Gutter with Active Pointer Indicators */}
        <div className="flex flex-col shrink-0 select-none py-2 px-1 text-right text-slate-600 dark:text-zinc-500 font-mono text-xs border-r border-slate-300 dark:border-zinc-800 bg-slate-100/70 dark:bg-zinc-900/40 min-w-[36px]">
          {lines.map((line, idx) => {
            const active = isLineActive(line);
            return (
              <div
                key={idx}
                className={`flex items-center justify-end gap-1 h-[22px] leading-[22px] px-1 font-mono text-[11px] ${
                  active ? "text-amber-700 dark:text-amber-300 font-bold bg-amber-500/20 rounded-xs" : ""
                }`}
              >
                {active && (
                  <svg className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 fill-current shrink-0 animate-pulse" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
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
          className="w-full flex-1 bg-white dark:bg-transparent text-slate-950 dark:text-zinc-100 placeholder:text-slate-500 dark:placeholder:text-zinc-500 font-mono font-medium text-xs p-2.5 leading-[22px] resize-none focus:outline-none overflow-y-auto selection:bg-sky-500 selection:text-white caret-sky-600 dark:caret-sky-400"
          placeholder="initial: q0&#10;final: q1&#10;q0, a, q1"
        />
      </div>
    </div>
  );
}
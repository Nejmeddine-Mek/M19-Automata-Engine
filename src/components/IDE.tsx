interface IDEProps {
  code: string;
  onChange: (value: string) => void;
  THEME?: Record<string, string>;
}

export default function IDE({ code, onChange }: IDEProps) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          <span className="ml-2 font-mono text-slate-400">instructions.m19</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono uppercase">FSA DSL</span>
      </div>

      {/* Editor Body */}
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-full flex-1 bg-transparent text-emerald-400 font-mono text-xs leading-relaxed resize-none focus:outline-none"
        placeholder="initial: q0&#10;final: q1&#10;q0, a, q1"
      />
    </div>
  );
}
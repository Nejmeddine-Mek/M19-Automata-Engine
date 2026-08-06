import Config from "./components/Config";
import Header from "./components/Header";

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
};
/*
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
};*/

export type ThemeType = typeof THEME;

export default function App() {
  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${THEME.bgApp} text-slate-100 ${THEME.fontSans}`}>
      <Header theme={THEME}/>

      <main className="flex flex-1 w-full overflow-hidden">
        {/* Workspace */}
        <section className={`w-[75%] h-full ${THEME.bgApp} ${THEME.border} border-r p-6 flex items-center justify-center`}>
          <div className={`w-full h-full border-2 border-dashed ${THEME.border} rounded-2xl flex items-center justify-center ${THEME.textMuted} font-medium`}>
            75% Workspace Area
          </div>
        </section>

        {/* Sidebar */}
        <section className={`w-[25%] h-full ${THEME.bgSidebar} flex flex-col`}>
          {/* IDE Window */}
          <div className={`flex-1 ${THEME.border} border-b p-4 flex flex-col`}>
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${THEME.textTitle} mb-2`}>
              IDE Window
            </h2>
            <div className={`flex-1 ${THEME.bgPanelInner} rounded-lg p-3 text-sm ${THEME.fontMono} ${THEME.textMuted} ${THEME.borderSubtle} border`}>
              // Code editor goes here...
            </div>
          </div>

          {/* Config Window */}
          <div className="flex-1 p-4 flex flex-col">
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${THEME.textTitle} mb-2`}>
              Config Window
            </h2>
            <div className={`flex-1 ${THEME.bgPanelInner} rounded-lg p-3 text-sm ${THEME.textMuted} ${THEME.borderSubtle} border overflow-y-auto`}>
              <Config theme={THEME} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
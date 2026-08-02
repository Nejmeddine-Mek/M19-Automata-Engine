import Header from "./components/Header"

function App() {


  return (
    <>
<div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Header />

      {/* Main Content Area filling remaining space */}
      <main className="flex flex-1 w-full overflow-hidden">
        
        {/* 75% Left: Workspace */}
        <section className="w-[75%] h-full bg-slate-950 border-r border-slate-800 p-6 flex items-center justify-center">
          <div className="w-full h-full border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-600 font-medium">
            75% Workspace Area
          </div>
        </section>

        {/* 25% Right: Split into IDE & Config */}
        <section className="w-[25%] h-full bg-slate-900 flex flex-col">
          {/* Top Half: IDE Window */}
          <div className="flex-1 border-b border-slate-800 p-4 flex flex-col">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">IDE Window</h2>
            <div className="flex-1 bg-slate-950/40 rounded-lg p-3 text-sm font-mono text-slate-500 border border-slate-800/60">
              // Code editor goes here...
            </div>
          </div>

          {/* Bottom Half: Config Window */}
          <div className="flex-1 p-4 flex flex-col">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Config Window</h2>
            <div className="flex-1 bg-slate-950/40 rounded-lg p-3 text-sm text-slate-500 border border-slate-800/60">
              // Configurations go here...
            </div>
          </div>
        </section>

      </main>
    </div>
      
    </>
  )
}

export default App

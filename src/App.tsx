import { useState, useRef, useCallback, useEffect } from "react"
import Config from "./components/Config"
import Header from "./components/Header"


import ExecSpace from "./components/ExecSpace"
import IDE from "./components/IDE"
import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "./models/interfaces/configs"
import { ParsingManager } from "./models/managers/ParsingManager"
import { ExecutionManager } from "./models/managers/ExecutionManager"
import { UIManager } from "./models/managers/UIManager"
import type { TapeHandle, } from "./models/interfaces/TapeHandle"
import type { ActiveTape, TapeStepChange } from "./models/interfaces/activeTapeConfigs"

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
};
*/
export type ThemeType = typeof THEME;

export default function App() {
  const [code, setCode] = useState<string>('');
  const [showConfigWindow, SetShowConfigWindow] = useState(true);
  const [showIde, setShowIde] = useState(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const [machineConfig, setMachineConfig] = useState<FSAConfig | PDAConfig | LBAConfig | TMConfig | null>(null);
  const [executionManager, setExecutionManager] = useState<ExecutionManager | null>(null);
  const [activeTapes, setActiveTapes] = useState<Record<string, TapeHandle>>({});

  const uiManagerRef = useRef<UIManager | null>(null);
  if (uiManagerRef.current === null) {
    uiManagerRef.current = new UIManager(setActiveTapes, 0);
  }

  // Registration callbacks
  const handleRegisterTape = useCallback((id: string, handle: TapeHandle) => {
    console.log("Registering tape:", id);
    uiManagerRef.current!.registerTapeHandle(id, handle);
  }, []);

  const handleUnregisterTape = useCallback((id: string) => {
    uiManagerRef.current!.unregisterTapeHandle(id);
  }, []);

  const handleExecute = (isJumpToResults: boolean, animationDelay: number, inputTape: string) => {
    if(machineConfig === null){
      // TODO: emit an error
      return
    }
    // this is a primary check, \n\n\n\n\n will be handled at the level of the parser
    if(code.length === 0){
      // NO CODE TO PARSE
      return
    }
      console.log("Extracting code from IDE state:", code);
      // TODO: finish the rest of the work
      console.log("data for execution and animation management", isJumpToResults, animationDelay, inputTape)
      console.log("Machine Configs: ", machineConfig)
      setIsExecuting(true)
      // now we have our code, our config, all set we can proceed to the parsing manager
      const parsingManager: ParsingManager = new ParsingManager(machineConfig?.machineType!)
      const definition = parsingManager.parseCode(machineConfig, code)
      // up until here, we have our definitions object well set, next, we need to create the UI manager and the execution manager
      const execMgr = new ExecutionManager(machineConfig.machineType, inputTape, definition);
      setExecutionManager(execMgr)
      uiManagerRef.current!.setAnimationSpeed(animationDelay)
      //--- TODO: execution 
      // ...
      {
        console.log("synchronizing execution here")
        // this will be governed by the type of the machine and not randomly like this, meaning it requires more code
        const activeTapeInstances: ActiveTape[] = []
        const tapesStepChange: TapeStepChange[] = []
        activeTapeInstances.push({
            tapeValue: inputTape.split(''),
            parentIndex: -1,
            currentHeadPosition: 0,
            stack: null,
            id: execMgr.assignId(),
            index: 0
        })
        tapesStepChange.push({
            animationSpeed: 250,
            action: 'NOOP',
            direction: 'HOLD',
            stackAction: undefined,
            stackValue: undefined
        })
        uiManagerRef.current!.renderInitialTape(activeTapeInstances[0])
        execMgr.setInitialTapeStates(activeTapeInstances)
        
      }

    }
  useEffect(() => {
    if (executionManager && Object.keys(activeTapes).length > 0) {
      console.log("Tapes registered, waiting for animationDelay…");

      const timer = setTimeout(() => {
        console.log("Starting execution after delay");
        executionManager.run(true);
        const newState = executionManager.getCurrentExecutionState();
        uiManagerRef.current!.updateTapes(newState);
      }, uiManagerRef.current!.getAnimationSpeed()); // or pass animationDelay directly

      return () => clearTimeout(timer); // cleanup if component unmounts
    }
  }, [executionManager, activeTapes]);
    
  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${THEME.bgApp} text-slate-100 ${THEME.fontSans}`}>
      <Header theme={THEME}/>

      <main className="flex flex-1 w-full overflow-hidden">
        {/* Workspace */}
        <section className={`w-[75%] h-full ${THEME.bgApp} ${THEME.border} border-r p-6 flex flex-col justify-start items-stretch gap-4 overflow-y-auto`}>
          {/* 1. Toolbar pinned at the top */}
          <div className="w-full shrink-0">
            <ExecSpace theme={THEME} onExecute={handleExecute} isExecuting={isExecuting} activeTapes={activeTapes} onRegisterTape={handleRegisterTape} onUnregisterTape={handleUnregisterTape}/>
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
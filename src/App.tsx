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
}; */

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
  /**
   * This section here is dedicated to state variables related to the ui, mainly the code, configuration, display states
   * and button states related to Execute and Halt buttons **pause, next and previous to be added**
   */
  const [code, setCode] = useState<string>('');
  const [showConfigWindow, SetShowConfigWindow] = useState(true);
  const [showIde, setShowIde] = useState(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isHalted, setHalt] = useState<boolean>(false)
  const [machineConfig, setMachineConfig] = useState<FSAConfig | PDAConfig | LBAConfig | TMConfig | null>(null)

  /**
   * Here we start declaring our references for every manager:
   * 1- Parsing manager responsible for parsing code and generating definitions the engine needs
   * 2- Execution manager: runs the engine and returns updated states in form of a SoA {activeStates, nextHeadPosition, currentTapeValue...}
   * 3- UI manager: responsible for updating and setting the visuals, as well as saving copies of tapes at every step 
   */
  const executionManagerRef = useRef<ExecutionManager | null>(null);
  const [activeTapes, setActiveTapes] = useState<ActiveTape[]>([]);
  const uiManagerRef = useRef<UIManager | null>(null);

  useEffect(() => {
    if (!uiManagerRef.current) {
      uiManagerRef.current = new UIManager(setActiveTapes, 250); // default speed
    }
  }, []);

  // registration callbacks
  const handleRegisterTape = useCallback((id: string, handle: TapeHandle) => {
    console.log("Registering tape:", id);
    uiManagerRef.current?.registry.registerTapeHandle(id, handle);
  }, [])

  const handleUnregisterTape = useCallback((id: string) => {
    uiManagerRef.current?.registry.unregisterTapeHandle(id);
  }, [])

  const handleExecute = (isJumpToResults: boolean, animationDelay: number, inputTape: string) => {
    setHalt(false)
    if (!machineConfig || code.length === 0) {
      console.error("No machine config or code to parse");
      return;
    }

    setIsExecuting(true)

    // now we have our code, our config, all set we can proceed to the parsing manager

    const parsingManager = new ParsingManager(machineConfig.machineType);
    const definition = parsingManager.parseCode(machineConfig, code);

    const execMgr = new ExecutionManager(machineConfig.machineType, inputTape, definition);
    executionManagerRef.current = execMgr;

    uiManagerRef.current?.controller.setAnimationDelay(animationDelay);

    // Initial tape setup
    const initialTape: ActiveTape = {
      tapeValue: inputTape.split(""),
      parentIndex: -1,
      currentHeadPosition: 0,
      stack: null,
      id: ExecutionManager.assignId(),
      index: 0,
    };

    uiManagerRef.current?.renderer.renderInitialTape(initialTape)
    execMgr.setInitialTapeStates([initialTape])
  }

  useEffect(() => {
    if (isHalted) {
      console.log("Halting execution…");
      uiManagerRef.current?.controller.pause();
      setIsExecuting(false);
      executionManagerRef.current = null;
      // tapes remain visible, history intact
    }
  }, [isHalted]);

useEffect(() => {
  if (isExecuting && executionManagerRef.current && activeTapes.length > 0) {
    let cancelled = false;
    console.log("executing step")
    const runStep = async () => {
      if (
        !cancelled &&
        executionManagerRef.current?.hasNextStep() &&
        !isHalted &&
        uiManagerRef.current?.controller.isRunning()
      ) {
        await uiManagerRef.current!.controller.delay();

        executionManagerRef.current!.runStep();
        const newState = executionManagerRef.current!.getCurrentExecutionState();

        uiManagerRef.current!.renderer.updateTapes(newState, uiManagerRef.current!.registry);

        // schedule next step
        runStep();
        console.log("finished executing step")
      } else {
        setIsExecuting(false);
      }
    };

    runStep();

    return () => {
      cancelled = true; // cleanup if component unmounts or deps change
    };
  }
}, [isExecuting, isHalted, activeTapes]);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${THEME.bgApp} text-slate-100 ${THEME.fontSans}`}>
      <Header theme={THEME}/>

      <main className="flex flex-1 w-full overflow-hidden">
        {/* Workspace */}
        <section className={`w-[75%] h-full ${THEME.bgApp} ${THEME.border} border-r p-6 flex flex-col justify-start items-stretch gap-4 overflow-y-auto`}>
          {/* 1. Toolbar pinned at the top */}
          <div className="w-full shrink-0">
            <ExecSpace theme={THEME} onExecute={handleExecute} isExecuting={isExecuting} setIsHalted={setHalt} activeTapes={activeTapes} onRegisterTape={handleRegisterTape} onUnregisterTape={handleUnregisterTape}/>
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
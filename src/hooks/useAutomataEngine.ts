import { useState, useRef, useCallback, useEffect } from "react";
import type { ActiveTape } from "../models/interfaces/activeTapeConfigs";
import type { FSAConfig, LBAConfig, PDAConfig, TMConfig } from "../models/interfaces/configs";
import type { ExecutionStatus } from "../models/interfaces/executionStatus";
import type { TMDefinition } from "../models/interfaces/TMDefinition";
import { ParsingManager } from "../models/managers/ParsingManager";
import { ExecutionManager } from "../models/managers/ExecutionManager";
import { HistoryManager } from "../models/managers/uiSubClasses/HistoryManager";
import { InstanceManager } from "../models/managers/executionSubClasses/InstanceManager";
import { applyChanges } from "./applyChanges";
import { computeEOI } from "./computeEOI";
import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { PDADefinition } from "../models/interfaces/PDADefinition";
import type { LBADefinition } from "../models/interfaces/LBADefinition";

export interface EngineAPI {
  // ── Immutable State (read-only by React) ──────────────────
  activeTapes: ActiveTape[];           // Current tape snapshots
  executionStatus: ExecutionStatus;    // { isExecuting, isHalted, isAccepted, isRejected, stepCount }
  canStepBack: boolean;                // History has previous states
  canStepForward: boolean;             // History has future states
  machineDefinition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null;              // Parsed machine definition object

  // ── Actions (called by React event handlers) ──────────────
  execute: (config: FSAConfig | PDAConfig | LBAConfig | TMConfig, code: string, input: string, animationDelay: number) => void;
  step: () => void;                    // Single step forward
  run: () => void;                     // Start continuous execution
  pause: () => void;                   // Pause continuous execution
  halt: () => void;                    // Stop entirely
  reset: () => void;                   // Clear all state
  stepBack: () => void;                // History: go back
  stepForward: () => void;             // History: go forward
}

export function useAutomataEngine(): EngineAPI {
  const [activeTapes, setActiveTapes] = useState<ActiveTape[]>([]);
  const [machineDefinition, setMachineDefinition] = useState<any>(null);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>({
    isExecuting: false,
    isHalted: false,
    isAccepted: false,
    isRejected: false,
    stepCount: 0,
  });

  const [historyState, setHistoryState] = useState({
    canStepBack: false,
    canStepForward: false,
  });

  const executionManagerRef = useRef<ExecutionManager | null>(null);
  const historyRef = useRef<HistoryManager>(new HistoryManager());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationDelayRef = useRef<number>(250);

  // Keep a ref to the latest activeTapes to prevent stale closures in async interval ticks
  const activeTapesRef = useRef<ActiveTape[]>(activeTapes);
  useEffect(() => {
    activeTapesRef.current = activeTapes;
  }, [activeTapes]);

  const updateHistoryState = useCallback(() => {
    setHistoryState({
      canStepBack: historyRef.current.peekPrevious() !== null,
      canStepForward: historyRef.current.peekNext() !== null,
    });
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setExecutionStatus((prev) => ({ ...prev, isExecuting: false }));
  }, []);

  const halt = useCallback(() => {
    pause();
    setExecutionStatus((prev) => ({
      ...prev,
      isExecuting: false,
      isHalted: true,
    }));
  }, [pause]);

  const step = useCallback(() => {
    const execMgr = executionManagerRef.current;
    if (!execMgr || executionStatus.isHalted) return;

    const machineType = execMgr.machineType;
    const changes = execMgr.runStep();

    if (machineType === "FSA") {
      if (changes.length === 0) {
        // Engine returned no new transitions (dead end / stuck)
        pause();
        setExecutionStatus((prev) => ({
          ...prev,
          isHalted: true,
          isExecuting: false,
          isRejected: true,
        }));
        return;
      }

      const nextTapes = applyChanges(activeTapesRef.current, changes);
      const eoi = computeEOI(nextTapes);
      const finalStates = execMgr.tapesAtFinalState();

      let isAccepted = false;
      for (const id of eoi) {
        if (finalStates.has(id)) {
          isAccepted = true;
          break;
        }
      }

      // Rejection: All active tape threads reached End of Input without any thread accepting
      const allReachedEOI = nextTapes.length > 0 && nextTapes.every((t) => eoi.has(t.id));
      const isRejected = !isAccepted && allReachedEOI;

      // Pass updated cell slices back to the engine for next cycle
      const maxLen = (execMgr.getDefinition() as FsaDefinition)?.maxEntryLength ?? 1;
      const cellValues = nextTapes.map((t) =>
        t.tapeValue.slice(t.currentHeadPosition, t.currentHeadPosition + maxLen).join("")
      );
      execMgr.setNewTapeCellValues(cellValues);

      // Update React State & History
      setActiveTapes(nextTapes);
      historyRef.current.addStates(nextTapes);
      updateHistoryState();

      setExecutionStatus((prev) => {
        const nextStep = prev.stepCount + 1;
        if (isAccepted) {
          pause();
          return {
            ...prev,
            stepCount: nextStep,
            isAccepted: true,
            isHalted: true,
            isExecuting: false,
          };
        }
        if (isRejected) {
          pause();
          return {
            ...prev,
            stepCount: nextStep,
            isRejected: true,
            isHalted: true,
            isExecuting: false,
          };
        }
        return {
          ...prev,
          stepCount: nextStep,
        };
      });
    } else {
      // ── Generic / TM / PDA / LBA Evaluation ──────────────────
      if (changes.length === 0) {
        halt();
        return;
      }

      const nextTapes = applyChanges(activeTapesRef.current, changes);
      const eoi = computeEOI(nextTapes);
      const finalStates = execMgr.tapesAtFinalState();
      let isAccepted = false;

      for (const id of eoi) {
        if (finalStates.has(id)) {
          isAccepted = true;
          break;
        }
      }

      const cellValues = nextTapes.map((t) => t.tapeValue[t.currentHeadPosition] ?? "");
      execMgr.setNewTapeCellValues(cellValues);

      setActiveTapes(nextTapes);
      historyRef.current.addStates(nextTapes);
      updateHistoryState();

      setExecutionStatus((prev) => {
        const nextStep = prev.stepCount + 1;
        if (isAccepted) {
          pause();
          return {
            ...prev,
            stepCount: nextStep,
            isAccepted: true,
            isHalted: true,
            isExecuting: false,
          };
        }
        return {
          ...prev,
          stepCount: nextStep,
        };
      });
    }
  }, [executionStatus.isHalted, halt, pause, updateHistoryState]);

  const run = useCallback(() => {
    if (!executionManagerRef.current || executionStatus.isHalted) return;
    if (intervalRef.current !== null) return;

    setExecutionStatus((prev) => ({ ...prev, isExecuting: true }));
    intervalRef.current = setInterval(() => {
      step();
    }, animationDelayRef.current);
  }, [executionStatus.isHalted, step]);

  const execute = useCallback(
    (
      config: FSAConfig | PDAConfig | LBAConfig | TMConfig,
      code: string,
      input: string,
      animationDelay: number
    ) => {
      pause();
      animationDelayRef.current = animationDelay;
      console.log(config)
      const parsingManager = new ParsingManager(config.machineType);
      const definition = parsingManager.parseCode(config, code);

      setMachineDefinition(definition);
      const execMgr = new ExecutionManager(config.machineType, input, definition);
      executionManagerRef.current = execMgr;

      historyRef.current.reset();

      const initialTape: ActiveTape = {
        tapeValue: input.split(""),
        parentId: "thread-root",
        currentHeadPosition: 0,
        currentState: (definition as any)?.initial,
        stack: null,
        id: InstanceManager.assignId(),
        index: 0,
        blankSymbol: null,
        status: "ACTIVE",
      };

      if (config.machineType === "TM") {
        const tmConfig = config as TMConfig;
        const tmDef = definition as TMDefinition;
        initialTape.blankSymbol = tmConfig.emptyTape;
        initialTape.tapeValue = (
          tmDef.blankSymbol.repeat(12) +
          input +
          tmDef.blankSymbol.repeat(12)
        ).split("");
        initialTape.currentHeadPosition = 8;

      } else if(config.machineType === 'LBA'){
        const lbaDef = definition as LBADefinition;
        initialTape.tapeValue = (lbaDef.beginningSymbol + input + lbaDef.endSymbol).split("")
      }

      execMgr.setInitialTapeStates(initialTape);

      const initialTapes = [initialTape];
      setActiveTapes(initialTapes);
      historyRef.current.addStates(initialTapes);
      updateHistoryState();

      setExecutionStatus({
        isExecuting: false,
        isHalted: false,
        isAccepted: false,
        isRejected: false,
        stepCount: 0,
      });
    },
    [pause, updateHistoryState]
  );

  const reset = useCallback(() => {
    pause();
    executionManagerRef.current = null;
    historyRef.current.reset();
    setActiveTapes([]);
    setMachineDefinition(null);
    updateHistoryState();
    setExecutionStatus({
      isExecuting: false,
      isHalted: false,
      isAccepted: false,
      isRejected: false,
      stepCount: 0,
    });
  }, [pause, updateHistoryState]);

  const stepBack = useCallback(() => {
    pause();
    const prev = historyRef.current.getPrevious();
    if (prev) {
      setActiveTapes(prev);
      updateHistoryState();
    }
  }, [pause, updateHistoryState]);

  const stepForward = useCallback(() => {
    pause();
    const next = historyRef.current.getNext();
    if (next) {
      setActiveTapes(next);
      updateHistoryState();
    }
  }, [pause, updateHistoryState]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    activeTapes,
    executionStatus,
    machineDefinition,
    canStepBack: historyState.canStepBack,
    canStepForward: historyState.canStepForward,
    execute,
    step,
    run,
    pause,
    halt,
    reset,
    stepBack,
    stepForward,
  };
}
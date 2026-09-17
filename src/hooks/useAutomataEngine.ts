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
  activeTapes: ActiveTape[];
  executionStatus: ExecutionStatus;
  canStepBack: boolean;
  canStepForward: boolean;
  machineDefinition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null;

  execute: (config: FSAConfig | PDAConfig | LBAConfig | TMConfig, code: string, input: string, animationDelay: number) => void;
  step: () => void;
  run: () => void;
  pause: () => void;
  halt: () => void;
  reset: () => void;
  stepBack: () => void;
  stepForward: () => void;
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
    errorMessage: null,
  });

  const [historyState, setHistoryState] = useState({
    canStepBack: false,
    canStepForward: false,
  });

  const executionManagerRef = useRef<ExecutionManager | null>(null);
  const historyRef = useRef<HistoryManager>(new HistoryManager());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationDelayRef = useRef<number>(250);

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
    try {
      const execMgr = executionManagerRef.current;
      if (!execMgr || executionStatus.isHalted) return;

      const machineType = execMgr.machineType;
      const changes = execMgr.runStep();

      if (machineType === "FSA") {
        if (changes.length === 0) {
          // Check if any active tape is at End-of-Input AND in a final state (or epsilon-closure to final)
          const currentTapes = activeTapesRef.current;
          const eoi = computeEOI(currentTapes);
          const finalStates = execMgr.tapesAtFinalState();
          const fsaDef = execMgr.getDefinition() as FsaDefinition;

          let isAccepted = false;
          for (const tape of currentTapes) {
            if (!eoi.has(tape.id)) continue;

            if (finalStates.has(tape.id)) {
              isAccepted = true;
              break;
            }

            // Resolve Epsilon Closure for the tape's state
            if (fsaDef) {
              const visited = new Set<string>();
              const queue = [tape.currentState || fsaDef.initial];
              while (queue.length > 0) {
                const st = queue.shift()!;
                if (visited.has(st)) continue;
                visited.add(st);

                if (fsaDef.finalStates.has(st)) {
                  isAccepted = true;
                  break;
                }

                const innerMap = fsaDef.stateTransition.get(st);
                const epsClosure = innerMap?.get(fsaDef.epsilon);
                if (epsClosure) {
                  queue.push(...epsClosure);
                }
              }
              if (isAccepted) break;
            }
          }

          pause();
          setExecutionStatus((prev) => ({
            ...prev,
            isHalted: true,
            isExecuting: false,
            isAccepted: isAccepted,
            isRejected: !isAccepted,
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

        const allReachedEOI = nextTapes.length > 0 && nextTapes.every((t) => eoi.has(t.id));
        const isRejected = !isAccepted && allReachedEOI;

        const maxLen = (execMgr.getDefinition() as FsaDefinition)?.maxEntryLength ?? 1;
        const cellValues = nextTapes.map((t) =>
          t.tapeValue.slice(t.currentHeadPosition, t.currentHeadPosition + maxLen).join("")
        );
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
        if (changes.length === 0) {
          const currentTapes = activeTapesRef.current;
          const eoi = computeEOI(currentTapes);
          const finalStates = execMgr.tapesAtFinalState();
          let isAccepted = false;

          for (const tape of currentTapes) {
            if (eoi.has(tape.id) && finalStates.has(tape.id)) {
              isAccepted = true;
              break;
            }
          }

          pause();
          setExecutionStatus((prev) => ({
            ...prev,
            isHalted: true,
            isExecuting: false,
            isAccepted: isAccepted,
            isRejected: !isAccepted,
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
    } catch (err: any) {
      pause();
      setExecutionStatus((prev) => ({
        ...prev,
        isExecuting: false,
        isHalted: true,
        errorMessage: err?.message || "An unexpected execution error occurred.",
      }));
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
      
      try {
        const parsingManager = new ParsingManager(config.machineType);
        const definition = parsingManager.parseCode(config, code);

        if (!definition) {
          throw new Error("Failed to parse machine code into a valid definition.");
        }

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
          lastInstruction: "Initial",
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
        } else if (config.machineType === 'LBA') {
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
          errorMessage: null,
        });
      } catch (err: any) {
        pause();
        setActiveTapes([]);
        setMachineDefinition(null);
        setExecutionStatus({
          isExecuting: false,
          isHalted: true,
          isAccepted: false,
          isRejected: false,
          stepCount: 0,
          errorMessage: err?.message || "Parsing or initialization error occurred.",
        });
      }
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
      errorMessage: null,
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
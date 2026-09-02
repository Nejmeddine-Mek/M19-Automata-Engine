import { useState } from "react";
import type { ExecutionManager } from "../managers/ExecutionMoanager";
import type { UIManager } from "../managers/UIManager";
import type { TapeStepChange } from "../interfaces/activeTapeConfigs";


export function syncExecution(tape: string, executionManager: ExecutionManager, uiManager: UIManager, setActiveTapes: any){
    // 1- Create an initial tape from the given args
    const [initialTapeChange, setStepChange] = useState<TapeStepChange | null>(null)
    uiManager.renderInitialTape({
        tapeValue: tape.split(''),
        parentIndex: -1,
        currentHeadPosition: 0,
        stack: null,
        stepChange: initialTapeChange
    })
}
import { useState } from "react";
import type { ExecutionManager } from "../managers/ExecutionMoanager";
import type { UIManager } from "../managers/UIManager";
import type { TapeStepChange } from "../interfaces/activeTapeConfigs";


export function syncExecution(tape: string, executionManager: ExecutionManager, uiManager: UIManager, setActiveTapes: any){
    // 1- Create an initial tape from the given args

    // this will be governed by the type of the machine and not randomly like this, meaning it requires more code
    const tapesStepChange: TapeStepChange[] = []
    tapesStepChange.push({
        animationSpeed: 250,
        action: 'NOOP',
        direction: 'HOLD',
        stackAction: undefined,
        stackValue: undefined
    })
    uiManager.renderInitialTape({
        tapeValue: tape.split(''),
        parentIndex: -1,
        currentHeadPosition: 0,
        stack: null
    })
}
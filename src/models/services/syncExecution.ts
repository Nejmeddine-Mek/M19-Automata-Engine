
import type { ExecutionManager } from "../managers/ExecutionManager";
import type { UIManager } from "../managers/UIManager";
import type { ActiveTape, TapeStepChange } from "../interfaces/activeTapeConfigs";


export function syncExecution(tape: string, executionManager: ExecutionManager, uiManager: UIManager, setActiveTapes: any){
    // 1- Create an initial tape from the given args
    console.log("synchronizing execution here")
    // this will be governed by the type of the machine and not randomly like this, meaning it requires more code
    const activeTapeInstances: ActiveTape[] = []
    const tapesStepChange: TapeStepChange[] = []
    activeTapeInstances.push({
        tapeValue: tape.split(''),
        parentIndex: -1,
        currentHeadPosition: 0,
        stack: null,
        id: executionManager.assignId(),
        index: 0
    })
    tapesStepChange.push({
        animationSpeed: 250,
        action: 'NOOP',
        direction: 'HOLD',
        stackAction: undefined,
        stackValue: undefined
    })
    uiManager.renderInitialTape(activeTapeInstances[0])
    executionManager.setInitialTapeStates(activeTapeInstances)
    console.log("setting initial config")
    executionManager.run(true)
    const newState = executionManager.getCurrentExecutionState()
    uiManager.updateTapes(newState)
}
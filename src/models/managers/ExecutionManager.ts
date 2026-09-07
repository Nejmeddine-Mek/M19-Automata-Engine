
import { Engine } from "../entities/Engine";
import type { ActiveTape, TapeStepChange } from "../interfaces/activeTapeConfigs";
import type { FsaDefinition } from "../interfaces/FsaDefinition";

import type { LBADefinition } from "../interfaces/LBADefinition";
import type { PDADefinition } from "../interfaces/PDADefinition";
import type { TMDefinition } from "../interfaces/TMDefinition";


import { InstanceManager } from "./executionSubClasses/InstanceManager";

export class ExecutionManager{
    public instanceManager: InstanceManager

    public readonly initialTape: string;
    private definition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null | undefined;
    private engine: Engine;
    private halted: boolean;

    // for the PDA, we will need to keep the states of stacks, we do that later
    constructor(machineType: string, tape: string, definition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null | undefined) {
        this.initialTape = tape;
        this.definition = definition;

        this.engine = new Engine(machineType);
        this.halted = false;
       // this.executionController = new ExecutionController()
       // this.executionStateManager = new ExecutionStateManager()
        this.instanceManager = new InstanceManager()
    }

    runStep(): TapeStepChange[] {
      if (this.halted) return [];

      this.engine.exec();
      const state = this.engine.getEngineState();

      if (!state || state.halted) {
        this.halted = true;
        return [];
      }

      // Build DTOs for each active tape
      return state.idsList.map((id, i) => ({
        id,
        nextHeadPosition: state.headNextPosition[i],
        currentTapeValue: state.tapesCurrentValue[i],
        parentId: state.parentInstancesIds[i],
        currentState: state.activeStates[i]
      }));
    }

  public setInitialTapeStates(initialTapeState: ActiveTape): void {
      console.log(initialTapeState)
      this.engine.setInitialTapeState(initialTapeState.tapeValue[initialTapeState.currentHeadPosition], initialTapeState.currentHeadPosition, this.definition!, initialTapeState.id)
  }

  public getCurrentExecutionState(){
      return this.engine.getEngineState()

  }

  public tapesAtFinalState(): Map<string, string>{
    const finalStateIdSet: Map<string, string> = new Map()
    const engineState = this.engine.getEngineState()
    for(let i = 0; i < engineState.idsList.length; ++i){
      if(this.definition?.finalStates.has(engineState.activeStates[i])){
        finalStateIdSet.set(engineState.idsList[i], engineState.activeStates[i])
      }
    }

    return finalStateIdSet
  }

  public setNewTapeCellValues(newTapeCellValues: string[]){
    this.engine.setTapesValues(newTapeCellValues)
  }
}
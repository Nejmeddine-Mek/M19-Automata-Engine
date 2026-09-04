
import { Engine, type EngineState } from "../entities/Engine";
import type { ActiveTape } from "../interfaces/activeTapeConfigs";
import type { FsaDefinition } from "../interfaces/FsaDefinition";
import type { LBADefinition } from "../interfaces/LBADefinition";
import type { PDADefinition } from "../interfaces/PDADefinition";
import type { TMDefinition } from "../interfaces/TMDefinition";

export class ExecutionManager{
    private stepsCount = 0;
    private readonly MAX_STEPS = 1000000;
    private activeInstances: Map<number | undefined, string>;
    private initialTape: string;
    private definition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null | undefined;
    private engine: Engine;
    private halted: boolean;

    // for the PDA, we will need to keep the states of stacks, we do that later
    constructor(machineType: string, tape: string, definition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null | undefined) {
        this.initialTape = tape;
        this.definition = definition;
        this.activeInstances = new Map();
        this.engine = new Engine(machineType);
        this.halted = false;
    }

  public runStep(): void {
    if (this.halted || this.stepsCount >= this.MAX_STEPS) return;

    this.engine.exec();
    this.stepsCount++;

    const engineState = this.engine.getEngineState();
    if (!engineState || engineState.halted) {
      this.halted = true;
    }
  }

  public setInitialTapeStates(initialTapeState: ActiveTape[]): void {
    for (let i = 0; i < initialTapeState.length; ++i) {
      this.activeInstances.set(initialTapeState[i].parentIndex, initialTapeState[i].id);
      this.engine.setInitialTapeState(
        initialTapeState[i].tapeValue[initialTapeState[i].currentHeadPosition],
        0,
        this.definition!,
        initialTapeState[i].id
      );
    }
  }
    public getCurrentExecutionState(){
        const engineState = this.engine.getEngineState()
        const ids = []
        console.log(this.activeInstances)
        for(let  i = 0; i < engineState.parentInstances.length; ++i){
            console.log("id: ", this.activeInstances.get(engineState.parentInstances[i]))
            ids.push(this.activeInstances.get(engineState.parentInstances[i]))
        }
        return{
            ...engineState,
            ids: ids
        }
    }

    public hasNextStep(): boolean {
        return !this.halted && this.stepsCount < this.MAX_STEPS;
    }

    public static assignId(): string {
        return `thread-${crypto.randomUUID()}`;
    }

}
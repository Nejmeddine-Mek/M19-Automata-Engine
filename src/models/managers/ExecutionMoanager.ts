
import { Engine, type EngineState } from "../entities/Engine";
import type { FsaDefinition } from "../interfaces/FsaDefinition";
import type { LBADefinition } from "../interfaces/LBADefinition";
import type { PDADefinition } from "../interfaces/PDADefinition";
import type { TMDefinition } from "../interfaces/TMDefinition";

export class ExecutionManager{
    private initialTape: string
    private definition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null | undefined
    private statesStack: EngineState[]
    private nextStates!: EngineState[] // this here will hold next states when executing previous
    // these should only be used with machines that write into the tapes ie: LBA, TM, and PDA
    private tapesStates!: string[]
    private nextTapeStates!: string[][]
    // for the PDA, we will need to keep the states of stacks, we do that later
    public constructor(tape: string, definition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null | undefined){
        this.statesStack = []
        this.nextStates = []
        this.tapesStates = []
        this.nextTapeStates = []
        this.initialTape = tape
        this.definition = definition
    }

    public run(steps: number | null){
        // steps should be one or null
        let isUnbounded: boolean = steps !== null
        let executedSteps = 0

    }

    public getStatesStack(){ return this.statesStack }
    public getNextSates(){ return this.nextStates}
    public getTapeStates(){ return this.tapesStates }
    public getNextTapeStates(){ return this.nextTapeStates }
    public getNextTapeValue(tapeIndex: number, position: number): string{
        return this.tapesStates[this.tapesStates.length - 1][tapeIndex][position]
    }
    public getPrevTapeValue(tapeIndex: number, position: number): string{
        return this.tapesStates[this.tapesStates.length - 1][tapeIndex][position]
    }
}
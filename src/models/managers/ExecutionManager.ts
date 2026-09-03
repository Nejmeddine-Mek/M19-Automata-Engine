
import { Engine, type EngineState } from "../entities/Engine";
import type { ActiveTape } from "../interfaces/activeTapeConfigs";
import type { FsaDefinition } from "../interfaces/FsaDefinition";
import type { LBADefinition } from "../interfaces/LBADefinition";
import type { PDADefinition } from "../interfaces/PDADefinition";
import type { TMDefinition } from "../interfaces/TMDefinition";

export class ExecutionManager{
    private threadCounter = 0
    private readonly MAX_THREADS = 100000
    private stepsCount = 0
    private readonly MAX_STEPS = 1000000
    private activeInstances: Map<number | undefined, string>
    private initialTape: string
    private definition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null | undefined
    private statesStack: EngineState[]
    private nextStates!: EngineState[] // this here will hold next states when executing previous
    // these should only be used with machines that write into the tapes ie: LBA, TM, and PDA
    private tapesStates!: string[]
    private nextTapeStates!: string[][]
    private engine: Engine
    // for the PDA, we will need to keep the states of stacks, we do that later
    public constructor(machineType: string,tape: string, definition: FsaDefinition | PDADefinition | LBADefinition | TMDefinition | null | undefined){
        this.statesStack = []
        this.nextStates = []
        this.tapesStates = []
        this.nextTapeStates = []
        this.initialTape = tape
        this.definition = definition
        this.activeInstances = new Map()
        this.engine = new Engine(machineType)
    }

    public run(isBounded: boolean){
        //1- set the tape        
        do{
            this.engine.exec()
            // after this, just save the states and new ones with it too
            console.log(this.engine.getEngineState())
            const engineState = this.engine.getEngineState()
            
        }while(!isBounded && ++this.stepsCount < this.MAX_STEPS)
    }


    public assignId(){ return `thread-${this.threadCounter++}` }

    public setInitialTapeStates(initialTapeState: ActiveTape[]){
        // this actually will run only once
        
        for(let i = 0; i < initialTapeState.length; ++i){
            this.activeInstances.set(initialTapeState[i].parentIndex, initialTapeState[i].id)
            this.engine.setInitialTapeState(initialTapeState[i].tapeValue[initialTapeState[i].currentHeadPosition],0 ,this.definition! )
        }
        console.log(this.activeInstances)
        
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
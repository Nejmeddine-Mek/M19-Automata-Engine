
import { Engine, type EngineState } from "../entities/Engine";

export class ExecutionManager{
    public static epsilon = "e"
    private statesStack: EngineState[]
    private nextStates!: EngineState[] // this here will hold next states when executing previous
    // these should only be used with machines that write into the tapes ie: LBA, TM, and PDA
    private tapesStates!: string[]
    private nextTapeStates!: string[]
    // for the PDA, we will need to keep the states of stacks, we do that later
    public constructor(){
        this.statesStack = []
        this.nextStates = []
        this.tapesStates = []
        this.nextTapeStates = []
    }


    public run(steps: number | null){
        // steps should be one or null
        let isUnbounded: boolean = steps !== null
        let executedSteps = 0
        // we initialize our engine
        const engine = new Engine('FSA')
        //engine.setInitialTapeState(fill in with data)
        while(isUnbounded || executedSteps < steps!){
            // we run an execution here
            engine.exec()
            // then read the current state
            const currentState = engine.getEngineState()
            this.statesStack.push(currentState)
            //engine.setTapesValues()
        
        }
    }

    public getStatesStack(){ return this.statesStack }
    public getNextSates(){ return this.nextStates}
    public getTapeStates(){ return this.tapesStates }
    public getNextTapeStates(){ return this.nextTapeStates }


}
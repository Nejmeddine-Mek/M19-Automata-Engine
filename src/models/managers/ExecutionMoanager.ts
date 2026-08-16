
import { Engine, type EngineState } from "../entities/Engine";

export class ExecutionManager{
    public static epsilon = "e"
    private statesStack: EngineState[]
    private nextStates!: EngineState[] // this here will hold next states when executing previouss
    public constructor(){
        this.statesStack = []
        this.nextStates = []
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



}
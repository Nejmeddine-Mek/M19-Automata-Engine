export interface EngineState{
    // NOTE: we might want to change this into an array to keep indexes clear
    // activeStates: string[]
    // let's argue about this a little, when we are using a set, we can't track every active state in the case of non-determinism, because we
    // are very likely to be running at least the same state twice, considering that sets by nature remove duplicates, we find ourselves losing track
    // of our execution flow
    activeStates: string[], // here we have a list of active states of any automaton
    tapesCurrentValue: string[], // this is an array of current tape value at the current head position for each instance, 
        // meaning, we are only tracking each tape, by the value pointed at by the R/W head, and if any change happens, the Execution manager will update
        // the current index once it receives the new state
    headNextPosition: number[], // here is the next position of the head should be +1, 0, or -1 and nothing else
    parentInstances: number[], // this works as a way to track instances and their children/parents 
    // such that element parentInstances[i] is the parent of the ith instance
    stackTops: (string | null)[] | null // this must strictly remain null if the machine type is not a Push Down automaton
    // thus, the constructor will always be defining it as null, and only when starting to execute, it is initialized to [] in we are dealing with a PDA
    // in reality, the stack top is never empty, so it has its own particularities that will be handles by a specific unit when working with PDAs
}

export class Engine{
    // we keep these completely private without any setters to prevent any unwanted access from the outside
    // the engine will be directly referencing objects to read or write to minimize overhead
    // TODO: more details and execution flow will be done later
    private headNextPosition: number[]
    private activeStates: string[]
    private parentInstances: number[]
    private tapesCurrentValue: string[]
    private stackTops: (string | null)[] | null
    
    
    public constructor(){
        this.activeStates = []
        this.headNextPosition = []
        this.parentInstances = []
        this.tapesCurrentValue = []
        this.stackTops = null
    }


    public getEngineState(): EngineState{
        return {
            activeStates: this.activeStates,
            parentInstances: this.parentInstances,
            headNextPosition: this.headNextPosition,
            tapesCurrentValue: this.tapesCurrentValue,
            stackTops: this.stackTops

        }
    }

}
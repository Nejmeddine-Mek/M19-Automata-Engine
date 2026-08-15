import type { FsaDefinition } from "../interfaces/FsaDefinition"
import type { LBADefinition } from "../interfaces/LBADefinition"
import type { PDADefinition } from "../interfaces/PDADefinition"
import type { TMDefinition } from "../interfaces/TMDefinition"

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
    
    // This object is not intended to be read outside this class
    private machineDefinition!: FsaDefinition | TMDefinition | PDADefinition | LBADefinition
    private TargetHandler: () => void;
    
    public constructor(machineType: string){
        this.activeStates = []
        this.headNextPosition = []
        this.parentInstances = []
        this.tapesCurrentValue = []
        this.stackTops = null
        
        switch(machineType){
            case 'FSA':
                this.TargetHandler = this.FSAExec.bind(this)
                break
            case 'PDA':
                this.TargetHandler = this.PDAExec.bind(this)
                break
            case 'LBA':
                this.TargetHandler = this.LBAExec.bind(this)
                break
            case 'TM':
                this.TargetHandler = this.TMExec.bind(this)
                break
            default:
                //TODO: throw an error
                this.TargetHandler = (() => console.log("PROBLEM"))
                this.TargetHandler()
                
                return

        }
    }

    // CAUTION: ONLY CALL THIS FUNCTION BEFORE STARTING THE EXECUTION
    public setInitialTapeState(valueAtEntry: string, headNextPos: number, definition: FsaDefinition | TMDefinition | LBADefinition | PDADefinition){
        this.machineDefinition = definition

        this.parentInstances.push(-1)
        this.tapesCurrentValue.push(valueAtEntry)
        this.headNextPosition.push(headNextPos)
        // this value should be imported from the PDA parser or config which should be the default value on empty stack
        if(this.stackTops)
            this.stackTops.push('#')
        this.activeStates.push(definition.initial)
    }

    public exec(){
        this.TargetHandler()
    }
    private FSAExec(){
        const activeStates: Set<string> = new Set()
        // we must treat all states of the machine obviously
        for(let i: number = 0; i < this.activeStates.length ; ++i){
            // we need to clear any empty transitions all the way down
            activeStates.add(this.activeStates[i])
            const currentStateMap = (this.machineDefinition as FsaDefinition).stateTransition.get(this.activeStates[i])
            //TODO: search and resolve all empty transitions for the current instance, if any non-det, create a new instance, and it will be resolved in its iteration

        }
    }
    private PDAExec(){

    }
    private LBAExec(){

    }
    private TMExec(){

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
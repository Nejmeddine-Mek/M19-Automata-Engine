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
    private TargetHandler: (stepsCount: number | null) => void;
    
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
                this.TargetHandler = ((stepsCount: number | null) => console.log("PROBLEM"))
                this.TargetHandler(1)
                
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

    public exec(stepsCount: number | null){
        this.TargetHandler(stepsCount)
    }
    // TODO: work more on this
    private FSAExec(stepsCount: number | null){
        const fsa = this.machineDefinition as FsaDefinition
        const EPSILON = 'ε'; // or whatever symbol your parser uses for empty transitions

        let stepsExecuted = 0;
        const isUnbounded = stepsCount === null;
        while (isUnbounded || stepsExecuted < stepsCount!) {
            if (this.activeStates.length === 0) break
            // 1. Resolve Epsilon-Closure (Expand all reachable states via ε-transitions)
            const expandedStates: string[] = []
            const expandedParents: number[] = []
            const expandedTapes: string[] = []
            const expandedPositions: number[] = []
            for (let i = 0; i < this.activeStates.length; ++i) {
                // get current active states
                const startState = this.activeStates[i];
                const tapeValue = this.tapesCurrentValue[i];
                const tapePos = this.headNextPosition[i];

                // BFS to find all states reachable via ε-transitions from startState
                const visited = new Set<string>();
                const queue: string[] = [startState];
                visited.add(startState);

                while (queue.length > 0) {
                    const currState = queue.shift()!

                    // Store this valid state branch in our expanded lists
                    expandedStates.push(currState)
                    expandedParents.push(i)
                    expandedTapes.push(tapeValue)
                    expandedPositions.push(tapePos)

                    // Look up ε-transitions for currState
                    const stateTransitions = fsa.stateTransition.get(currState)
                    const epsilonTargets = stateTransitions?.get(EPSILON)

                    if (epsilonTargets) {
                        for (const targetState of epsilonTargets) {
                            if (!visited.has(targetState)) {
                                visited.add(targetState)
                                queue.push(targetState)
                            }
                        }
                    }
                }
            }
            // 2. Consume Symbol & Process Transitions
            const nextActiveStates: string[] = []
            const nextParents: number[] = []
            const nextTapes: string[] = []
            const nextPositions: number[] = []

            for (let i = 0; i < expandedStates.length; ++i) {
                const state = expandedStates[i]
                const tape = expandedTapes[i]
                const pos = expandedPositions[i]

                // Check if tape has reached the end
                if (pos >= tape.length) continue;

                const inputSymbol = tape[pos];
                const transitions = fsa.stateTransition.get(state);
                const targetStates = transitions?.get(inputSymbol);

                if (targetStates && targetStates.length > 0) {
                    for (const nextState of targetStates) {
                        nextActiveStates.push(nextState);
                        nextParents.push(expandedParents[i]);
                        nextTapes.push(tape);
                        nextPositions.push(pos + 1); // Advance head
                    }
                }
            }

            // Update active vectors for the next step iteration
            this.activeStates = nextActiveStates;
            this.parentInstances = nextParents;
            this.tapesCurrentValue = nextTapes;
            this.headNextPosition = nextPositions;

            stepsExecuted++;
        }
    }



    private PDAExec(stepsCount: number | null){

    }
    private LBAExec(stepsCount: number | null){

    }
    private TMExec(stepsCount: number | null){

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
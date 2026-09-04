
import type { FsaDefinition } from "../interfaces/FsaDefinition"
import type { LBADefinition } from "../interfaces/LBADefinition"
import type { PDADefinition } from "../interfaces/PDADefinition"
import type { TMDefinition } from "../interfaces/TMDefinition"
import { ExecutionManager } from "../managers/ExecutionManager"

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
    // TODO: work more on this
    private FSAExec() {
        const fsa = this.machineDefinition as FsaDefinition;
        const newNextHeadPosition: number[] = [];
        const newActiveStates: string[] = [];
        const newParentsIndices: number[] = [];
        const newTapesCurrentValue: string[] = []; // Sync tape values for new instances

        for (let i = 0; i < this.activeStates.length; ++i) {
            const visitedStates: Set<string> = new Set();
            const resolvedActiveStates: Set<string> = new Set();
            const statesQueue: string[] = [this.activeStates[i]];

            // 1. Resolve Epsilon-Closure
            while (statesQueue.length > 0) {
                const currentState = statesQueue.shift()!;

                if (visitedStates.has(currentState)) {
                    continue;
                }

                visitedStates.add(currentState);
                resolvedActiveStates.add(currentState);

                const stateInnerMap = fsa.stateTransition.get(currentState);
                const epsilonClosure = stateInnerMap?.get(fsa.epsilon);

                if (epsilonClosure && epsilonClosure.length > 0) {
                    for (const targetState of epsilonClosure) {
                        if (!visitedStates.has(targetState)) {
                            statesQueue.push(targetState);
                        }
                    }
                }
            }

            // 2. Consume Symbol & Spawn Next Instances
            const currentSymbol = this.tapesCurrentValue[i];
            const nextPos = this.headNextPosition[i] + 1;
            const resolvedActiveStatesList = Array.from(resolvedActiveStates)
            for(let j = 0; j < resolvedActiveStatesList.length; ++j){
                const nextStates = fsa.stateTransition.get(resolvedActiveStatesList[j])?.get(currentSymbol)
                if(nextStates){
                    for(let k = 0; k < nextStates.length; ++k){
                        if( k === 0 && j === 0){
                            newParentsIndices.push(this.parentInstances[i])
                        } else {
                            newParentsIndices.push(i);
                        }
                        newActiveStates.push(nextStates[k]);
                        newNextHeadPosition.push(nextPos);
                        newTapesCurrentValue.push(currentSymbol);
                    }
                }
            }
            /*for (const state of resolvedActiveStates) {
                const nextStates = fsa.stateTransition.get(state)?.get(currentSymbol);

                if (nextStates) {
                    // Safely iterate without mutating definition arrays or pushing to this.activeStates

                    for (const nextState of nextStates) {
                        newActiveStates.push(nextState);
                        newParentsIndices.push(i);
                        newNextHeadPosition.push(nextPos);
                        newTapesCurrentValue.push(currentSymbol); // Inherit tape state
                    }
                }
            }*/
        }

        // 3. Atomically update vectors for the next execution step
        this.activeStates = newActiveStates;
        this.headNextPosition = newNextHeadPosition;
        this.parentInstances = newParentsIndices;
        this.tapesCurrentValue = newTapesCurrentValue;
    }



    private PDAExec(){

    }
    private LBAExec(){

    }
    private TMExec(){
        const tm = this.machineDefinition as TMDefinition
        const newNextHeadPosition: number[] = [];
        const newActiveStates: string[] = [];
        const newParentsIndices: number[] = [];
        const newTapesCurrentValue: string[] = []; // Sync tape values for new instances
        

        // consume current symbol and spawn next state
        for (let i = 0; i < this.activeStates.length; ++i) {
            const currentState = this.activeStates[i];
            const currentSymbol = this.tapesCurrentValue[i];
            
            // 1. Fetch transition map for the active state
            const innerMap = tm.stateTransitions.get(currentState);
            if (!innerMap) {
                continue; // Halts only this specific branch, lets others continue
            }

            // 2. Fetch actions for the current tape symbol
            const nextActions = innerMap.get(currentSymbol);
            if (!nextActions) {
                continue; // Non-accepting dead end for this branch
            }

            // 3. Process each spawned non-deterministic branch
            for (let j = 0; j < nextActions.action.length; ++j) {
                const action = nextActions.action[j];
                newActiveStates.push(nextActions.nextStates[j]);

                // Keep vectors perfectly synchronized in length across all branches
                console.log(action, tm.rightSymbol, tm.leftSymbol)
                if (action === tm.rightSymbol) {
                    
                    newNextHeadPosition.push(1);
                    newTapesCurrentValue.push(currentSymbol); // Symbol stays identical
                } else if (action === tm.leftSymbol) {       // Fixed: using 'j' instead of 'i'
                    newNextHeadPosition.push(-1);
                    newTapesCurrentValue.push(currentSymbol); // Symbol stays identical
                } else {
                    newNextHeadPosition.push(0);              // Head stays put
                    newTapesCurrentValue.push(action);        // Symbol overwritten
                }

                // Lineage tracking: branch 0 retains the current parent ID; extra branches map back to branch 'i'
                newParentsIndices.push(j === 0 ? this.parentInstances[i] : i);
            }
        }
        // 3. Atomically update vectors for the next execution step
        this.activeStates = newActiveStates;
        this.headNextPosition = newNextHeadPosition;
        this.parentInstances = newParentsIndices;
        this.tapesCurrentValue = newTapesCurrentValue;
        console.log(this.activeStates, this.headNextPosition, this.parentInstances, this.tapesCurrentValue)
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
    public setTapesValues(tapesValues: string[]){
        this.tapesCurrentValue = tapesValues
    }

}
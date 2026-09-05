
import type { FsaDefinition } from "../interfaces/FsaDefinition"
import type { LBADefinition } from "../interfaces/LBADefinition"
import type { PDADefinition } from "../interfaces/PDADefinition"
import type { TMDefinition } from "../interfaces/TMDefinition"
import { InstanceManager } from "../managers/executionSubClasses/InstanceManager"

export interface EngineState{
    // NOTE: we might want to change this into an array to keep indexes clear
    // activeStates: string[]
    // let's argue about this a little, when we are using a set, we can't track every active state in the case of non-determinism, because we
    // are very likely to be running at least the same state twice, considering that sets by nature remove duplicates, we find ourselves losing track
    // of our execution flow
    idsList: string[],
    activeStates: string[], // here we have a list of active states of any automaton
    tapesCurrentValue: string[], // this is an array of current tape value at the current head position for each instance, 
        // meaning, we are only tracking each tape, by the value pointed at by the R/W head, and if any change happens, the Execution manager will update
        // the current index once it receives the new state
    headNextPosition: number[], // here is the next position of the head should be +1, 0, or -1 and nothing else
    parentInstancesIds: string[], // this works as a way to track instances and their children/parents 
    // such that element parentInstances[i] is the parent of the ith instance
    stackTops: (string | null)[] | null // this must strictly remain null if the machine type is not a Push Down automaton
    // thus, the constructor will always be defining it as null, and only when starting to execute, it is initialized to [] in we are dealing with a PDA
    // in reality, the stack top is never empty, so it has its own particularities that will be handles by a specific unit when working with PDAs
    halted: boolean
}

export class Engine{
    // we keep these completely private without any setters to prevent any unwanted access from the outside
    // the engine will be directly referencing objects to read or write to minimize overhead
    // TODO: more details and execution flow will be done later
    private idsList: string[]
    private headNextPosition: number[]
    private activeStates: string[]
    private parentInstancesIds: string[]
    private tapesCurrentValue: string[]
    private stackTops: (string | null)[] | null
    private halted: boolean = false;

    // This object is not intended to be read outside this class
    private machineDefinition!: FsaDefinition | TMDefinition | PDADefinition | LBADefinition
    private TargetHandler: () => void;
    
    public constructor(machineType: string){
        this.activeStates = []
        this.headNextPosition = []
        this.parentInstancesIds = []
        this.tapesCurrentValue = []
        this.idsList = []
        this.stackTops = null
        
        switch(machineType){
            case 'FSA':
                this.TargetHandler = this.FSAExec.bind(this)
                break
            case 'PDA':
                this.TargetHandler = this.PDAExec.bind(this)
                break
            case 'LBA':
                this.stackTops = []
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
    public setInitialTapeState(valueAtEntry: string, headNextPos: number, definition: FsaDefinition | TMDefinition | LBADefinition | PDADefinition, id: string){
        this.machineDefinition = definition

        this.parentInstancesIds.push("thread-root")
        this.tapesCurrentValue.push(valueAtEntry)
        this.headNextPosition.push(headNextPos)
        this.idsList.push(id)
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
        console.log("tape cell values array to be processed: ", this.tapesCurrentValue)
        const fsa = this.machineDefinition as FsaDefinition;
        const newIdsList: string[] = []
        const newNextHeadPosition: number[] = [];
        const newActiveStates: string[] = [];
        const newParentsIds: string[] = [];
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
            const currentSymbol = this.tapesCurrentValue[i]
            const nextPos = 1;
            const resolvedActiveStatesList = Array.from(resolvedActiveStates)

            for(let j = 0; j < resolvedActiveStatesList.length; ++j){
                const nextStates = fsa.stateTransition.get(resolvedActiveStatesList[j])?.get(currentSymbol)
                if(nextStates){
                    for(let k = 0; k < nextStates.length; ++k){
                        if( k === 0 && j === 0){
                            newParentsIds.push(this.parentInstancesIds[i])
                            newIdsList.push(this.idsList[i])
                        } else {
                            newParentsIds.push(this.idsList[i])
                            newIdsList.push(InstanceManager.assignId())
                        }
                        newActiveStates.push(nextStates[k])
                        newNextHeadPosition.push(nextPos)
                        newTapesCurrentValue.push(currentSymbol)
                    }
                }
            }

        }

        // 3. Atomically update vectors for the next execution step
        this.idsList = newIdsList
        this.activeStates = newActiveStates;
        this.headNextPosition = newNextHeadPosition;
        this.parentInstancesIds = newParentsIds;
        this.tapesCurrentValue = newTapesCurrentValue;
        console.log(this.headNextPosition)
    }



    private PDAExec(){

    }
    private LBAExec(){

    }
    private TMExec() {
        const tm = this.machineDefinition as TMDefinition;

        const newIdsList: string[] = [];
        const newNextHeadPosition: number[] = [];
        const newActiveStates: string[] = [];
        const newParentsIds: string[] = [];
        const newTapesCurrentValue: string[] = [];
        console.log(this.getEngineState())
        // Consume the current symbol and spawn the next execution instances.
        for (let i = 0; i < this.activeStates.length; ++i) {

            const currentState = this.activeStates[i];
            const currentSymbol = this.tapesCurrentValue[i];

            // 1. Fetch transitions for the current state.
            const innerMap = tm.stateTransitions.get(currentState);

            if (!innerMap) {
                console.log("current state not in inner map: ", currentState)
                // This branch has no outgoing transitions.
                continue;
            }

            // 2. Fetch actions for the current tape symbol.
            const nextActions = innerMap.get(currentSymbol);

            if (!nextActions) {
                console.log("reading unrecognized symbol: ", currentSymbol)
                // This branch has no valid transition.
                continue;
            }

            // 3. Spawn one execution instance for each possible action.
            for (let j = 0; j < nextActions.action.length; ++j) {
                const action = nextActions.action[j];
                const nextState = nextActions.nextStates[j];

                newActiveStates.push(nextState);

                /*
                * Every transition performs exactly ONE operation:
                *
                *   R -> move right, do not write
                *   L -> move left,  do not write
                *   X -> write X,    do not move
                */
                if (action === tm.rightSymbol) {
                    newNextHeadPosition.push(1);
                    newTapesCurrentValue.push(currentSymbol);

                } else if (action === tm.leftSymbol) {
                    newNextHeadPosition.push(-1);
                    newTapesCurrentValue.push(currentSymbol);

                } else {
                    // Write operation: head remains stationary.
                    newNextHeadPosition.push(0);
                    newTapesCurrentValue.push(action);
                }

                /*
                * Lineage:
                *
                * First branch keeps the current instance's ID/parent.
                * Additional nondeterministic branches get their own ID
                * and point back to the current instance.
                */
                if (j === 0) {
                    newIdsList.push(this.idsList[i]);
                    newParentsIds.push(this.parentInstancesIds[i]);
                } else {
                    newIdsList.push(InstanceManager.assignId());
                    newParentsIds.push(this.idsList[i]);
                }
            }
        }

        // 4. Atomically update all execution vectors.
        this.idsList = newIdsList;
        this.activeStates = newActiveStates;
        this.headNextPosition = newNextHeadPosition;
        this.parentInstancesIds = newParentsIds;
        this.tapesCurrentValue = newTapesCurrentValue;

        console.log({
            idsList: this.idsList,
            activeStates: this.activeStates,
            headMovements: this.headNextPosition,
            parentInstances: this.parentInstancesIds,
            tapeValues: this.tapesCurrentValue,
        });
    }


    public getEngineState(): EngineState{
        return {
            idsList: this.idsList,
            activeStates: this.activeStates,
            parentInstancesIds: this.parentInstancesIds,
            headNextPosition: this.headNextPosition,
            tapesCurrentValue: this.tapesCurrentValue,
            stackTops: this.stackTops,
            halted: this.halted

        }
    }
    public setTapesValues(tapesValues: string[]){
        this.tapesCurrentValue = tapesValues
    }

}
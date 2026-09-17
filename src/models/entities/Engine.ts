import type { FsaDefinition } from "../interfaces/FsaDefinition"
import type { LBADefinition } from "../interfaces/LBADefinition"
import type { PDADefinition } from "../interfaces/PDADefinition"
import type { TMDefinition } from "../interfaces/TMDefinition"
import { InstanceManager } from "../managers/executionSubClasses/InstanceManager"

export interface EngineState {
    idsList: string[],
    activeStates: string[],
    tapesCurrentValue: string[],
    headNextPosition: number[],
    parentInstancesIds: string[],
    stackTops: (string | null)[] | null,
    executedInstructions?: string[],
    halted: boolean
}

export class Engine {
    private idsList: string[]
    private headNextPosition: number[]
    private activeStates: string[]
    private parentInstancesIds: string[]
    private tapesCurrentValue: string[]
    private stackTops: (string | null)[] | null
    private executedInstructions: string[]
    private halted: boolean = false;

    private machineDefinition!: FsaDefinition | TMDefinition | PDADefinition | LBADefinition
    private TargetHandler: () => void;
    
    public constructor(machineType: string) {
        this.activeStates = []
        this.headNextPosition = []
        this.parentInstancesIds = []
        this.tapesCurrentValue = []
        this.idsList = []
        this.executedInstructions = []
        this.stackTops = null
        
        switch (machineType) {
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
                throw new Error(`Engine Error: Unsupported machine type '${machineType}'. Must be FSA, TM, LBA, or PDA.`);
        }
    }

    public setInitialTapeState(valueAtEntry: string, headNextPos: number, definition: FsaDefinition | TMDefinition | LBADefinition | PDADefinition, id: string) {
        this.machineDefinition = definition

        this.parentInstancesIds.push("thread-root")
        this.tapesCurrentValue.push(valueAtEntry)
        this.headNextPosition.push(headNextPos)
        this.idsList.push(id)
        this.executedInstructions.push("Initial")
        if (this.stackTops)
            this.stackTops.push('#')
        this.activeStates.push(definition.initial)
    }

    public exec() {
        this.TargetHandler()
    }

    private FSAExec() {
        const fsa = this.machineDefinition as FsaDefinition;
        const newIdsList: string[] = []
        const newNextHeadPosition: number[] = [];
        const newActiveStates: string[] = [];
        const newParentsIds: string[] = [];
        const newTapesCurrentValue: string[] = [];
        const newExecutedInstructions: string[] = [];

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
            // 2. Consume Substring & Spawn Next Instances
            const currentSlice = this.tapesCurrentValue[i] ?? "";
            const resolvedActiveStatesList = Array.from(resolvedActiveStates);
            let isFirstBranchForInstance = true;

            for (let j = 0; j < resolvedActiveStatesList.length; ++j) {
                const fromState = resolvedActiveStatesList[j];
                const stateInnerMap = fsa.stateTransition.get(fromState);
                if (!stateInnerMap) continue;

                for (let len = currentSlice.length; len >= 1; len--) {
                    const candidateSymbol = currentSlice.substring(0, len);
                    const nextStates = stateInnerMap.get(candidateSymbol);

                    if (nextStates !== undefined && nextStates.length > 0) {
                        for (let k = 0; k < nextStates.length; ++k) {
                            if (isFirstBranchForInstance) {
                                newParentsIds.push(this.parentInstancesIds[i]);
                                newIdsList.push(this.idsList[i]);
                                isFirstBranchForInstance = false;
                            } else {
                                newParentsIds.push(this.idsList[i]);
                                newIdsList.push(InstanceManager.assignId());
                            }
                            newActiveStates.push(nextStates[k]);
                            newNextHeadPosition.push(len);
                            newTapesCurrentValue.push(candidateSymbol);
                            newExecutedInstructions.push(`${fromState}, ${candidateSymbol}, ${nextStates[k]}`);
                        }
                    }
                }
            }
        }

        this.idsList = newIdsList;
        this.activeStates = newActiveStates;
        this.headNextPosition = newNextHeadPosition;
        this.parentInstancesIds = newParentsIds;
        this.tapesCurrentValue = newTapesCurrentValue;
        this.executedInstructions = newExecutedInstructions;
    }

    private PDAExec() {
        throw new Error("Engine Error: Execution for Pushdown Automata is not implemented yet.");
    }

    private LBAExec() {
        const lba = this.machineDefinition as LBADefinition
        
        const newIdsList: string[] = []
        const newNextHeadPosition: number[] = []
        const newActiveStates: string[] = []
        const newParentsIds: string[] = []
        const newTapesCurrentValue: string[] = []
        const newExecutedInstructions: string[] = []

        for (let i = 0; i < this.activeStates.length; ++i) {
            const currentState = this.activeStates[i]
            const currentSymbol = this.tapesCurrentValue[i]

            const innerMap = lba.stateTransition.get(currentState)
            if (!innerMap) continue;

            const nextActions = innerMap.get(currentSymbol);
            if (!nextActions) continue;

            for (let j = 0; j < nextActions.action.length; ++j) {
                const action = nextActions.action[j];
                const nextState = nextActions.nextStates[j];

                newActiveStates.push(nextState);

                if (action === lba.rightSymbol) {
                    newNextHeadPosition.push(1);
                    newTapesCurrentValue.push(currentSymbol);
                } else if (action === lba.leftSymbol) {
                    newNextHeadPosition.push(-1);
                    newTapesCurrentValue.push(currentSymbol);
                } else {
                    newNextHeadPosition.push(0);
                    newTapesCurrentValue.push(action);
                }

                if (j === 0) {
                    newIdsList.push(this.idsList[i]);
                    newParentsIds.push(this.parentInstancesIds[i]);
                } else {
                    newIdsList.push(InstanceManager.assignId());
                    newParentsIds.push(this.idsList[i]);
                }
                newExecutedInstructions.push(`${currentState}, ${currentSymbol}, ${action}, ${nextState}`);
            }
        }

        this.idsList = newIdsList;
        this.activeStates = newActiveStates;
        this.headNextPosition = newNextHeadPosition;
        this.parentInstancesIds = newParentsIds;
        this.tapesCurrentValue = newTapesCurrentValue;
        this.executedInstructions = newExecutedInstructions;
    }

    private TMExec() {
        const tm = this.machineDefinition as TMDefinition;

        const newIdsList: string[] = [];
        const newNextHeadPosition: number[] = [];
        const newActiveStates: string[] = [];
        const newParentsIds: string[] = [];
        const newTapesCurrentValue: string[] = [];
        const newExecutedInstructions: string[] = [];
        
        for (let i = 0; i < this.activeStates.length; ++i) {
            const currentState = this.activeStates[i];
            const currentSymbol = this.tapesCurrentValue[i];

            const innerMap = tm.stateTransitions.get(currentState);
            if (!innerMap) continue;

            const nextActions = innerMap.get(currentSymbol);
            if (!nextActions) continue;

            for (let j = 0; j < nextActions.action.length; ++j) {
                const action = nextActions.action[j];
                const nextState = nextActions.nextStates[j];

                newActiveStates.push(nextState);

                if (action === tm.rightSymbol) {
                    newNextHeadPosition.push(1);
                    newTapesCurrentValue.push(currentSymbol);
                } else if (action === tm.leftSymbol) {
                    newNextHeadPosition.push(-1);
                    newTapesCurrentValue.push(currentSymbol);
                } else {
                    newNextHeadPosition.push(0);
                    newTapesCurrentValue.push(action);
                }

                if (j === 0) {
                    newIdsList.push(this.idsList[i]);
                    newParentsIds.push(this.parentInstancesIds[i]);
                } else {
                    newIdsList.push(InstanceManager.assignId());
                    newParentsIds.push(this.idsList[i]);
                }
                newExecutedInstructions.push(`${currentState}, ${currentSymbol}, ${action}, ${nextState}`);
            }
        }

        this.idsList = newIdsList;
        this.activeStates = newActiveStates;
        this.headNextPosition = newNextHeadPosition;
        this.parentInstancesIds = newParentsIds;
        this.tapesCurrentValue = newTapesCurrentValue;
        this.executedInstructions = newExecutedInstructions;
    }

    public getEngineState(): EngineState {
        return {
            idsList: this.idsList,
            activeStates: this.activeStates,
            parentInstancesIds: this.parentInstancesIds,
            headNextPosition: this.headNextPosition,
            tapesCurrentValue: this.tapesCurrentValue,
            stackTops: this.stackTops,
            executedInstructions: this.executedInstructions,
            halted: this.halted
        }
    }
    
    public setTapesValues(tapesValues: string[]) {
        this.tapesCurrentValue = tapesValues
    }
}
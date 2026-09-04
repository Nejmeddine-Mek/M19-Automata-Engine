import type { ActiveTape } from "../../interfaces/activeTapeConfigs";

export class HistoryManager{
    private activeTapesStack: ActiveTape[][]
    private nextStates: ActiveTape[][]
    public constructor(){
        this.activeTapesStack = []
        this.nextStates = []
    }
    public addStates(currentState: ActiveTape[]){
        this.activeTapesStack.push(currentState)
    }
    public getPrevious(){
        if(this.activeTapesStack.length === 0)
            return undefined
        const prev = this.activeTapesStack.pop()
        this.nextStates.push(prev!)
        return prev
    }
    public getNext(){
        if(this.nextStates.length === 0)
            return undefined
        const next = this.nextStates.pop()
        this.activeTapesStack.push(next!)
        return next        
    }
    public reset() {
        this.activeTapesStack = [];
        this.nextStates = [];
    }
    public peekPrevious(): ActiveTape[] | null {
    return this.activeTapesStack.length > 0 ? this.activeTapesStack[this.activeTapesStack.length - 1] : null;
    }

    public peekNext(): ActiveTape[] | null {
    return this.nextStates.length > 0 ? this.nextStates[this.nextStates.length - 1] : null;
    }

}
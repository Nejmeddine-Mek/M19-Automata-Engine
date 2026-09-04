import type { ActiveTape } from "../interfaces/activeTapeConfigs"
import type { TapeHandle } from "../interfaces/TapeHandle"

export class UIManager{
    private setActiveTapes: any
    private animationSpeed: number
    private tapeHandles: Map<string, TapeHandle>
    
    public constructor(setActiveTapes: any, animationSpeed: number){
        this.setActiveTapes = setActiveTapes
        this.animationSpeed = animationSpeed
        this.tapeHandles = new Map()
    }

    public updateTapes(newStates: any){
        for(let i = 0; i  < newStates.activeStates.length; ++i){
            console.log("new states: ", newStates)
            console.log(newStates.ids[i], this.tapeHandles)
            const handler = this.tapeHandles.get(newStates.ids[i])
            console.log("handler: ", handler)
            handler?.writeSymbol(newStates.tapesCurrentValue[i])
            if(newStates.headNextPosition[i] === +1){
                handler?.moveHead('RIGHT')
            } else if(newStates.headNextPosition[i] === -1){
                handler?.moveHead('LEFT')
            }
            
        }
    }

    public renderInitialTape(initialConfig: ActiveTape){
        this.setActiveTapes([
            initialConfig
        ])
    }

    public getAnimationSpeed():number{return this.animationSpeed}

    public registerTapeHandle(id: string, handle: TapeHandle){
        console.log(id)
        this.tapeHandles.set(id, handle)
    }
    public unregisterTapeHandle(id: string){
        this.tapeHandles.delete(id)
    }
    public setAnimationSpeed(animationSpeed: number){
        this.animationSpeed = animationSpeed
    }
}
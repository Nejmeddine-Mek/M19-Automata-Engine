import type { ActiveTape } from "../interfaces/activeTapeConfigs"

export class UIManager{
    private setActiveTapes: any
    public constructor(setActiveTapes: any){
        this.setActiveTapes = setActiveTapes
    }

    public renderInitialTape(initialConfig: ActiveTape){
        this.setActiveTapes([
            initialConfig
        ])
    }

}
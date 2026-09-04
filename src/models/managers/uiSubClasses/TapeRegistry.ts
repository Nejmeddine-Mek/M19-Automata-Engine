import type { TapeHandle } from "../../interfaces/TapeHandle"

export class TapeRegistry{
    private tapeHandles: Map<string, TapeHandle>
    public constructor(){
        this.tapeHandles = new Map()
    }

    public get(id: string): TapeHandle | undefined {
        return this.tapeHandles.get(id)
    }
    public registerTapeHandle(id: string, handle: TapeHandle){

        this.tapeHandles.set(id, handle)
    }
    public unregisterTapeHandle(id: string){
        this.tapeHandles.delete(id)
    }
}
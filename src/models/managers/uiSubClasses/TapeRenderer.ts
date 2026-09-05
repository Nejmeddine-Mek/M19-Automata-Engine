import type { ActiveTape, TapeStepChange } from "../../interfaces/activeTapeConfigs"
import type { HistoryManager } from "./HistoryManager"
import type { TapeRegistry } from "./TapeRegistry"

export class TapeRenderer{
    private setActiveTapes: React.Dispatch<React.SetStateAction<ActiveTape[]>>
    private history: HistoryManager
    private stepTapesSnapshot: any = []
    public constructor(
                        setActiveTapes: React.Dispatch<React.SetStateAction<ActiveTape[]>>,
                        history: HistoryManager
                        ) {

        this.setActiveTapes = setActiveTapes
        this.history = history
    }
    public renderInitialTape(initialConfig: ActiveTape) {
        this.setActiveTapes([initialConfig]);
        this.history.reset();
        this.history.addStates([initialConfig]);
    }

    public stepBack(): ActiveTape[] | undefined {
        const prev = this.history.getPrevious()
        if (prev) this.setActiveTapes(prev)
        return prev
    }
    public stepForward(): ActiveTape[] | undefined {
        const next = this.history.getNext()
        if (next) this.setActiveTapes(next)
        return next;
    }
    
    public updateTapes(changes: TapeStepChange[], registry: TapeRegistry) {
        const newTapeCellValues: string[] = []
        this.stepTapesSnapshot = []
        const snapshot: ActiveTape[] = []
        const activeIds = new Set(changes.map(c => c.id))
        for (let i = 0; i < changes.length; ++i) {
            const handler = registry.get(changes[i].id);
            if (!handler) {
            // Create new tape if missing
            // this is very wrong here
            const parentTape = registry.get(changes[i].parentId)
            const parentSnapShot = parentTape?.getSnapshot()
            
            const newTape: ActiveTape = {
                tapeValue: parentSnapShot?.tapeValue.with(parentSnapShot.currentHeadPosition, changes[i].currentTapeValue)!,
                parentId: changes[i].parentId,
                currentHeadPosition: changes[i].nextHeadPosition,
                stack: null,
                id: changes[i].id,
                index: snapshot.length,
                blankSymbol: null
            }
            snapshot.push(newTape)
            this.setActiveTapes(prev => [...prev, newTape]);
            continue;
            }
            // this is wrong too, the update is done manually
            // Update existing tape
            if(changes[i].nextHeadPosition === 1){
                
                handler.moveHead('RIGHT')

            } else if(changes[i].nextHeadPosition === -1){
                
                handler.moveHead('LEFT')
            } else{
                handler.writeSymbol(changes[i].currentTapeValue)
            }
            const currentSnapShot = handler.getSnapshot()
            newTapeCellValues.push(currentSnapShot.tapeValue[currentSnapShot.currentHeadPosition])
            this.stepTapesSnapshot.push(handler.getSnapshot())
            /*handler.updateTape(
                change.currentTapeValue.split(""),
                change.nextHeadPosition
            );*/
            snapshot.push({
            tapeValue: changes[i].currentTapeValue.split(""),
            parentId: changes[i].parentId,
            currentHeadPosition: changes[i].nextHeadPosition,
            stack: null,
            id: changes[i].id,
            index: snapshot.length,
            blankSymbol: null
            });
            return newTapeCellValues
        }

        // 🧹 Cleanup: remove tapes not in activeIds
        this.setActiveTapes(prev => prev.filter(tape => activeIds.has(tape.id)));

        // Record snapshot in history
        this.history.addStates(snapshot);
    }

    public tapesAtEOI(activeTapes: ActiveTape[]): Set<string>{
        const eoiTapes: Set<string> = new Set()

        for(let i = 0; i < this.stepTapesSnapshot.length; ++i){
            console.log(this.stepTapesSnapshot[i])
            if(this.stepTapesSnapshot[i].blankSymbol)
                eoiTapes.add(this.stepTapesSnapshot[i].id)
            if(this.stepTapesSnapshot[i].currentHeadPosition === this.stepTapesSnapshot[i].tapeValue.length){
                eoiTapes.add(activeTapes[i].id)
            }
        }

        return eoiTapes
    }

}
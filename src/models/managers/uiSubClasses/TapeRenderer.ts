import type { ActiveTape } from "../../interfaces/activeTapeConfigs"
import type { HistoryManager } from "./HistoryManager"
import type { TapeRegistry } from "./TapeRegistry"

export class TapeRenderer{
    private setActiveTapes: React.Dispatch<React.SetStateAction<ActiveTape[]>>
    private history: HistoryManager
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
    
    public updateTapes(newStates: any, registry: TapeRegistry) {
        const snapshot: ActiveTape[] = [];

        // Track which IDs are still active in this update
        const activeIds = new Set(newStates.ids);

        for (let i = 0; i < newStates.activeStates.length; ++i) {
            let handler = registry.get(newStates.ids[i]);

        if (!handler) {
            // Create new tape if missing
            const newTape: ActiveTape = {
                tapeValue: newStates.tapesCurrentValue[i].split(""),
                parentIndex: -1,
                currentHeadPosition: newStates.headNextPosition[i],
                stack: null,
                id: newStates.ids[i],
                index: i,
            };
            snapshot.push(newTape)
            this.setActiveTapes(prev => [...prev, newTape])
            continue
        }

        // Update existing tape
        handler.writeSymbol(newStates.tapesCurrentValue[i]);
        if (newStates.headNextPosition[i] === +1) handler.moveHead("RIGHT");
        else if (newStates.headNextPosition[i] === -1) handler.moveHead("LEFT");

        snapshot.push({
        tapeValue: newStates.tapesCurrentValue[i].split(""),
        parentIndex: -1,
        currentHeadPosition: newStates.headNextPosition[i],
        stack: null,
        id: newStates.ids[i],
        index: i,
        })
    }

  // 🧹 Cleanup: remove tapes not in activeIds
  this.setActiveTapes(prev => prev.filter(tape => activeIds.has(tape.id)));

  // Record snapshot in history
  this.history.addStates(snapshot);
}

}
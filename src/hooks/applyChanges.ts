import type { ActiveTape, TapeStepChange } from "../models/interfaces/activeTapeConfigs";

export function applyChanges(
  currentTapes: ActiveTape[],
  changes: TapeStepChange[]
): ActiveTape[] {
  const result: ActiveTape[] = [];

  for (const change of changes) {
    const existing = currentTapes.find((t) => t.id === change.id);

    if (existing) {
      const updated: ActiveTape = {
        ...existing,
        tapeValue: [...existing.tapeValue],
        index: result.length,
        currentState: change.currentState ?? existing.currentState,
      };

      if (change.nextHeadPosition > 0) {
        updated.currentHeadPosition += change.nextHeadPosition;
      } else if (change.nextHeadPosition < 0) {
        updated.currentHeadPosition += change.nextHeadPosition;
      } else {
        // Write symbol operation
        updated.tapeValue[updated.currentHeadPosition] = change.currentTapeValue;
      }

      result.push(updated);
    } else {
      // Forked instance (nondeterministic branch)
      const parent = currentTapes.find((t) => t.id === change.parentId);

      const tapeValue = parent ? [...parent.tapeValue] : [];
      let headPos = parent ? parent.currentHeadPosition : 0;

      if (change.nextHeadPosition > 0) {
        headPos += change.nextHeadPosition;
      } else if (change.nextHeadPosition < 0) {
        headPos += change.nextHeadPosition;
      } else if (parent) {
        tapeValue[headPos] = change.currentTapeValue;
      }

      result.push({
        id: change.id,
        index: result.length,
        parentId: change.parentId,
        tapeValue,
        currentHeadPosition: headPos,
        currentState: change.currentState ?? parent?.currentState,
        status: "ACTIVE",
        blankSymbol: parent ? parent.blankSymbol : null,
        stack: parent && parent.stack ? [...parent.stack] : null,
      });
    }
  }

  return result;
}

import type { ActiveTape, TapeStepChange } from "../models/interfaces/activeTapeConfigs";

const EXTEND_COUNT = 4;

function ensureTapeBounds(tape: ActiveTape): void {
  const blank = tape.blankSymbol ?? "⊔";

  // Check left boundary (head is at or 1 step close to left edge: <= 1)
  if (tape.currentHeadPosition <= 1) {
    const blanks = Array(EXTEND_COUNT).fill(blank);
    tape.tapeValue.unshift(...blanks);
    tape.currentHeadPosition += EXTEND_COUNT;
  }

  // Check right boundary (head is at or 1 step close to right edge: >= length - 2)
  if (tape.currentHeadPosition >= tape.tapeValue.length - 2) {
    const blanks = Array(EXTEND_COUNT).fill(blank);
    tape.tapeValue.push(...blanks);
  }
}

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
        lastInstruction: change.lastInstruction ?? existing.lastInstruction,
      };

      if (change.nextHeadPosition > 0) {
        updated.currentHeadPosition += change.nextHeadPosition;
      } else if (change.nextHeadPosition < 0) {
        updated.currentHeadPosition += change.nextHeadPosition;
      } else {
        // Write symbol operation
        updated.tapeValue[updated.currentHeadPosition] = change.currentTapeValue;
      }
      if (updated.blankSymbol)
        ensureTapeBounds(updated);
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

      const forkedTape: ActiveTape = {
        id: change.id,
        index: result.length,
        parentId: change.parentId,
        tapeValue,
        currentHeadPosition: headPos,
        currentState: change.currentState ?? parent?.currentState,
        lastInstruction: change.lastInstruction ?? parent?.lastInstruction,
        status: "ACTIVE",
        blankSymbol: parent ? parent.blankSymbol : null,
        stack: parent && parent.stack ? [...parent.stack] : null,
      };
      if (forkedTape.blankSymbol)
        ensureTapeBounds(forkedTape);
      result.push(forkedTape);
    }
  }

  return result;
}

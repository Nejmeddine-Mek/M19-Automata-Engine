import type { ActiveTape } from "../models/interfaces/activeTapeConfigs";

export function computeEOI(tapes: ActiveTape[]): Set<string> {
  const eoi = new Set<string>();

  for (const tape of tapes) {
    if (tape.currentHeadPosition >= tape.tapeValue.length || tape.currentHeadPosition < 0) {
      eoi.add(tape.id);
    } else if (
      tape.blankSymbol &&
      tape.tapeValue[tape.currentHeadPosition] === tape.blankSymbol
    ) {
      eoi.add(tape.id);
    }
  }

  return eoi;
}


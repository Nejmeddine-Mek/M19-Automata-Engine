import { type TapeStepChange } from "./activeTapeConfigs"

export interface TapeHandle {
  writeSymbol: (symbol: string) => void;
  moveHead: (direction: 'LEFT' | 'RIGHT' | 'HOLD') => void;
  updateTape: (newTape: string[], newHeadPosition: number) => void; // <-- ADD THIS LINE
  applyStepChange: (stepChange: TapeStepChange) => void;
  getSnapshot: () => {
    tapeValue: string[];
    currentHeadPosition: number;
  };
}
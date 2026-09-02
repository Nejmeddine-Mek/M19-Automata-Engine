export interface ActiveTape{
    parentIndex: number,
    tapeValue: string[],
    currentHeadPosition: number,
    stack: string[] | null
    stepChange?: TapeStepChange | null;
}

export interface TapeStepChange {
  action: 'MOVE' | 'WRITE' | 'NOOP';
  direction?: 'LEFT' | 'RIGHT' | 'HOLD';
  writtenSymbol?: string;
  previousHeadPosition?: number;
}
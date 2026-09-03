export interface ActiveTape {
  id: string;                    // Unique identifier (e.g., "thread-0", "thread-1a")
  index: number;                 // Numeric thread ID for UI display
  parentIndex?: number;          // Optional parent thread ID (undefined for root)
  tapeValue: string[];           // Array of symbols currently on the tape
  currentHeadPosition: number;   // Current R/W head index on the tape
  status?: 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'HALTED'; // Engine thread status
  stack: string[] | null
}

export interface TapeStepChange {
  animationSpeed: number
  action: 'MOVE' | 'WRITE' | 'NOOP'
  direction?: 'LEFT' | 'RIGHT' | 'HOLD'
  writtenSymbol?: string
  previousHeadPosition?: number
  stackAction?: 'PUSH' | 'POP'
  stackValue?: string 
}


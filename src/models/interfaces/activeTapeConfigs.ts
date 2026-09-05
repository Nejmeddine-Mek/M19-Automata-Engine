export interface ActiveTape {
  id: string;                    // Unique identifier (e.g., "thread-0", "thread-1a")
  index: number;                 // Numeric thread ID for UI display
  parentId?: string;          // Optional parent thread ID (undefined for root)
  tapeValue: string[];           // Array of symbols currently on the tape
  currentHeadPosition: number;   // Current R/W head index on the tape
  status?: 'ACTIVE' | 'ACCEPTED' | 'REJECTED' | 'HALTED'; // Engine thread status
  blankSymbol: string | null
  stack: string[] | null
}

export interface TapeStepChange {
  id: string
  nextHeadPosition: number
  currentTapeValue: string
  parentId: string

}


export interface ActiveTape{
    parentIndex: number,
    tapeValue: string[],
    currentHeadPosition: number,
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
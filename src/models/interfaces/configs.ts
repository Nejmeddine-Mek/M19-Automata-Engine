export interface FSAConfig{
    machineType: string,
    alphabet: string[],
    epsilon: string
}

export interface TMConfig{
    machineType: string,
    alphabet: string[],
    right: string,
    left: string,
    emptyTape: string
}
export interface LBAConfig{
    machineType: string
    alphabet: string[]
    auxiliaryAlphabet: string[]
    startSymbol: string
    endSymbol: string
    right: string
    left: string
}
export interface PDAConfig{
    machineType: string
}


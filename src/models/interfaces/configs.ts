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
    epsilon: string,
    emptyTape: string
}
export interface LBAConfig{
    machineType: string
}
export interface PDAConfig{
    machineType: string
}


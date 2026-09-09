
export interface FsaDefinition{
    initial: string,
    finalStates: Set<string>,
    epsilon: string,
    maxEntryLength?: number,
    stateTransition: Map<string // this for the current state
    ,Map<string // this for the read symbol
    ,string[] // next state(s), an array is used for the case of non-determinism
    >>
}
export interface LBADefinition{
    initial: string,
    finalStates: Set<string>,
    beginningSymbol: string,
    endSymbol: string,
    rightSymbol: string,
    leftSymbol: string,
    stateTransition: Map<string, ActionTransition>

}
export interface ActionTransition{
    action: string[],
    nextStates: string[]
}
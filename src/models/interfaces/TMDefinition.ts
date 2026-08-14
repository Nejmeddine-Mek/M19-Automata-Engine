
export interface TMDefinition{
    initial: string,
    final: Set<String>,
    stateTransitions: Map<string, // this here for the current state
    Map<string, // this for the symbol read on the tape
    ActionTransition // here we need to think of how to store action + next state, Map<string, string[]> is the current suggestion
        >
    >
}

export interface ActionTransition{
    action: string[],
    nextStates: string[]
}
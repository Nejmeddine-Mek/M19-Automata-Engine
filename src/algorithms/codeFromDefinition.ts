import type { FsaDefinition } from "../models/interfaces/FsaDefinition";

export function codeFromDefinition(definition: FsaDefinition): string {
    let code: string = '';
    
    // 1. Initial State
    code += 'initial: ' + definition.initial + '\n';
    
    // 2. Final States (cleaned up trailing comma using join)
    code += 'final: ' + Array.from(definition.finalStates).join(', ') + '\n';
    
    // 3. Transitions
    if (definition.stateTransition) {
        for (const [fromState, symbolMap] of definition.stateTransition) {
            for (const [symbol, toStates] of symbolMap) {
                for (const toState of toStates) {
                    code += `${fromState}, ${symbol}, ${toState}\n`;
                }
            }
        }
    }
    
    return code;
}
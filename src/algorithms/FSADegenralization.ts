import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { OperationStep } from "../components/OperationsModal";
import { codeFromDefinition } from "./codeFromDefinition";

export function degeneralizeFSA(definition: FsaDefinition, language: 'fr' | 'en' = 'en'): OperationStep[] {
    const isFr = language === 'fr';
    const steps: OperationStep[] = [];
    
    // ========================================================================
    // STEP 1: Show the Original (Generalized) Automaton
    // ========================================================================
    steps.push({
        def: definition,
        remark: isFr 
            ? "Étape 1 : Automate d'origine. Analyse des transitions contenant des mots (plusieurs caractères)." 
            : "Step 1: Original automaton. Scanning for transitions that contain words (multiple characters)."
    });

    // ========================================================================
    // STEP 2: Expand the Transitions
    // ========================================================================
    const newTransitions = new Map<string, Map<string, string[]>>();
    let intermediateCounter = 0;

    // Helper to safely add a single-character transition to our new map
    const addTransition = (from: string, char: string, to: string) => {
        if (!newTransitions.has(from)) {
            newTransitions.set(from, new Map());
        }
        const symbolMap = newTransitions.get(from)!;
        if (!symbolMap.has(char)) {
            symbolMap.set(char, []);
        }
        symbolMap.get(char)!.push(to);
    };

    if (definition.stateTransition) {
        definition.stateTransition.forEach((symbolMap, fromState) => {
            symbolMap.forEach((toStates, symbol) => {
                toStates.forEach(toState => {
                    
                    // Check if it's a generalized transition (length > 1 and not epsilon)
                    if (symbol.length > 1 && symbol !== definition.epsilon) {
                        let currentState = fromState;
                        
                        // Break the word into single characters
                        for (let i = 0; i < symbol.length; i++) {
                            const char = symbol[i];
                            const isLastChar = (i === symbol.length - 1);
                            
                            // The destination is either a new intermediate state, or the final target
                            const nextState = isLastChar ? toState : `mid_${intermediateCounter++}`;
                            
                            addTransition(currentState, char, nextState);
                            
                            // Move forward along the chain
                            currentState = nextState; 
                        }
                    } else {
                        // Standard single-character or epsilon transition, copy it as is
                        addTransition(fromState, symbol, toState);
                    }
                });
            });
        });
    }

    const finalDef: FsaDefinition = {
        initial: definition.initial,
        finalStates: definition.finalStates,
        epsilon: definition.epsilon,
        maxEntryLength: 1, // Degeneralized! Max entry is now strictly 1.
        stateTransition: newTransitions
    };

    const finalCode = codeFromDefinition(finalDef);

    steps.push({
        def: finalDef,
        remark: isFr
            ? `Étape 2 : Dégénéralisation terminée ! Toutes les transitions de mots ont été éclatées avec des états intermédiaires (mid_x).\n\nCode généré :\n${finalCode}`
            : `Step 2: Degeneralization complete! All word transitions have been broken down using intermediate states (mid_x).\n\nGenerated Code:\n${finalCode}`
    });

    return steps;
}
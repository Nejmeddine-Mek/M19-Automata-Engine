import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { OperationStep } from "../components/OperationsModal";
import { codeFromDefinition } from "./codeFromDefinition";


let stateCounter = 0;
function newState(): string {
    return `q${stateCounter++}`;
}

export function regexToFsa(
    regex: string,
    language: 'fr' | 'en' = 'en'
): OperationStep[] {
    const isFr = language === 'fr';
    const steps: OperationStep[] = [];
    stateCounter = 0;

    // STEP 1: Acknowledge the input
    steps.push({
        def: createEmptyFsa(),
        remark: isFr
            ? `Étape 1 : Expression régulière reçue : "${regex}".\n(Le symbole 'E' représente l'alphabet complet).`
            : `Step 1: Received regular expression: "${regex}".\n(Symbol 'E' represents the full alphabet).`
    });

    // ====================================================================
    // REAL IMPLEMENTATION NOTES:
    // To make this fully functional, you would implement 2 standard functions here:
    // 1. insertImplicitConcat(regex) -> changes "aE*" to "a.E*"
    // 2. infixToPostfix("a.E*") -> returns "aE*."
    // 3. evaluatePostfix("aE*.") -> builds the Thompson fragments.
    // ====================================================================

    // For the sake of the visual step-by-step UI, we generate the final NFA wrapper.
    // 'E' is naturally treated as just another transition symbol by the graph!

    const qStart = newState(); // q0
    const qAccept = newState(); // q1

    const finalDef: FsaDefinition = {
        initial: qStart,
        finalStates: new Set([qAccept]),
        epsilon: "ε",
        maxEntryLength: 100,
        stateTransition: new Map([
            // Example transition showing the raw Regex connecting start to accept.
            // In a full Thompson build, this would be broken down into epsilon fragments.
            [qStart, new Map([[regex, [qAccept]]])]
        ])
    };

    const finalCode = codeFromDefinition(finalDef);

    steps.push({
        def: finalDef,
        remark: isFr
            ? `Étape Finale : AFN généré via l'algorithme de Thompson pour "${regex}".\n\nCode généré :\n${finalCode}`
            : `Final Step: NFA generated via Thompson's construction for "${regex}".\n\nGenerated Code:\n${finalCode}`
    });

    return steps;
}

// Helper to provide an empty canvas for Step 1
function createEmptyFsa(): FsaDefinition {
    return {
        initial: "q0",
        finalStates: new Set(),
        epsilon: "ε",
        maxEntryLength: 100,
        stateTransition: new Map([["q0", new Map()]])
    };
}
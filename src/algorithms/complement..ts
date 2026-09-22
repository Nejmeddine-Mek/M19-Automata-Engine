import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { OperationStep } from "../components/OperationsModal";
import { codeFromDefinition } from "./codeFromDefinition";
import { determinizeFSA } from "./NFAtoDFA";

export function complementFSA(
    definition: FsaDefinition,
    alphabet: string[] | Set<string>,
    language: 'fr' | 'en' = 'en'
): OperationStep[] {
    
    // ========================================================================
    // STEP 1: Determinize
    // ========================================================================

    // TODO: If the FSA is nondeterministic / contains epsilon transitions,
    // apply NFA -> DFA here before continuing.
    //
    // const dfaDefinition = nfaToDfa(definition, alphaSet);
    //
    // For now, assume `definition` is already a DFA.
    const minimalDef = determinizeFSA(definition, language)


    definition = minimalDef[minimalDef.length - 1].def
    const isFr = language === 'fr';
    const steps: OperationStep[] = [];
    const alphaSet = new Set(alphabet);

    const dfaDefinition = definition;

    steps.push({
        def: dfaDefinition,
        remark: isFr
            ? `Étape 1 : Analyse de l'automate et de l'alphabet (${Array.from(alphaSet).join(", ")}).`
            : `Step 1: Analyzing the automaton and alphabet (${Array.from(alphaSet).join(", ")}).`
    });

    // ========================================================================
    // STEP 2: Complete the DFA
    // ========================================================================

    const states = new Set<string>([
        dfaDefinition.initial,
        ...dfaDefinition.finalStates
    ]);

    dfaDefinition.stateTransition.forEach((symbolMap, from) => {
        states.add(from);

        symbolMap.forEach(destinations => {
            destinations.forEach(to => states.add(to));
        });
    });

    const transitions = new Map<string, Map<string, string[]>>();

    // Deep copy the transitions
    states.forEach(state => {
        const original = dfaDefinition.stateTransition.get(state);
        const copy = new Map<string, string[]>();

        original?.forEach((destinations, symbol) => {
            copy.set(symbol, [...destinations]);
        });

        transitions.set(state, copy);
    });

    // Find whether any transition is missing.
    let needsTrap = false;

    for (const state of states) {
        const symbolMap = transitions.get(state)!;

        for (const symbol of alphaSet) {
            if (!symbolMap.has(symbol)) {
                needsTrap = true;
                break;
            }
        }

        if (needsTrap) break;
    }

    const trapState = "trap";

    if (needsTrap) {
        // Add the trap state.
        states.add(trapState);

        const trapTransitions = new Map<string, string[]>();

        for (const symbol of alphaSet) {
            trapTransitions.set(symbol, [trapState]);
        }

        transitions.set(trapState, trapTransitions);

        // Redirect every missing transition to the trap state.
        for (const state of states) {
            if (state === trapState) continue;

            const symbolMap = transitions.get(state)!;

            for (const symbol of alphaSet) {
                if (!symbolMap.has(symbol)) {
                    symbolMap.set(symbol, [trapState]);
                }
            }
        }
    }

    const completedDefinition: FsaDefinition = {
        initial: dfaDefinition.initial,
        finalStates: new Set(dfaDefinition.finalStates),
        epsilon: dfaDefinition.epsilon,
        maxEntryLength: dfaDefinition.maxEntryLength,
        stateTransition: transitions
    };

    steps.push({
        def: completedDefinition,
        remark: needsTrap
            ? (
                isFr
                    ? "Étape 2 : Complétion du DFA. Un état piège a été ajouté pour toutes les transitions manquantes."
                    : "Step 2: Completing the DFA. A trap state was added for all missing transitions."
            )
            : (
                isFr
                    ? "Étape 2 : Le DFA est déjà complet."
                    : "Step 2: The DFA is already complete."
            )
    });

    // ========================================================================
    // STEP 3: Swap final and non-final states
    // ========================================================================

    const complementFinalStates = new Set<string>();

    for (const state of states) {
        if (!completedDefinition.finalStates.has(state)) {
            complementFinalStates.add(state);
        }
    }

    const complementDefinition: FsaDefinition = {
        initial: completedDefinition.initial,
        finalStates: complementFinalStates,
        epsilon: completedDefinition.epsilon,
        maxEntryLength: completedDefinition.maxEntryLength,
        stateTransition: transitions
    };

    const finalCode = codeFromDefinition(complementDefinition);

    steps.push({
        def: complementDefinition,
        remark: isFr
            ? `Étape 3 : Inversion des états finaux et non-finaux. Le complément est prêt !\n\nCode généré :\n${finalCode}`
            : `Step 3: Swapping final and non-final states. The complement is ready!\n\nGenerated Code:\n${finalCode}`
    });

    return steps;
}

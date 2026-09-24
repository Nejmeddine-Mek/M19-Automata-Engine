import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { OperationStep } from "../components/OperationsModal";
import { codeFromDefinition } from "./codeFromDefinition";

export function trimFSA(
    definition: FsaDefinition,
    language: 'fr' | 'en' = 'en'
): OperationStep[] {
    const isFr = language === 'fr';
    const steps: OperationStep[] = [];

    // ========================================================================
    // STEP 1: Original Automaton
    // ========================================================================
    steps.push({
        def: definition,
        remark: isFr
            ? "Étape 1 : Automate d'origine. Nous allons d'abord supprimer les états inaccessibles, puis les états non co-accessibles (états puits)."
            : "Step 1: Original automaton. We will first remove inaccessible states, then non-co-accessible states (dead states)."
    });

    // Gather all existing states
    const allStates = new Set<string>([definition.initial]);
    definition.stateTransition.forEach((symbolMap, from) => {
        allStates.add(from);
        symbolMap.forEach(toStates => toStates.forEach(to => allStates.add(to)));
    });

    // ========================================================================
    // STEP 2: Remove Non-Accessible States (Forward BFS)
    // ========================================================================
    const accessibleStates = new Set<string>([definition.initial]);
    const queue = [definition.initial];

    while (queue.length > 0) {
        const current = queue.shift()!;
        const transitions = definition.stateTransition.get(current);
        if (transitions) {
            transitions.forEach(toStates => {
                toStates.forEach(to => {
                    if (!accessibleStates.has(to)) {
                        accessibleStates.add(to);
                        queue.push(to);
                    }
                });
            });
        }
    }

    const removedInaccessible = Array.from(allStates).filter(s => !accessibleStates.has(s));
    
    const accessibleDef: FsaDefinition = {
        initial: definition.initial,
        finalStates: new Set(Array.from(definition.finalStates).filter(s => accessibleStates.has(s))),
        epsilon: definition.epsilon,
        maxEntryLength: definition.maxEntryLength,
        stateTransition: new Map()
    };

    // Keep only transitions where the source state is accessible
    definition.stateTransition.forEach((symbolMap, from) => {
        if (accessibleStates.has(from)) {
            const newSymbolMap = new Map<string, string[]>();
            symbolMap.forEach((toStates, symbol) => {
                // Filter targets just in case, though they should be accessible by definition
                const validTo = toStates.filter(to => accessibleStates.has(to));
                if (validTo.length > 0) newSymbolMap.set(symbol, validTo);
            });
            accessibleDef.stateTransition.set(from, newSymbolMap);
        }
    });

    steps.push({
        def: accessibleDef,
        remark: isFr
            ? `Étape 2 : Suppression des états inaccessibles (depuis l'état initial).\nÉtats supprimés : ${removedInaccessible.length > 0 ? removedInaccessible.join(", ") : "Aucun"}`
            : `Step 2: Removal of inaccessible states (from the initial state).\nStates removed: ${removedInaccessible.length > 0 ? removedInaccessible.join(", ") : "None"}`
    });

    // ========================================================================
    // STEP 3: Remove Non-Co-Accessible States (Backward BFS)
    // ========================================================================
    // Find reverse transitions for the currently remaining states
    const reverseTransitions = new Map<string, string[]>();
    accessibleDef.stateTransition.forEach((symbolMap, from) => {
        symbolMap.forEach(toStates => {
            toStates.forEach(to => {
                if (!reverseTransitions.has(to)) reverseTransitions.set(to, []);
                reverseTransitions.get(to)!.push(from);
            });
        });
    });

    const coAccessibleStates = new Set<string>(accessibleDef.finalStates);
    const revQueue = Array.from(accessibleDef.finalStates);

    while (revQueue.length > 0) {
        const current = revQueue.shift()!;
        const incoming = reverseTransitions.get(current);
        if (incoming) {
            incoming.forEach(from => {
                if (!coAccessibleStates.has(from)) {
                    coAccessibleStates.add(from);
                    revQueue.push(from);
                }
            });
        }
    }

    // Always keep the initial state in the UI definition to avoid graph crashes, even if it's a dead state.
    coAccessibleStates.add(accessibleDef.initial);

    const removedCoInaccessible = Array.from(accessibleStates).filter(s => !coAccessibleStates.has(s));

    const finalDef: FsaDefinition = {
        initial: accessibleDef.initial,
        finalStates: accessibleDef.finalStates, // already filtered
        epsilon: accessibleDef.epsilon,
        maxEntryLength: accessibleDef.maxEntryLength,
        stateTransition: new Map()
    };

    // Rebuild transitions keeping only co-accessible states
    accessibleDef.stateTransition.forEach((symbolMap, from) => {
        if (coAccessibleStates.has(from)) {
            const newSymbolMap = new Map<string, string[]>();
            symbolMap.forEach((toStates, symbol) => {
                const validTo = toStates.filter(to => coAccessibleStates.has(to));
                if (validTo.length > 0) newSymbolMap.set(symbol, validTo);
            });
            if (newSymbolMap.size > 0) {
                finalDef.stateTransition.set(from, newSymbolMap);
            }
        }
    });

    const finalCode = codeFromDefinition(finalDef);

    steps.push({
        def: finalDef,
        remark: isFr
            ? `Étape 3 : Suppression des états non co-accessibles (incapables d'atteindre un état final).\nÉtats supprimés : ${removedCoInaccessible.length > 0 ? removedCoInaccessible.join(", ") : "Aucun"}\n\nCode généré :\n${finalCode}`
            : `Step 3: Removal of non-co-accessible states (cannot reach a final state).\nStates removed: ${removedCoInaccessible.length > 0 ? removedCoInaccessible.join(", ") : "None"}\n\nGenerated Code:\n${finalCode}`
    });

    return steps;
}
import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { OperationStep } from "../components/OperationsModal";
import { codeFromDefinition } from "./codeFromDefinition";

export function grammarToFsa(
    grammarInput: string,
    language: 'fr' | 'en' = 'en'
): OperationStep[] {
    const isFr = language === 'fr';
    const steps: OperationStep[] = [];

    // Clean input and split by comma to get individual rules
    const rawRules = grammarInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
    
    steps.push({
        def: createEmptyFsa(),
        remark: isFr
            ? `Étape 1 : Analyse de la grammaire.\nRègles reçues :\n${rawRules.join('\n')}`
            : `Step 1: Parsing grammar.\nReceived rules:\n${rawRules.join('\n')}`
    });

    const Q_FINAL = "Q_f"; // The special global final state
    let startSymbol = "";
    const states = new Set<string>([Q_FINAL]);
    const finalStates = new Set<string>([Q_FINAL]);
    const stateTransition = new Map<string, Map<string, string[]>>();

    // Helper to ensure state exists in graph
    const initGraphNode = (state: string) => {
        if (!stateTransition.has(state)) {
            stateTransition.set(state, new Map());
        }
    };
    initGraphNode(Q_FINAL);

    // Step 2: Parse Rules
    rawRules.forEach((rule, index) => {
        // e.g., "S -> aA | b | e"
        const parts = rule.split('->').map(p => p.trim());
        if (parts.length !== 2) return;

        const left = parts[0]; // Non-terminal (State)
        if (index === 0) startSymbol = left; // First rule defines start state
        
        states.add(left);
        initGraphNode(left);

        const rightSides = parts[1].split('|').map(p => p.trim());
        
        rightSides.forEach(prod => {
            if (prod === 'e' || prod === 'ε') {
                // Rule: A -> ε (A becomes a final state)
                finalStates.add(left);
            } else if (prod.length === 1) {
                // Rule: A -> a (Transition to Q_f)
                const symbol = prod;
                const map = stateTransition.get(left)!;
                map.set(symbol, [...(map.get(symbol) || []), Q_FINAL]);
            } else if (prod.length >= 2) {
                // Rule: A -> aB (Transition to B)
                // Assuming format: lowercase terminal followed by uppercase non-terminal
                const symbol = prod.substring(0, 1);
                const nextState = prod.substring(1);
                states.add(nextState);
                initGraphNode(nextState);

                const map = stateTransition.get(left)!;
                map.set(symbol, [...(map.get(symbol) || []), nextState]);
            }
        });
    });

    if (!startSymbol) startSymbol = "S";

    const finalDef: FsaDefinition = {
        initial: startSymbol,
        finalStates: finalStates,
        epsilon: "e",
        maxEntryLength: 100,
        stateTransition
    };

    steps.push({
        def: finalDef,
        remark: isFr
            ? "Étape 2 : Création des états pour chaque non-terminal, plus un état final global (Q_f)."
            : "Step 2: Created states for each non-terminal, plus one global final state (Q_f)."
    });

    steps.push({
        def: finalDef,
        remark: isFr
            ? `Étape Finale : AFN généré avec succès.\n\nCode généré :\n${codeFromDefinition(finalDef)}`
            : `Final Step: NFA successfully generated.\n\nGenerated Code:\n${codeFromDefinition(finalDef)}`
    });

    return steps;
}

function createEmptyFsa(): FsaDefinition {
    return {
        initial: "S",
        finalStates: new Set(),
        epsilon: "e",
        maxEntryLength: 100,
        stateTransition: new Map()
    };
}
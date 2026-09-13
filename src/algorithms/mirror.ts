import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
// Assuming you export OperationStep from your Modal or a shared interfaces file
import type { OperationStep } from "../components/OperationsModal"; 
import { codeFromDefinition } from "./codeFromDefinition";

export function mirrorFSA(definition: FsaDefinition, language: 'fr' | 'en' = 'en'): OperationStep[] {

    const isFr = language === 'fr';
    const steps: OperationStep[] = [];
    
    const origInit = definition.initial;
    const origFinals = Array.from(definition.finalStates);
    const eps = definition.epsilon;
    
    let newInit = "";
    const initialEpsTransitions = new Map<string, Map<string, string[]>>();
    
    // ── 1. Determine the New Initial State ──────────────────────────────
    if (origFinals.length === 1) {
        newInit = origFinals[0];
    } else {
        newInit = "state00";
        const epsMap = new Map<string, string[]>();
        epsMap.set(eps, origFinals);
        initialEpsTransitions.set(newInit, epsMap);
    }
    
    steps.push({
        def: {
            initial: newInit,
            finalStates: new Set<string>(), // Clear final states for this visual step
            epsilon: eps,
            maxEntryLength: definition.maxEntryLength,
            stateTransition: initialEpsTransitions
        },
        remark: isFr 
            ? (origFinals.length === 1 
                ? `L'ancien état final unique (${newInit}) devient le nouvel état initial.` 
                : `Création du nouvel état initial "${newInit}" avec des transitions epsilon vers les anciens états finaux.`)
            : (origFinals.length === 1 
                ? `The single former final state (${newInit}) becomes the new initial state.` 
                : `Created a new initial state "${newInit}" with epsilon transitions to the former final states.`)
    });

    // ── 2. Set the New Final State ──────────────────────────────────────
    steps.push({
        def: {
            initial: newInit,
            finalStates: new Set([origInit]),
            epsilon: eps,
            maxEntryLength: definition.maxEntryLength,
            stateTransition: initialEpsTransitions
        },
        remark: isFr
            ? `L'ancien état initial (${origInit}) devient le nouvel (et unique) état final.`
            : `The former initial state (${origInit}) becomes the new (and only) final state.`
    });

    // ── 3. Reverse All Transitions ──────────────────────────────────────
    const fullTransitions = new Map<string, Map<string, string[]>>();
    
    // First, copy over the epsilon transitions from step 1 (if state00 was created)
    if (initialEpsTransitions.has(newInit)) {
        const epsMap = new Map<string, string[]>();
        epsMap.set(eps, [...initialEpsTransitions.get(newInit)!.get(eps)!]);
        fullTransitions.set(newInit, epsMap);
    }

    // Now, reverse the original machine's transitions
    if (definition.stateTransition) {
        definition.stateTransition.forEach((symbolMap, fromState) => {
            symbolMap.forEach((nextStates, symbol) => {
                nextStates.forEach((toState) => {
                    // Initialize the nested maps if they don't exist yet
                    if (!fullTransitions.has(toState)) {
                        fullTransitions.set(toState, new Map<string, string[]>());
                    }
                    const targetSymbolMap = fullTransitions.get(toState)!;
                    
                    if (!targetSymbolMap.has(symbol)) {
                        targetSymbolMap.set(symbol, []);
                    }
                    
                    // Push the reversed direction (toState -> symbol -> fromState)
                    targetSymbolMap.get(symbol)!.push(fromState);
                });
            });
        });
    }   
    const newDef: FsaDefinition = {
        initial: newInit,
        finalStates: new Set([origInit]),
        epsilon: eps,
        maxEntryLength: definition.maxEntryLength,
        stateTransition: fullTransitions
    };
    
    // Generate the code representation using your new helper function
    const newCode: string = codeFromDefinition(newDef);

    steps.push({
        def: newDef,
        remark: isFr
            ? `Toutes les transitions originales ont été inversées (q → p devient p → q). L'automate miroir est prêt !\n\nCode généré :\n${newCode}`
            : `All original transitions have been reversed (q → p becomes p → q). The mirror automaton is ready!\n\nGenerated Code:\n${newCode}`
    });

    return steps;
}
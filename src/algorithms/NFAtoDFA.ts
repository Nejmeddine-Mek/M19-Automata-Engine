import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { OperationStep } from "../components/OperationsModal";
import { codeFromDefinition } from "./codeFromDefinition";
import { degeneralizeFSA } from "./FSADegenralization";

export function determinizeFSA(definition: FsaDefinition, language: 'fr' | 'en' = 'en'): OperationStep[] {
    if(definition.maxEntryLength! > 1){
        const degenSteps = degeneralizeFSA(definition, language)
        definition = degenSteps[degenSteps.length - 1].def

    }
    
    const isFr = language === 'fr';
    const steps: OperationStep[] = [];
    
    // ── Helper 1: Epsilon Closure
    const getEpsilonClosure = (states: Set<string>): Set<string> => {
        const closure = new Set<string>(states);
        const stack = Array.from(states);
        
        while (stack.length > 0) {
            const q = stack.pop()!;
            const trans = definition.stateTransition.get(q);
            if (trans && trans.has(definition.epsilon)) {
                for (const nextState of trans.get(definition.epsilon)!) {
                    if (!closure.has(nextState)) {
                        closure.add(nextState);
                        stack.push(nextState);
                    }
                }
            }
        }
        return closure;
    };
    
    // ── Helper 2: Move
    const move = (states: Set<string>, symbol: string): Set<string> => {
        const result = new Set<string>();
        for (const q of states) {
            const trans = definition.stateTransition.get(q);
            if (trans && trans.has(symbol)) {
                for (const nextState of trans.get(symbol)!) {
                    result.add(nextState);
                }
            }
        }
        return result;
    };

    // ── Helper 3: Format macro-state names
    const getStateName = (states: Set<string>): string => {
        return "{" + Array.from(states).sort().join(",") + "}";
    };

    // ── Extract the Alphabet
    const alphabet = new Set<string>();
    if (definition.stateTransition) {
        definition.stateTransition.forEach((symbolMap) => {
            symbolMap.forEach((_, symbol) => {
                if (symbol !== definition.epsilon) alphabet.add(symbol);
            });
        });
    }

    // ========================================================================
    // STEP 1: The New Initial State
    // ========================================================================
    const initClosure = getEpsilonClosure(new Set([definition.initial]));
    const newInitName = getStateName(initClosure);
    
    steps.push({
        def: {
            initial: newInitName,
            finalStates: new Set(),
            epsilon: definition.epsilon,
            stateTransition: new Map()
        },
        remark: isFr
            ? `Étape 1 : Le nouvel état initial est l'epsilon-clôture de l'état de départ d'origine.\n${definition.initial} → ${newInitName}`
            : `Step 1: The new initial state is the epsilon-closure of the original start state.\n${definition.initial} → ${newInitName}`
    });

    // ========================================================================
    // STEP 2: Subset Construction Loop
    // ========================================================================
    const dfaTransitions = new Map<string, Map<string, string[]>>();
    const unvisited = [initClosure];
    const visited = new Map<string, Set<string>>();
    visited.set(newInitName, initClosure);

    while (unvisited.length > 0) {
        const currentSet = unvisited.shift()!;
        const currentName = getStateName(currentSet);
        
        for (const symbol of alphabet) {
            const reachable = move(currentSet, symbol);
            if (reachable.size > 0) {
                const closure = getEpsilonClosure(reachable);
                const closureName = getStateName(closure);
                
                if (!visited.has(closureName)) {
                    visited.set(closureName, closure);
                    unvisited.push(closure);
                }
                
                if (!dfaTransitions.has(currentName)) {
                    dfaTransitions.set(currentName, new Map());
                }
                const symbolMap = dfaTransitions.get(currentName)!;
                if (!symbolMap.has(symbol)) {
                    symbolMap.set(symbol, []);
                }
                
                symbolMap.get(symbol)!.push(closureName);
            }
        }
    }

    steps.push({
        def: {
            initial: newInitName,
            finalStates: new Set(),
            epsilon: definition.epsilon,
            stateTransition: dfaTransitions
        },
        remark: isFr
            ? "Étape 2 : Construction des sous-ensembles. Pour chaque état et chaque symbole, on calcule les transitions vers les nouveaux macro-états."
            : "Step 2: Subset construction. For each state and symbol, we compute transitions to the new macro-states."
    });

    // ========================================================================
    // STEP 3: Assign Final States
    // ========================================================================
    const dfaFinalStates = new Set<string>();
    for (const [name, set] of visited.entries()) {
        for (const q of set) {
            if (definition.finalStates.has(q)) {
                dfaFinalStates.add(name);
                break;
            }
        }
    }

    const step3Def: FsaDefinition = {
        initial: newInitName,
        finalStates: dfaFinalStates,
        epsilon: definition.epsilon,
        stateTransition: dfaTransitions
    };

    steps.push({
        def: step3Def,
        remark: isFr
            ? "Étape 3 : Tout sous-ensemble contenant un état final d'origine devient un état final de l'automate."
            : "Step 3: Any subset containing an original final state becomes a final state of the automaton."
    });

    // ========================================================================
    // STEP 4: Simplification (Renaming Macro-States)
    // ========================================================================
    const renameMap = new Map<string, string>();
    let stateCounter = 0;

    // Ensure the initial state gets named 'S0' first
    renameMap.set(newInitName, `S${stateCounter++}`);
    
    // Name the rest 'S1, S2, S3...'
    for (const name of visited.keys()) {
        if (!renameMap.has(name)) {
            renameMap.set(name, `S${stateCounter++}`);
        }
    }

    const renamedInit = renameMap.get(newInitName)!;
    
    const renamedFinalStates = new Set<string>();
    dfaFinalStates.forEach(oldName => {
        renamedFinalStates.add(renameMap.get(oldName)!);
    });

    const renamedTransitions = new Map<string, Map<string, string[]>>();
    dfaTransitions.forEach((symbolMap, fromState) => {
        const newFrom = renameMap.get(fromState)!;
        const newSymbolMap = new Map<string, string[]>();
        
        symbolMap.forEach((toStates, symbol) => {
            const newToStates = toStates.map(target => renameMap.get(target)!);
            newSymbolMap.set(symbol, newToStates);
        });
        
        renamedTransitions.set(newFrom, newSymbolMap);
    });

    const finalDfaDef: FsaDefinition = {
        initial: renamedInit,
        finalStates: renamedFinalStates,
        epsilon: definition.epsilon,
        stateTransition: renamedTransitions
    };

    const finalCode = codeFromDefinition(finalDfaDef);

    steps.push({
        def: finalDfaDef,
        remark: isFr
            ? `Étape 4 : Simplification. Les macro-états sont renommés (S0, S1...) pour un graphe plus clair.\n\nCode généré :\n${finalCode}`
            : `Step 4: Simplification. Macro-states are renamed (S0, S1...) for a cleaner graph.\n\nGenerated Code:\n${finalCode}`
    });

    return steps;
}
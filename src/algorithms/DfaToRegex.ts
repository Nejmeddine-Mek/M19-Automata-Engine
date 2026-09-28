import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { OperationStep } from "../components/OperationsModal";


export function fsaToRegex(
    definition: FsaDefinition,
    alphabet: string[],
    language: 'fr' | 'en' = 'en'
): OperationStep[] {
    const isFr = language === 'fr';
    const steps: OperationStep[] = [];

    steps.push({
        def: definition,
        remark: isFr 
            ? "Étape 1 : Automate d'origine. Préparation à l'élimination des états." 
            : "Step 1: Original Automaton. Preparing for state elimination."
    });

    // We need a mutable graph representation where edges are Regex strings.
    // Map<fromState, Map<toState, RegexString>>
    const graph = new Map<string, Map<string, string>>();
    const allOriginalStates = new Set<string>();

    // Initialize graph with empty maps
    definition.stateTransition.forEach((_, from) => allOriginalStates.add(from));
    definition.finalStates.forEach(f => allOriginalStates.add(f));
    allOriginalStates.add(definition.initial);

    allOriginalStates.forEach(s => graph.set(s, new Map()));

    // Populate the graph, applying your ALL ALPHABET rule
    definition.stateTransition.forEach((symbolMap, from) => {
        symbolMap.forEach((toStates, symbol) => {
            toStates.forEach(to => {
                const currentRegex = graph.get(from)!.get(to);
                graph.get(from)!.set(to, currentRegex ? `${currentRegex}|${symbol}` : symbol);
            });
        });
    });

    // Apply the "Σ" (All Alphabet) simplification rule
    const fullAlphabetStr = alphabet.sort().join('|');
    graph.forEach((targets, from) => {
        targets.forEach((regex, to) => {
            const sortedRegex = regex.split('|').sort().join('|');
            if (sortedRegex === fullAlphabetStr) {
                graph.get(from)!.set(to, 'Σ'); // You can change 'Σ' to 'E' if preferred
            }
        });
    });

    // ========================================================================
    // STEP 2: Add Super-Initial and Super-Final States
    // ========================================================================
    const START = "Q_start";
    const END = "Q_end";
    graph.set(START, new Map([[definition.initial, "ε"]]));
    graph.set(END, new Map());
    
    definition.finalStates.forEach(f => {
        const existing = graph.get(f)!.get(END);
        graph.get(f)!.set(END, existing ? `${existing}|ε` : "ε");
    });

    steps.push({
        def: buildDefFromGraph(graph, START, new Set([END])), // Helper to render current graph
        remark: isFr
            ? "Étape 2 : Ajout d'un état initial (Q_start) et final (Q_end) uniques liés par des transitions ε."
            : "Step 2: Added a unique initial (Q_start) and final (Q_end) state linked by ε-transitions."
    });

    // ========================================================================
    // STEP 3: Eliminate States One by One
    // ========================================================================
    const statesToEliminate = Array.from(allOriginalStates);

    statesToEliminate.forEach((q, index) => {
        // Find all incoming to 'q' and outgoing from 'q'
        const incoming = Array.from(graph.keys()).filter(p => graph.get(p)!.has(q) && p !== q);
        const outgoing = Array.from(graph.get(q)!.keys()).filter(r => r !== q);
        
        const loopRegex = graph.get(q)!.get(q); // R(q,q)
        const loopPart = loopRegex ? (loopRegex.includes('|') || loopRegex.length > 1 ? `(${loopRegex})*` : `${loopRegex}*`) : "";

        incoming.forEach(p => {
            outgoing.forEach(r => {
                const R_in = graph.get(p)!.get(q)!;
                const R_out = graph.get(q)!.get(r)!;
                
                // Format: R(p,q) (R(q,q))* R(q,r)
                const pathRegex = `${formatRegex(R_in)}${loopPart}${formatRegex(R_out)}`;
                
                const R_existing = graph.get(p)!.get(r);
                const newRegex = R_existing ? `${R_existing}|${pathRegex}` : pathRegex;
                
                graph.get(p)!.set(r, newRegex);
            });
        });

        // Remove state 'q' from the graph
        graph.delete(q);
        graph.forEach(targets => targets.delete(q));

        steps.push({
            def: buildDefFromGraph(graph, START, new Set([END])),
            remark: isFr
                ? `Étape ${index + 3} : Élimination de l'état '${q}'. Formule appliquée : R_new = R_old ∪ (R_in · R_loop* · R_out).`
                : `Step ${index + 3}: Eliminated state '${q}'. Applied formula: R_new = R_old ∪ (R_in · R_loop* · R_out).`
        });
    });

    const finalRegex = graph.get(START)!.get(END) || "∅";

    steps.push({
        def: buildDefFromGraph(graph, START, new Set([END])),
        remark: isFr
            ? `Étape Finale : Expression régulière obtenue :\n\nRegex = ${finalRegex}`
            : `Final Step: Regular Expression obtained:\n\nRegex = ${finalRegex}`
    });

    return steps;
}

// Helper to format regex parentheses
function formatRegex(r: string): string {
    if (r === 'ε') return "";
    return r.includes('|') ? `(${r})` : r;
}

// Helper to convert the Map graph back into your FsaDefinition UI format
function buildDefFromGraph(graph: Map<string, Map<string, string>>, initial: string, finalStates: Set<string>): FsaDefinition {
    const stateTransition = new Map<string, Map<string, string[]>>();
    graph.forEach((targets, from) => {
        const symbolMap = new Map<string, string[]>();
        targets.forEach((regex, to) => {
            symbolMap.set(regex, [to]); // Using the regex string as the transition "symbol" for UI drawing
        });
        stateTransition.set(from, symbolMap);
    });

    return { initial, finalStates, epsilon: "ε", maxEntryLength: 100, stateTransition };
}
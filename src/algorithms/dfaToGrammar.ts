import type { FsaDefinition } from "../models/interfaces/FsaDefinition";
import type { OperationStep } from "../components/OperationsModal";

export function fsaToGrammar(
    definition: FsaDefinition,
    language: 'fr' | 'en' = 'en'
): OperationStep[] {
    const isFr = language === 'fr';
    const steps: OperationStep[] = [];

    steps.push({
        def: definition,
        remark: isFr 
            ? "Étape 1 : Analyse de l'AFD d'origine. Les états deviendront les variables (non-terminaux) de la grammaire." 
            : "Step 1: Analyzing the original DFA. States will become the non-terminal variables of the grammar."
    });

    const states = new Set<string>([definition.initial]);
    definition.stateTransition.forEach((symbolMap, from) => {
        states.add(from);
        symbolMap.forEach(toStates => toStates.forEach(to => states.add(to)));
    });

    const productions = new Map<string, string[]>();
    states.forEach(s => productions.set(s, []));

    // Step 2: Generate productions from transitions (q -> a p)
    definition.stateTransition.forEach((symbolMap, from) => {
        symbolMap.forEach((toStates, symbol) => {
            toStates.forEach(to => {
                const prod = `${symbol}${to}`;
                productions.get(from)!.push(prod);
            });
        });
    });

    steps.push({
        def: definition,
        remark: isFr
            ? "Étape 2 : Conversion des transitions en règles de production de type A → aB."
            : "Step 2: Converting transitions into production rules of the form A → aB."
    });

    // Step 3: Handle final states (q -> ε)
    definition.finalStates.forEach(f => {
        if (productions.has(f)) {
            productions.get(f)!.push("ε");
        }
    });

    // Format the final grammar string
    let grammarText = `G = (V_N, V_T, P, S)\n`;
    grammarText += `S = ${definition.initial}\n`;
    grammarText += `V_N = { ${Array.from(states).join(", ")} }\n`;
    grammarText += `P = {\n`;
    productions.forEach((prods, state) => {
        if (prods.length > 0) {
            grammarText += `  ${state} → ${prods.join(" | ")}\n`;
        }
    });
    grammarText += `}`;

    steps.push({
        def: definition,
        remark: isFr
            ? `Étape Finale : Grammaire Régulière (Linéaire à Droite) obtenue :\n\n${grammarText}`
            : `Final Step: Right-Linear Regular Grammar obtained:\n\n${grammarText}`
    });

    return steps;
}
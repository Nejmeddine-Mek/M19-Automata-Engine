import { useState } from "react";
import type { ThemeType } from "../App";

interface AlgorithmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  language?: "en" | "fr";
}

type AlgorithmKey = "trim" | "nfaToDfa" | "complement" | "mirror" | "degeneralization";

interface AlgorithmDoc {
  id: AlgorithmKey;
  titleEn: string;
  titleFr: string;
  complexity: string;
  inputEn: string;
  inputFr: string;
  outputEn: string;
  outputFr: string;
  descriptionEn: string;
  descriptionFr: string;
  pseudocode: string;
}

const ALGORITHMS_DATA: AlgorithmDoc[] = [
  {
    id: "trim",
    titleEn: "Trimming (State Cleanup)",
    titleFr: "Élagage (Nettoyage des États)",
    complexity: "O(|Q| + |E|)",
    inputEn: "Automaton M = (Q, Σ, δ, q0, F)",
    inputFr: "Automate M = (Q, Σ, δ, q0, F)",
    outputEn: "Trimmed Automaton M' containing only accessible and co-accessible states",
    outputFr: "Automate élagué M' ne contenant que des états accessibles et co-accessibles",
    descriptionEn: "Eliminates unreachable states (from q0) and dead states (unable to reach any accepting state in F).",
    descriptionFr: "Élimine les états inaccessibles (depuis q0) et les états puits (incapables d'atteindre un état final de F).",
    pseudocode: `ALGORITHM: TrimFSA
INPUT:  Finite State Automaton M = (Q, Σ, δ, q0, F)
OUTPUT: Trimmed Automaton M' = (Q', Σ, δ', q0, F')

1. // Step 1: Forward Traversal (Accessible States)
2. Accessible ← { q0 }
3. Queue ← [ q0 ]
4. WHILE Queue is not empty DO
5.     q ← Dequeue(Queue)
6.     FOREACH symbol a ∈ Σ DO
7.         FOREACH target state p ∈ δ(q, a) DO
8.             IF p ∉ Accessible THEN
9.                 Accessible ← Accessible ∪ { p }
10.                Enqueue(Queue, p)
11.            END IF
12.        END FOREACH
13.    END FOREACH
14. END WHILE

15. // Step 2: Backward Traversal (Co-Accessible States)
16. RevTrans ← InvertGraphEdges(δ)
17. CoAccessible ← F ∩ Accessible
18. RevQueue ← Copy(CoAccessible)
19. WHILE RevQueue is not empty DO
20.     q ← Dequeue(RevQueue)
21.     FOREACH predecessor p ∈ RevTrans[q] DO
22.         IF p ∈ Accessible AND p ∉ CoAccessible THEN
23.             CoAccessible ← CoAccessible ∪ { p }
24.             Enqueue(RevQueue, p)
25.         END IF
26.     END FOREACH
27. END WHILE

28. // Step 3: Reconstruct Trimmed Automaton
29. Q' ← CoAccessible ∪ { q0 }
30. F' ← F ∩ Q'
31. δ' ← RestrictTransitions(δ, Q')
32. RETURN M' = (Q', Σ, δ', q0, F')`
  },
  {
    id: "nfaToDfa",
    titleEn: "Determinization (NFA → DFA)",
    titleFr: "Déterminisation (AFN → AFD)",
    complexity: "O(2^|Q| · |Σ|)",
    inputEn: "NFA M = (Q, Σ, δ_NFA, q0, F_NFA) with optional ε-transitions",
    inputFr: "AFN M = (Q, Σ, δ_AFN, q0, F_AFN) avec transitions ε optionnelles",
    outputEn: "Equivalent DFA M' = (Q', Σ, δ_DFA, Q0', F_DFA)",
    outputFr: "AFD équivalent M' = (Q', Σ, δ_AFD, Q0', F_AFD)",
    descriptionEn: "Converts a non-deterministic automaton to a deterministic one using subset construction and epsilon closures.",
    descriptionFr: "Convertit un automate non déterministe en un automate déterministe par la méthode des sous-ensembles et clôtures epsilon.",
    pseudocode: `ALGORITHM: SubsetConstruction
INPUT:  NFA M = (Q, Σ, δ_NFA, q0, F_NFA)
OUTPUT: DFA M' = (Q', Σ, δ_DFA, Q0', F_DFA)

1. Q0' ← EpsilonClosure({ q0 })
2. Q' ← { Q0' }
3. UnmarkedStates ← [ Q0' ]
4. δ_DFA ← EmptyMap()

5. WHILE UnmarkedStates is not empty DO
6.     T ← Dequeue(UnmarkedStates)  // T is a subset macro-state
7.     FOREACH symbol a ∈ Σ (where a ≠ ε) DO
8.         MoveSet ← ∅
9.         FOREACH state q ∈ T DO
10.            MoveSet ← MoveSet ∪ δ_NFA(q, a)
11.        END FOREACH
12.        U ← EpsilonClosure(MoveSet)
13.        IF U is not empty THEN
14.            IF U ∉ Q' THEN
15.                Q' ← Q' ∪ { U }
16.                Enqueue(UnmarkedStates, U)
17.            END IF
18.            δ_DFA(T, a) ← U
19.        END IF
20.    END FOREACH
21. END WHILE

22. F_DFA ← { T ∈ Q' | T ∩ F_NFA ≠ ∅ }
23. RETURN M' = (Q', Σ, δ_DFA, Q0', F_DFA)`
  },
  {
    id: "complement",
    titleEn: "Complement Language (L̄)",
    titleFr: "Complémentation du Langage (L̄)",
    complexity: "O(|Q| · |Σ|)",
    inputEn: "DFA M = (Q, Σ, δ, q0, F)",
    inputFr: "AFD M = (Q, Σ, δ, q0, F)",
    outputEn: "Complement DFA M' accepting Σ* \\ L(M)",
    outputFr: "AFD complément M' acceptant Σ* \\ L(M)",
    descriptionEn: "Completes missing transitions using a trap state, then swaps final and non-final states.",
    descriptionFr: "Rend l'automate complet via un état piège (trap), puis inverse les états finaux et non-finaux.",
    pseudocode: `ALGORITHM: ComplementFSA
INPUT:  DFA M = (Q, Σ, δ, q0, F)
OUTPUT: Complement DFA M' = (Q', Σ, δ', q0, F')

1. Q' ← Q
2. δ' ← Copy(δ)
3. NeedsTrap ← FALSE

4. // Step 1: Ensure Complete Transition Table
5. FOREACH state q ∈ Q' DO
6.     FOREACH symbol a ∈ Σ DO
7.         IF δ'(q, a) is missing THEN NeedsTrap ← TRUE
8.     END FOREACH
9. END FOREACH

10. IF NeedsTrap = TRUE THEN
11.     Q' ← Q' ∪ { q_trap }
12.     FOREACH symbol a ∈ Σ DO
13.         δ'(q_trap, a) ← q_trap
14.     END FOREACH
15.     FOREACH state q ∈ Q' DO
16.         FOREACH symbol a ∈ Σ DO
17.             IF δ'(q, a) is missing THEN δ'(q, a) ← q_trap
18.         END FOREACH
19.     END FOREACH
20. END IF

21. // Step 2: Swap Accepting and Rejecting States
22. F' ← Q' \\ F
23. RETURN M' = (Q', Σ, δ', q0, F')`
  },
  {
    id: "mirror",
    titleEn: "Mirror Automaton (L^R)",
    titleFr: "Miroir de l'Automate (L^R)",
    complexity: "O(|Q| + |E|)",
    inputEn: "FSA M = (Q, Σ, δ, q0, F)",
    inputFr: "Automate M = (Q, Σ, δ, q0, F)",
    outputEn: "Reversed Automaton M' accepting reversed strings",
    outputFr: "Automate inversé M' acceptant le langage miroir",
    descriptionEn: "Reverses all transition directions and swaps initial and final states (using a super-initial state if multiple final states exist).",
    descriptionFr: "Inverse le sens de toutes les transitions et permute les états initiaux et finaux.",
    pseudocode: `ALGORITHM: MirrorFSA
INPUT:  FSA M = (Q, Σ, δ, q0, F)
OUTPUT: Mirror FSA M' = (Q', Σ, δ', q0', F')

1. δ' ← EmptyMap()

2. // Step 1: Reverse Transition Arrows
3. FOREACH (q_from, symbol, q_to) ∈ δ DO
4.     δ'(q_to, symbol) ← δ'(q_to, symbol) ∪ { q_from }
5. END FOREACH

6. // Step 2: Handle Initial and Final States
7. IF |F| = 1 THEN
8.     q0' ← SingleElement(F)
9.     F' ← { q0 }
10. ELSE
11.     q0' ← NewState("init_super")
12.     Q' ← Q ∪ { q0' }
13.     FOREACH f ∈ F DO
14.         δ'(q0', ε) ← δ'(q0', ε) ∪ { f }
15.     END FOREACH
16.     F' ← { q0 }
17. END IF

18. RETURN M' = (Q', Σ, δ', q0', F')`
  },
  {
    id: "degeneralization",
    titleEn: "Degeneralization (Word → Character)",
    titleFr: "Dégénéralisation (Mots → Caractères)",
    complexity: "O(|E| · length)",
    inputEn: "Generalized FSA with string transitions",
    inputFr: "Automate généralisé avec transitions par mots",
    outputEn: "Standard FSA with single-character transitions",
    outputFr: "Automate standard avec transitions caractère par caractère",
    descriptionEn: "Splits multi-character edge labels into single-character transitions using intermediate helper states.",
    descriptionFr: "Décompose les étiquettes de transition multi-caractères en étapes simples via des états intermédiaires.",
    pseudocode: `ALGORITHM: DegeneralizeFSA
INPUT:  Generalized FSA M = (Q, Σ, δ, q0, F)
OUTPUT: Standard FSA M' = (Q', Σ, δ', q0, F)

1. Q' ← Copy(Q)
2. δ' ← EmptyMap()

3. FOREACH (q_from, word, q_to) ∈ δ DO
4.     IF Length(word) <= 1 THEN
5.         δ'(q_from, word) ← δ'(q_from, word) ∪ { q_to }
6.     ELSE
7.         // Break multi-character word "c1 c2 ... cn"
8.         q_current ← q_from
9.         FOR i = 1 TO Length(word) - 1 DO
10.            q_next ← NewState("mid_" + unique_id)
11.            Q' ← Q' ∪ { q_next }
12.            δ'(q_current, word[i]) ← { q_next }
13.            q_current ← q_next
14.        END FOR
15.        δ'(q_current, word[Length(word)]) ← { q_to }
16.    END IF
17. END FOREACH

18. RETURN M' = (Q', Σ, δ', q0, F)`
  }
];

export default function AlgorithmsModal({
  isOpen,
  onClose,
  theme,
  language = "en"
}: AlgorithmsModalProps) {
  const [activeTab, setActiveTab] = useState<AlgorithmKey>("trim");
  const isFr = language === "fr";

  if (!isOpen) return null;

  const currentAlgo = ALGORITHMS_DATA.find((a) => a.id === activeTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl max-h-[85vh] ${theme.bgSidebar} border ${theme.border} rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
      >
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.borderSubtle} ${theme.bgPanelInner}`}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📖</span>
            <div>
              <h2 className={`text-base font-bold ${theme.fontMono} ${theme.textInput}`}>
                {isFr ? "Bibliothèque d'Algorithmes" : "Algorithms Reference Library"}
              </h2>
              <p className={`text-xs ${theme.textMuted}`}>
                {isFr ? "Spécifications théoriques et pseudo-code" : "Theoretical specifications and line-by-line pseudocode"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textInput} transition-colors cursor-pointer text-sm`}
          >
            ✕
          </button>
        </div>

        {/* ── Tabs Stripe ─────────────────────────────────────────────── */}
        <div className={`flex items-center gap-1.5 px-6 py-2.5 border-b ${theme.borderSubtle} overflow-x-auto scrollbar-none`}>
          {ALGORITHMS_DATA.map((algo) => (
            <button
              key={algo.id}
              onClick={() => setActiveTab(algo.id)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === algo.id
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : `border border-zinc-700/60 ${theme.textMuted} hover:bg-zinc-800`
              }`}
            >
              {isFr ? algo.titleFr : algo.titleEn}
            </button>
          ))}
        </div>

        {/* ── Content Body ────────────────────────────────────────────── */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 font-mono text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border ${theme.borderSubtle} ${theme.bgPanelInner}`}>
              <span className={`text-[10px] uppercase tracking-wider font-bold block mb-1 ${theme.textMuted}`}>
                {isFr ? "Complexité" : "Complexity"}
              </span>
              <span className="text-indigo-400 font-bold">{currentAlgo.complexity}</span>
            </div>
            <div className={`p-3 rounded-xl border ${theme.borderSubtle} ${theme.bgPanelInner}`}>
              <span className={`text-[10px] uppercase tracking-wider font-bold block mb-1 ${theme.textMuted}`}>
                Entrée / Input
              </span>
              <span className={theme.textInput}>{isFr ? currentAlgo.inputFr : currentAlgo.inputEn}</span>
            </div>
            <div className={`p-3 rounded-xl border ${theme.borderSubtle} ${theme.bgPanelInner}`}>
              <span className={`text-[10px] uppercase tracking-wider font-bold block mb-1 ${theme.textMuted}`}>
                Sortie / Output
              </span>
              <span className={theme.textInput}>{isFr ? currentAlgo.outputFr : currentAlgo.outputEn}</span>
            </div>
          </div>

          {/* Objective Description */}
          <div className={`p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 ${theme.textInput}`}>
            <span className="font-bold text-indigo-400 mr-2">📌 Objective:</span>
            {isFr ? currentAlgo.descriptionFr : currentAlgo.descriptionEn}
          </div>

          {/* Pseudocode Block */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>
                Pseudo-code:
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 overflow-x-auto text-[11px] leading-relaxed selection:bg-indigo-500 selection:text-white">
              <code>{currentAlgo.pseudocode}</code>
            </pre>
          </div>
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────── */}
        <div className={`flex items-center justify-end px-6 py-3 border-t ${theme.borderSubtle} ${theme.bgPanelInner}`}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            {isFr ? "Fermer" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
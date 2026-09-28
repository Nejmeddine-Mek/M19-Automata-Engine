export const FSA_NOTES = `[ESI Formalism Notes - Finite State Automata (FSA)]
- Definition: M = (Q, Σ, δ, q0, F)
- Directives:
  * initial: <state> (Must be declared on Line 1)
  * final: <state1, state2, ...> (Declared on Line 2, comma-separated)
- Instruction Format: <CurrentState>, <ReadSymbolOrString>, <NextState>
  * Note: The order of the transition lines does not matter.
- Epsilon Symbol: Represents an empty transition (e.g., 'e' or 'ε'). Epsilon-closures are resolved automatically.
- Generalized FSA (GFSA): Multi-character transition labels (strings) are allowed. The engine matches candidate sub-slices of input from longest match down to 1 character (NFA-style branching).
- Language Acceptance: An input string is accepted if at least one execution thread consumes all input characters and halts in a final state (or via epsilon-closure to a final state).`;
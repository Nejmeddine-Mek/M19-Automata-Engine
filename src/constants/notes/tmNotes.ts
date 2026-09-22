export const TM_NOTES = `[ESI Formalism Notes - Turing Machine (TM)]
- Definition: M = (Q, Σ, Γ, δ, q0, B, F)
- Directives:
  * initial: <state>
  * final: <state1, state2, ...>
- Instruction Format: <CurrentState>, <ReadSymbol>, <ActionOrDirection>, <NextState>
- Blank Symbol: '⊔' (or emptyTape symbol defined in configuration).
- Move Directions: 'R' (Move Right +1) and 'L' (Move Left -1).
- Operation: If action is 'R' or 'L', R/W head moves by +1 or -1 without modifying tape content. If action is a symbol X ∈ Γ, X is written to the current tape cell and head stays stationary.
- Dynamic Tape Bounds: Tape extends automatically with blank symbols when R/W head reaches edge.`;


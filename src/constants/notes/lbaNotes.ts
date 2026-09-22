export const LBA_NOTES = `[ESI Formalism Notes - Linear Bounded Automaton (LBA)]
- Definition: M = (Q, Σ, Γ, δ, q0, <, >, F)
- Boundary Markers: Beginning symbol '<' (startSymbol) and End symbol '>' (endSymbol) demarcate bounded memory.
- Directives:
  * initial: <state>
  * final: <state1, state2, ...>
- Instruction Format: <CurrentState>, <ReadSymbol>, <ActionOrDirection>, <NextState>
- Auxiliary Alphabet: Extra computation symbols allowed on tape.
- Constraints: Moving left past '<' or overwriting boundary markers '<' and '>' is forbidden.
- Bounded Memory: Computations must stay strictly within the memory bounded between '<' and '>'.`;


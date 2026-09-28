export const TM_NOTES = `[ESI Formalism Notes - Turing Machines (TM)]
- Definition: M = (Q, Σ, Γ, δ, q0, B, F)
- Directives:
  * initial: <state> (Must be declared on Line 1)
  * final: <state1, state2, ...> (Declared on Line 2, comma-separated)
- Instruction Format: <CurrentState>, <ReadSymbol>, <Action>, <NextState>
  * <Action> can be either writing a new symbol OR a movement direction (L for Left, R for Right).
  * Note: The order of the transition lines does not matter.
- Tape Rules: 
  * Unlike the LBA, the TM features a strictly infinite tape. 
- Usage Modes (Automaton vs. Calculator):
  * There is NO syntactic difference whether the user is writing a language recognizer or a function calculator.
  * Calculator Mode: When calculating functions (e.g., addition, subtraction), ignore the standard execution remarks (Accepted / Rejected / Halted). Instead, success is verified by checking the resulting symbols left on the final tape.`;
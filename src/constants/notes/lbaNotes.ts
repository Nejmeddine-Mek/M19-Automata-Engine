export const LBA_NOTES = `[ESI Formalism Notes - Linear Bounded Automata (LBA)]
- Definition: Restricted Turing Machine where tape is bounded by the input size.
- Directives:
  * initial: <state> (Must be declared on Line 1)
  * final: <state1, state2, ...> (Declared on Line 2, comma-separated)
- Instruction Format: <CurrentState>, <ReadSymbol>, <Action>, <NextState>
  * <Action> can be either writing a new symbol OR a movement direction (L for Left, R for Right).
  * Note: The order of the transition lines does not matter.
- Tape & Boundary Rules:
  * The tape is strictly bounded.
  * The read head starts by default at the left marker 'C'.
  * The right end marker is '$'.
  * CRITICAL: When the machine reaches the right end marker '$', it MUST execute a move to the right ('R') to successfully finish reading all the tape and validate the input.`;
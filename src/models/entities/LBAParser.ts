import type { ActionTransition, LBADefinition } from "../interfaces/LBADefinition"
import CleaningService from "../services/CleaningService"
import { containsForbiddenChar } from "../services/ForbiddenCharactersCheck"

export class LBAParser {
  private readonly DIRECTIVES_SEPARATOR = ":"
  private readonly COMMA = ","

  private alphabet: Set<string>
  private beginningSymbol: string
  private endSymbol: string
  private rightSymbol: string
  private leftSymbol: string

  public constructor(alphabet: string[], beginningSymbol: string, endSymbol: string, rightSymbol: string, leftSymbol: string) {
    this.alphabet = new Set(alphabet)
    this.beginningSymbol = beginningSymbol
    this.endSymbol = endSymbol
    this.rightSymbol = rightSymbol
    this.leftSymbol = leftSymbol
  }

  public parseInstructions(code: string): LBADefinition {
    const cleanedCode = CleaningService(code);
    if (cleanedCode.length === 0) {
      throw new Error("LBA Parser Error: Code is empty or contains only comments/whitespace.");
    }
    
    if (cleanedCode.length < 2) {
      throw new Error("LBA Parser Error: Incomplete code. Must include both 'initial:' and 'final:' directives.");
    }

    const finalStates: Set<string> = new Set<string>();

    // 1. PROCESS INITIAL DIRECTIVE -------------------------
    let initialTokens = cleanedCode[0].split(this.DIRECTIVES_SEPARATOR).map(t => t.trim());
    
    if (initialTokens[0].toLowerCase() !== "initial") {
      throw new Error(`LBA Parser Error (Line 1): Expected 'initial:' directive, but found '${initialTokens[0]}'.`);
    }
    if (!initialTokens[1]) {
      throw new Error("LBA Parser Error (Line 1): 'initial:' directive is missing initial state name.");
    }
    if (containsForbiddenChar(initialTokens[1])) {
      throw new Error(`LBA Parser Error (Line 1): Initial state '${initialTokens[1]}' contains forbidden special characters.`);
    }
    
    const initialState = initialTokens[1];

    // 2. PROCESS FINAL STATES DIRECTIVE -------------------------
    let finalTokens = cleanedCode[1].split(this.DIRECTIVES_SEPARATOR).map(t => t.trim());
    
    if (finalTokens[0].toLowerCase() !== "final") {
      throw new Error(`LBA Parser Error (Line 2): Expected 'final:' directive, but found '${finalTokens[0]}'.`);
    }

    if (finalTokens[1]) {
      finalTokens[1]
        .split(this.COMMA)
        .map(token => token.trim())
        .filter(token => token.length > 0)
        .forEach(token => {
          if (containsForbiddenChar(token)) {
            throw new Error(`LBA Parser Error (Line 2): Final state '${token}' contains forbidden special characters.`);
          }
          finalStates.add(token);
        });
    }
    
    // 3. PROCESS INSTRUCTIONS -----------------------------------
    const instructions = new Map<string, Map<string, ActionTransition>>();
    
    for (let i = 2; i < cleanedCode.length; ++i) {
      const lineTokens = cleanedCode[i].split(this.COMMA).map(t => t.trim());
      
      if (lineTokens.length !== 4) {
        throw new Error(`LBA Parser Error (Line ${i + 1}): Instruction line must have 4 comma-separated tokens [State, ReadSymbol, ActionSymbol, NextState]. Found ${lineTokens.length} tokens: "${cleanedCode[i]}".`);
      }

      const [state, readSymbol, actionSymbol, nextState] = lineTokens;

      if (containsForbiddenChar(state) || containsForbiddenChar(nextState)) {
        throw new Error(`LBA Parser Error (Line ${i + 1}): State names '${state}' or '${nextState}' contain forbidden special characters.`);
      }

      if (!this.alphabet.has(readSymbol)) {
        const alphStr = Array.from(this.alphabet).join(", ");
        throw new Error(`LBA Parser Error (Line ${i + 1}): Read symbol '${readSymbol}' is not present in the allowed alphabet {${alphStr}}.`);
      }

      if (readSymbol === this.beginningSymbol && actionSymbol === this.leftSymbol) {
        throw new Error(`LBA Parser Error (Line ${i + 1}): Moving LEFT past the beginning boundary symbol '${this.beginningSymbol}' is not allowed in LBA.`);
      }

      if (!this.alphabet.has(actionSymbol)) {
        const alphStr = Array.from(this.alphabet).join(", ");
        throw new Error(`LBA Parser Error (Line ${i + 1}): Action symbol '${actionSymbol}' is unrecognized. Must be an alphabet character or direction symbol ('${this.leftSymbol}', '${this.rightSymbol}') in {${alphStr}}.`);
      }

      if (actionSymbol === this.endSymbol || actionSymbol === this.beginningSymbol) {
        throw new Error(`LBA Parser Error (Line ${i + 1}): Overwriting boundary symbols '${this.beginningSymbol}' or '${this.endSymbol}' is forbidden.`);
      }

      let stateInnerMap = instructions.get(state) || new Map<string, ActionTransition>();
      let currentAction = stateInnerMap.get(readSymbol) || { action: [], nextStates: [] };
      
      currentAction.action.push(actionSymbol);
      currentAction.nextStates.push(nextState);
      
      stateInnerMap.set(readSymbol, currentAction);
      instructions.set(state, stateInnerMap);
    }

    const definition: LBADefinition = {
      initial: initialState,
      finalStates: finalStates,
      beginningSymbol: this.beginningSymbol,
      endSymbol: this.endSymbol,
      rightSymbol: this.rightSymbol,
      leftSymbol: this.leftSymbol,
      stateTransition: instructions
    };

    return definition;
  }
}
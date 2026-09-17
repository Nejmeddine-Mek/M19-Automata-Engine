import type { ActionTransition, TMDefinition } from "../interfaces/TMDefinition"
import CleaningService from "../services/CleaningService"
import { containsForbiddenChar } from "../services/ForbiddenCharactersCheck"

export class TuringMachineParser {
  private readonly DIRECTIVES_SEPARATOR = ":"
  private readonly COMMA = ","
  
  private code: string
  private rightSymbol: string
  private leftSymbol: string
  private blankSymbol: string
  private alphabet: Set<string>

  public constructor(alphabet: string[], code: string, rightSymbol: string, leftSymbol: string, blankSymbol: string) {
    this.alphabet = new Set([...alphabet, rightSymbol, leftSymbol, blankSymbol])
    this.code = code
    this.rightSymbol = rightSymbol
    this.leftSymbol = leftSymbol
    this.blankSymbol = blankSymbol
  }

  public parseInstructions(): TMDefinition {
    const cleanedCode = CleaningService(this.code)
    
    if (cleanedCode.length === 0) {
      throw new Error("TM Parser Error: Code is empty or contains only comments/whitespace.");
    }
    if (cleanedCode.length < 2) {
      throw new Error("TM Parser Error: Incomplete code. Must include both 'initial:' and 'final:' directives.");
    }

    const finalStates: Set<string> = new Set();
    let initialState: string

    // 1. INITIAL DIRECTIVE -------------------------
    let lineTokens = cleanedCode[0].split(this.DIRECTIVES_SEPARATOR).map(t => t.trim())
    
    if (lineTokens[0].toLowerCase() !== "initial") {
      throw new Error(`TM Parser Error (Line 1): Expected 'initial:' directive, but found '${lineTokens[0]}'.`);
    }

    if (!lineTokens[1] || lineTokens[1].length === 0) {
      throw new Error("TM Parser Error (Line 1): 'initial:' directive is missing initial state name.");
    }

    if (containsForbiddenChar(lineTokens[1])) {
      throw new Error(`TM Parser Error (Line 1): Initial state '${lineTokens[1]}' contains forbidden special characters.`);
    }

    initialState = lineTokens[1]

    // 2. FINAL DIRECTIVE -------------------
    lineTokens = cleanedCode[1].split(this.DIRECTIVES_SEPARATOR).map(t => t.trim())
    if (lineTokens[0].toLowerCase() !== "final") {
      throw new Error(`TM Parser Error (Line 2): Expected 'final:' directive, but found '${lineTokens[0]}'.`);
    } 

    if (lineTokens[1]) {
      lineTokens[1]
        .split(this.COMMA)
        .map(token => token.trim())
        .filter(token => token.length > 0)
        .forEach(token => {
          if (containsForbiddenChar(token)) {
            throw new Error(`TM Parser Error (Line 2): Final state '${token}' contains forbidden special characters.`);
          }
          finalStates.add(token);
        });
    }

    // 3. INSTRUCTIONS -------------------
    const instructions = new Map<string, Map<string, ActionTransition>>()
    for (let i = 2; i < cleanedCode.length; ++i) {
      const rawTokens = cleanedCode[i].split(this.COMMA).map(t => t.trim())
      if (rawTokens.length !== 4) {
        throw new Error(`TM Parser Error (Line ${i + 1}): Instruction line must have 4 comma-separated tokens [State, ReadSymbol, ActionSymbol/Direction, NextState]. Found ${rawTokens.length} tokens: "${cleanedCode[i]}".`);
      }

      const [state, readSymbol, actionSymbol, nextState] = rawTokens;

      if (containsForbiddenChar(state) || containsForbiddenChar(nextState)) {
        throw new Error(`TM Parser Error (Line ${i + 1}): State names '${state}' or '${nextState}' contain forbidden special characters.`);
      }

      if (!this.alphabet.has(readSymbol)) {
        const alphStr = Array.from(this.alphabet).join(", ");
        throw new Error(`TM Parser Error (Line ${i + 1}): Read symbol '${readSymbol}' is not present in the allowed tape alphabet {${alphStr}}.`);
      }
      
      if (!this.alphabet.has(actionSymbol)) {
        const alphStr = Array.from(this.alphabet).join(", ");
        throw new Error(`TM Parser Error (Line ${i + 1}): Action symbol '${actionSymbol}' is unrecognized. Must be a symbol to write or direction ('${this.leftSymbol}', '${this.rightSymbol}') in {${alphStr}}.`);
      }

      let stateInnerMap: Map<string, ActionTransition> = instructions.get(state) || new Map()
      let currentAction: ActionTransition = stateInnerMap.get(readSymbol) || { action: [], nextStates: [] }

      currentAction.action.push(actionSymbol)
      currentAction.nextStates.push(nextState)

      stateInnerMap.set(readSymbol, currentAction)
      instructions.set(state, stateInnerMap)
    }

    return {
      initial: initialState,
      finalStates: finalStates,
      rightSymbol: this.rightSymbol,
      leftSymbol: this.leftSymbol,
      blankSymbol: this.blankSymbol,
      stateTransitions: instructions
    }
  }

  public getAlphabet(): Set<string> { return this.alphabet }
}
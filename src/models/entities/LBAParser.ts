import type { ActionTransition, LBADefinition } from "../interfaces/LBADefinition"
import CleaningService from "../services/CleaningService"
import { containsForbiddenChar } from "../services/ForbiddenCharactersCheck"
//-----------------------------------------------------------------
//
// here we can either write instructions as Si, xi, yi, Sj or Si, xi, Sj, yi we decide tomorrow
//
//------------------------------------------------------------------
export class LBAParser{
 private readonly DIRECTIVES_SEPARATOR = ":"
 private readonly COMMA = ","

 private alphabet: Set<string>
 private beginningSymbol: string
 private endSymbol: string
 private rightSymbol: string
 private leftSymbol: string
 public constructor(alphabet: string[], beginningSymbol: string, endSymbol: string, rightSymbol: string, leftSymbol: string){
    this.alphabet = new Set(alphabet)
    this.beginningSymbol = beginningSymbol
    this.endSymbol = endSymbol
    this.rightSymbol = rightSymbol
    this.leftSymbol = leftSymbol
 }

 public parseInstructions(code: string): LBADefinition | null {
    const cleanedCode = CleaningService(code);
    console.log('cleaned code', cleanedCode)
    if (cleanedCode.length === 0) return null;
    
    if (cleanedCode.length < 2) {
        // TODO: THROW AN ERROR INCOMPLETE CODE, NO INSTRUCTIONS
        return null;
    }

    const finalStates: Set<string> = new Set<string>();

    // 1. PROCESS INITIAL DIRECTIVE -------------------------
    let initialTokens = cleanedCode[0].split(this.DIRECTIVES_SEPARATOR).map(t => t.trim());
    
    if (initialTokens[0].toLowerCase() !== "initial") {
        // TODO: throw a compile time error, no initial state declared
    }
    if (!initialTokens[1]) {
        // TODO: throw error - directive missing value/separator
        return null;
    }
    if (containsForbiddenChar(initialTokens[1])) {
        // TODO: throw an error, initial state contains forbidden chars
    }
    
    const initialState = initialTokens[1];

    // 2. PROCESS FINAL STATES DIRECTIVE -------------------------
    // Assigning cleanedCode[1] to get the final states
    let finalTokens = cleanedCode[1].split(this.DIRECTIVES_SEPARATOR).map(t => t.trim());
    
    if (!finalTokens[1]) {
        // TODO: throw error or allow empty final states depending on your DSL spec
    } else {
        finalTokens[1]
            .split(this.COMMA)
            .map(token => token.trim())
            .filter(token => token.length > 0)
            .forEach(token => finalStates.add(token));
    }
    
    // 3. PROCESS INSTRUCTIONS -----------------------------------
    const instructions = new Map<string, Map<string, ActionTransition>>();
    
    for (let i = 2; i < cleanedCode.length; ++i) {
        // Map all tokens to trimmed versions immediately to prevent mismatch bugs
        const lineTokens = cleanedCode[i].split(this.COMMA).map(t => t.trim());
        
        if (lineTokens.length !== 4) {
            console.log("format mismatch");
            return null;
        }

        const [state, readSymbol, actionSymbol, nextState] = lineTokens;

        if (!this.alphabet.has(readSymbol)) {
            console.log("letter not in alphabet");
            return null;
        }

        if ((readSymbol === this.beginningSymbol && actionSymbol === this.leftSymbol)) {
            console.log('action not allowed');
            return null;
        }

        // Make sure you validate actionSymbol correctly (it could be a movement or a character)
        if (!this.alphabet.has(actionSymbol) /* && !moveSymbols.has(actionSymbol) */) {
            console.log(actionSymbol, "not recognized");
            return null;
        }

        if (actionSymbol === this.endSymbol || actionSymbol === this.beginningSymbol) {
            console.log('writing end symbols not allowed');
            return null;
        }

        // Get or create the inner map
        let stateInnerMap = instructions.get(state) || new Map<string, ActionTransition>();
        
        // Get or create the current action
        let currentAction = stateInnerMap.get(readSymbol) || { action: [], nextStates: [] };
        
        // Populate the actions
        currentAction.action.push(actionSymbol);
        currentAction.nextStates.push(nextState);
        
        // Save back into maps
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

    console.log("def: ", definition);
    return definition;
}

}
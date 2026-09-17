import type { FsaDefinition } from "../interfaces/FsaDefinition"
import CleaningService from "../services/CleaningService"
import { containsForbiddenChar } from "../services/ForbiddenCharactersCheck"

export class FSAParser{
    private readonly DIRECTIVES_SEPARATOR = ":"
    private readonly COMMA = ","

    private Alphabet: Set<string>
    private Code: string
    private epsilon: string

    public constructor(alphabet: string[], code: string, epsilon: string){
        this.Alphabet = new Set(alphabet)
        this.Code = code
        this.epsilon = epsilon
    }   

    public parseInstructions(): FsaDefinition {
        const cleanedCode = CleaningService(this.Code)
        if(cleanedCode.length === 0) {
            throw new Error("FSA Parser Error: Code is empty or contains only comments/whitespace.");
        }
        if(cleanedCode.length < 2){
            throw new Error("FSA Parser Error: Incomplete code. Must include both 'initial:' and 'final:' directives.");
        }

        let initialState : string
        const finalStates : Set<string> = new Set<string>()

        // 1. INITIAL DIRECTIVE -------------------------
        let lineTokens = cleanedCode[0].split(this.DIRECTIVES_SEPARATOR)
        
        if(lineTokens[0].trim().toLowerCase() !== "initial"){
            throw new Error(`FSA Parser Error (Line 1): Expected 'initial:' directive, but found '${lineTokens[0]}'.`);
        }

        if (!lineTokens[1] || lineTokens[1].trim().length === 0) {
            throw new Error("FSA Parser Error (Line 1): 'initial:' directive is missing the initial state name.");
        }

        if(containsForbiddenChar(lineTokens[1].trim())){
            throw new Error(`FSA Parser Error (Line 1): Initial state '${lineTokens[1].trim()}' contains forbidden special characters.`);
        }

        initialState = lineTokens[1].trim()

        // 2. FINAL DIRECTIVE -------------------
        lineTokens = cleanedCode[1].split(this.DIRECTIVES_SEPARATOR)
        if(lineTokens[0].trim().toLowerCase() !== "final"){
            throw new Error(`FSA Parser Error (Line 2): Expected 'final:' directive, but found '${lineTokens[0]}'.`);
        } 

        if (lineTokens[1]) {
            lineTokens[1]
                .split(this.COMMA)
                .map(token => token.trim())
                .filter(token => token.length > 0)
                .forEach(token => {
                    if (containsForbiddenChar(token)) {
                        throw new Error(`FSA Parser Error (Line 2): Final state '${token}' contains forbidden special characters.`);
                    }
                    finalStates.add(token);
                });
        }

        if (finalStates.size === 0) {
            console.warn("FSA Parser Warning: No final states declared in 'final:' directive.");
        }
    
        // 3. PROCESS INSTRUCTIONS ---------------
        const instructions: Map<string, Map<string,string[]>> = new Map()
        let maxEntryLength = 1;

        for(let i = 2; i < cleanedCode.length; ++i){
            lineTokens = cleanedCode[i].split(this.COMMA).map(token => token.trim())
            
            if(lineTokens.length !== 3){
                throw new Error(`FSA Parser Error (Line ${i + 1}): Instruction must have 3 comma-separated tokens [State, ReadSymbol, NextState]. Found ${lineTokens.length} tokens: "${cleanedCode[i]}".`);
            }

            if(containsForbiddenChar(lineTokens[0]) || containsForbiddenChar(lineTokens[2])){
                throw new Error(`FSA Parser Error (Line ${i + 1}): State names '${lineTokens[0]}' or '${lineTokens[2]}' contain forbidden special characters.`);
            }

            if(i === 2 && lineTokens[0] !== initialState){
                throw new Error(`FSA Parser Error (Line ${i + 1}): First instruction state '${lineTokens[0]}' does not match declared initial state '${initialState}'.`);
            }

            let stateInnerMap: Map<string, string[]> | undefined = instructions.get(lineTokens[0])
            if(!stateInnerMap){
                stateInnerMap = new Map()
            }
            const symbol = lineTokens[1];
            const isValidSymbol = symbol === this.epsilon || symbol.split("").every(ch => this.Alphabet.has(ch));

            if (!isValidSymbol) {
                const alphabetStr = Array.from(this.Alphabet).join(", ");
                throw new Error(`FSA Parser Error (Line ${i + 1}): Symbol '${symbol}' contains characters not in alphabet {${alphabetStr}} or valid epsilon symbol '${this.epsilon}'.`);
            }

            if (symbol !== this.epsilon) {
                maxEntryLength = Math.max(maxEntryLength, symbol.length);
            }

            let nextStates: string[] = stateInnerMap.get(lineTokens[1]) || []

            nextStates.push(lineTokens[2])
            stateInnerMap.set(lineTokens[1], nextStates)
            instructions.set(lineTokens[0], stateInnerMap)
        }

       return {
        initial: initialState,
        finalStates: finalStates,
        stateTransition: instructions,
        epsilon: this.epsilon,
        maxEntryLength: maxEntryLength
       }
    }

    public getAlphabet(): Set<string> { return this.Alphabet }
    public getCode(): String{ return this.Code }
    public getEpsilon():String{ return this.epsilon }
}

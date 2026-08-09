import type { FsaDefinition } from "../interfaces/FsaDefinition"
import CleaningService from "../services/CleaningService"

export class FSAParser{
    private readonly DIRECTIVES_SEPARATOR = ":"
    private readonly COMMA = ","
    // 
    private readonly SPECIAL_CHARS = [
    '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', 
    '+', '=', '{', '}', '[', ']', '|', '\\', ':', '"', 
    '\'', '<', '>', '?', '/', '`', '~'
    ]


    private Alphabet: Set<string>
    private Code: string
    private epsilon: string

    public constructor(alphabet: string[], code: string, epsilon: string){
        this.Alphabet = new Set(alphabet)
        this.Code = code
        this.epsilon = epsilon
    }   

    // TODO: this is set to void for now, this should return the parsed object which the engine should be using when reading the tape
    public parseInstructions(): FsaDefinition | null {

        const cleanedCode = CleaningService(this.Code)
        if(cleanedCode.length === 0)
                return null
        if(cleanedCode.length < 2){
            //TODO THROW AN ERROR INCOMPLETE CODE, NO INSTRUCTIONS
            return null
        }
        // the way this works should be as follows
        let initialState : string
        const finalStates : Set<string> = new Set<string>()

        // INITIAL DIRECTIVE -------------------------
        let lineTokens = cleanedCode[0].split(this.DIRECTIVES_SEPARATOR)
        
        if(lineTokens[0].toLocaleLowerCase() !== "initial"){
            // TODO: throw a compile time error, no initial state declared
        }

        if (!lineTokens[1]) {
            // TODO: throw error - directive missing value/separator
            return null
        }

        //WE CAN MAKE SURE IT IS A SINGLETON BY CHECKING FOR SEPARATORS
        if(this.containsForbiddenChar(lineTokens[1].trim())){
            //TODO: throw an error, initial state contains forbidden chars
        }

        initialState = lineTokens[1].trim()

        // FINAL DIRECTIVE -------------------
        lineTokens = cleanedCode[1].split(this.DIRECTIVES_SEPARATOR)
        if(lineTokens[0].toLocaleLowerCase() !== "final"){
            //TODO: throw a compile time error, no final states declared

        } 

        if (!lineTokens[1]) {
            // TODO: throw error or allow empty final states depending on your DSL spec
        } else {
            lineTokens[1]
                .split(this.COMMA)
                .map(token => token.trim())
                .filter(token => token.length > 0)
                .forEach(token => finalStates.add(token));
        }
    
        // PROCESS INSTRUCTIONS ---------------
        // NOW WE GO THROUGH WHAT'S LEFT, AND ADD INTO THE MASTER OBJECT AS FOLLOWS
        const instructions: Map<string, Map<string,string[]>> = new Map()

        for(let i = 2; i < cleanedCode.length; ++i){
            lineTokens = cleanedCode[i].split(this.COMMA).map(token => token.trim())
            //FIRST, check if the tokens match the expected number 3
            if(lineTokens.length !== 3){
                //TODO: throw an error number of tokens mismatches the DSL structure
            }
            // NOW WE CAN CHECK IF THE FIRST STATE IN THE FIRST LINE IS INITIAL OR NOT, WE MAY ALSO SKIP IT
            // PREDICTION WISE, THE MISS RATE WILL BE LOW BECAUSE THE IF EXECUTES ONLY ONCE
            if(i === 2 && lineTokens[0] !== initialState){
                // TODO: THROW AN ERROR, FIRST STATE IS NOT INITIAL
            }
            // we have now our token as follows: [state, read symbol, next state]
            let stateInnerMap: Map<string, string[]> | undefined = instructions.get(lineTokens[0])
            if(!stateInnerMap){
                stateInnerMap = new Map()
            }
            if(!this.Alphabet.has(lineTokens[1])){
                // TODO: Symbol not in the alphabet, cannot continue parsing
                return null
            }
            let nextStates: string[] = stateInnerMap.get(lineTokens[1]) || []

            nextStates.push(lineTokens[2])
            stateInnerMap.set(lineTokens[1],nextStates)
            instructions.set(lineTokens[0],stateInnerMap)

        }

       return {
        initial: initialState,
        finalStates: finalStates,
        stateTransition: instructions
       }
    }


    // Helper method to check if a token contains any forbidden special character
    private containsForbiddenChar(token: string): boolean {
    return this.SPECIAL_CHARS.some(char => token.includes(char));
    }
    public getAlphabet(): Set<string> { return this.Alphabet }
    public getCode(): String{ return this.Code }
    public getEpsilon():String{ return this.epsilon }

}

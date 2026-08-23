import CleaningService from "../services/CleaningService"
//-----------------------------------------------------------------
//
// here we can either write instructions as Si, xi, yi, Sj or Si, xi, Sj, yi we decide tomorrow
//
//------------------------------------------------------------------
export class LBAParser{
 private readonly DIRECTIVES_SEPARATOR = ":"
 private readonly COMMA = ","
private readonly SPECIAL_CHARS = [
    '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', 
    '+', '=', '{', '}', '[', ']', '|', '\\', ':', '"', 
    '\'', '<', '>', '?', '/', '`', '~'
]
 private alphabet: Set<string>
private epsilon: string
 public constructor(alphabet: string[], epsilon: string){
    this.alphabet = new Set(alphabet)
    this.epsilon = epsilon
 }

 public parseInstructions(code: string){
    const cleanedCode = CleaningService(code)
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
    // HERE WE NEED TO SET THE DEFINITIONS AND TYPES BEFORE WE PROCEED
    const instructions: Map<string, Map<string,any>> = new Map()
    for(let i = 2; i < cleanedCode.length; ++i){
        // TODO: write parsing code here
    }
 }

    private containsForbiddenChar(token: string): boolean {
    
        return this.SPECIAL_CHARS.some(char => token.includes(char));
    }
}
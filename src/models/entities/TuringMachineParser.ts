import type { TMDefinition } from "../interfaces/TMDefinition"
import CleaningService from "../services/CleaningService"

export class TuringMachineParser{
    private readonly DIRECTIVES_SEPARATOR = ":"
    private readonly COMMA = ","
    
    private code: string
    private alphabet: Set<string>
    
    public constructor(alphabet: string[], code: string){
        this.alphabet = new Set(alphabet)
        this.code = code
    }

    public parseInstructions(): TMDefinition | null {
        const cleanedCode = CleaningService(this.code)
        // NOW WE NEED TO PARSE THE CODE

        
        if(cleanedCode.length === 0)
            return null
        
        // TO VERIFY
        let lineTokens: string[] = cleanedCode[0].split(this.DIRECTIVES_SEPARATOR)
       
        const finalStates: Set<string> = new Set();
        let initial: string = lineTokens[0]

        // TODO: Sanity check of the initial state!
        for(let i = 0; i < cleanedCode.length; i++){
            lineTokens = cleanedCode[i].split(this.COMMA)
            if(lineTokens.length !== 4){
                // TODO: throw an error, incompatible instruction format
                return null
            }
            // TODO: parse and generate the instructions in the specified Format

        }

        return null
    }

    public getAlphabet(): Set<string>{ return this.alphabet }
}
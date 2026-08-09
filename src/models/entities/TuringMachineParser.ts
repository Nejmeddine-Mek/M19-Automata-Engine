import type { TMDefinition } from "../interfaces/TMDefinition"
import CleaningService from "../services/CleaningService"

export class TuringMachineParser{

    private readonly DIRECTIVES_SEPARATOR = ":"
    private code: string
    private alphabet: Set<string>
    
    public constructor(alphabet: string[], code: string){
        this.alphabet = new Set(alphabet)
        this.code = code
    }

    public parseInstructions(): TMDefinition | null {
        const cleanedCode = CleaningService(this.code)
        // NOW WE NEED TO PARSE THE CODE
        let lineTokens: string[] = cleanedCode[0].split(this.DIRECTIVES_SEPARATOR)
        


        return null
    }

    public getAlphabet(): Set<string>{ return this.alphabet }
}
import type { ActionTransition, TMDefinition } from "../interfaces/TMDefinition"
import CleaningService from "../services/CleaningService"
import { containsForbiddenChar } from "../services/ForbiddenCharactersCheck"

export class TuringMachineParser{
    private readonly DIRECTIVES_SEPARATOR = ":"
    private readonly COMMA = ","
    
    private code: string
    private rightSymbol: string
    private leftSymbol: string
    private blankSymbol: string
    private alphabet: Set<string>
    /*
    **
    NOTE: ONE MUST PASS ONLY ALPHABET IN THE CTOR, THE CTOR ADDS RIGHT SYMBOL AND LEFT SYMBOL TO THE ALPHABET BY ITSELF
        - IT ISN'T A MAJOR ISSUE, AS THE SET REMOVES DUPLICATES ANYWAY
    **
    */
    public constructor(alphabet: string[], code: string, rightSymbol: string, leftSymbol: string, blankSymbol: string){
        this.alphabet = new Set([...alphabet, rightSymbol, leftSymbol, blankSymbol])
        this.code = code
        this.rightSymbol = rightSymbol
        this.leftSymbol = leftSymbol
        this.blankSymbol = blankSymbol
    }

    public parseInstructions(): TMDefinition | null {
        const cleanedCode = CleaningService(this.code)
        // NOW WE NEED TO PARSE THE CODE

        
        if(cleanedCode.length === 0)
            return null
        
        const finalStates: Set<string> = new Set();
        let initialState: string
        // let's enforce the INITIAL, FINAL FORMAT HERE TOO
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
        if(containsForbiddenChar(lineTokens[1].trim())){
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
        // TODO: Sanity check of the initial state!
        const instructions = new Map()
        for(let i = 2; i < cleanedCode.length; ++i){
            console.log(lineTokens)
            lineTokens = cleanedCode[i].split(this.COMMA)
            if(lineTokens.length !== 4){
                // TODO: throw an error, incompatible instruction format
                console.log("not compliant in length")
                return null
            }
            let stateInnerMap: Map<string, ActionTransition> /*we use any for now */ = instructions.get(lineTokens[0]) || new Map()
            if(!this.alphabet.has(lineTokens[1].trim())){
                // TODO: throw an error, symbol does not belong to alphabet
                console.log("letter not in alphabet", lineTokens[1])
                return null
            }
            
            let currentAction: ActionTransition = stateInnerMap.get(lineTokens[1].trim()) || {action: [], nextStates: []}
            if(!this.alphabet.has(lineTokens[2].trim()) /* || moveSymbols.has(lineTokens[2]) */){
                //TODO: unrecognized symbol, error
                console.log(lineTokens[2] ," not recognized")
                return null
            }
            // fill the actions object
            currentAction.action.push(lineTokens[2].trim())
            currentAction.nextStates.push(lineTokens[3].trim())
            console.log(currentAction)
            // fill the state map
            stateInnerMap.set(lineTokens[1].trim(),currentAction)
            // add the states map to the instructions map
            instructions.set(lineTokens[0].trim(),stateInnerMap)


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

    public getAlphabet(): Set<string>{ return this.alphabet }
}
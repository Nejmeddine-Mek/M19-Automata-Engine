import type { ActionTransition, TMDefinition } from "../interfaces/TMDefinition"
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
        let lineTokens: string[] = cleanedCode[0].split(this.COMMA)
       
        const finalStates: Set<string> = new Set();
        let initial: string = lineTokens[0]

        // TODO: Sanity check of the initial state!
        const instructions = new Map()
        for(let i = 0; i < cleanedCode.length; i++){
            lineTokens = cleanedCode[i].split(this.COMMA)
            if(lineTokens.length !== 4){
                // TODO: throw an error, incompatible instruction format
                console.log("not compliant in length")
                return null
            }
            let stateInnerMap: Map<string, ActionTransition> /*we use any for now */ = instructions.get(lineTokens[0]) || new Map()
            if(!this.alphabet.has(lineTokens[1])){
                // TODO: throw an error, symbol does not belong to alphabet
                console.log("letter not in alphabet")
                return null
            }
            
            let currentAction: ActionTransition = stateInnerMap.get(lineTokens[1]) || {action: [], nextStates: []}
            if(!this.alphabet.has(lineTokens[2]) /* || moveSymbols.has(lineTokens[2]) */){
                //TODO: unrecognized symbol, error
                console.log(lineTokens[2] ," not recognised")
                return null
            }
            // fill the actions object
            currentAction.action.push(lineTokens[2])
            currentAction.nextStates.push(lineTokens[3])
            // fill the state map
            stateInnerMap.set(lineTokens[1],currentAction)
            // add the states map to the instructions map
            instructions.set(lineTokens[0],stateInnerMap)


        }

        return {
            initial: initial,
            final: finalStates,
            stateTransitions: instructions
        }
    }

    public getAlphabet(): Set<string>{ return this.alphabet }
}
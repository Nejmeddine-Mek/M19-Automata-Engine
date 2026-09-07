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

 public parseInstructions(code: string): LBADefinition | null{
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
    if(containsForbiddenChar(lineTokens[1].trim())){
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
    const instructions= new Map()
    for(let i = 2; i < cleanedCode.length; ++i){
        // TODO: write parsing code here
        lineTokens = cleanedCode[i].split(this.COMMA)
        if(lineTokens.length !== 4){
            // TODO: inst format not respected err
            console.log("format mismatch")
            return null
        }
        let stateInnerMap: Map<string, ActionTransition>  = instructions.get(lineTokens[0]) || new Map<string, ActionTransition>()
        if(!this.alphabet.has(lineTokens[1].trim())){
            // TODO: throw an error, symbol does not belong to alphabet
            console.log("letter not in alphabet")
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
        // fill the state map
        stateInnerMap.set(lineTokens[1].trim(),currentAction)
        // add the states map to the instructions map
        instructions.set(lineTokens[0].trim(),stateInnerMap)
            
    }
    console.log(initialState, finalStates, instructions);
    return{
        initial: initialState,
        finalStates: finalStates,
        beginningSymbol: this.beginningSymbol,
        endSymbol: this.endSymbol,
        rightSymbol: this.rightSymbol,
        leftSymbol: this.leftSymbol,
        stateTransition: instructions
        
    }
 }

}
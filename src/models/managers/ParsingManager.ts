import { FSAParser } from "../entities/FSAParser";


export class ParsingManager{
    private automatonType: String;
    
    public constructor(automatonType: String){
        this.automatonType = automatonType
    }
    public test(){
        const code = "INITIAL: q0\nFINAL: q1\nq0, a, q0\nq0,b,q1;this here is a final state";
        const parser = new FSAParser(['a','b'],code,'_')
        parser.parseInstructions()
    }
    public getAutomatonType(): String { return this.automatonType }
}
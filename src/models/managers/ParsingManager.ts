import { FSAParser } from "../entities/FSAParser";


export class ParsingManager{
    private automatonType: String;
    
    public constructor(automatonType: String){
        this.automatonType = automatonType
    }

    public getAutomatonType(): String { return this.automatonType }
}


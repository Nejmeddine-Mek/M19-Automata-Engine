
export class FSAParser{
    
    private Alphabet: String[]
    private Code: String
    private epsilon: String

    public constructor(alphabet: String[], code: String, epsilon: String){
        this.Alphabet = alphabet
        this.Code = code
        this.epsilon = epsilon
    }   

    // TODO: this is set to void for now, this should return the parsed object which the engine should be using when reading the tape
    public parseInstructions(): void{
        
    }

    public getAlphabet(): String[]{ return this.Alphabet }
    public getCode(): String{ return this.Code }
    public getEpsilon():String{ return this.epsilon }

}

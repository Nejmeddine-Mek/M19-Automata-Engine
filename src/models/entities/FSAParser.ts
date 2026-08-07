
export class FSAParser{
    public readonly COMMENTS_SEPARATOR = ";"
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
        const cleanedCode = this.cleanCode()
        if(cleanedCode.length === 0)
                return
        
    }

    // THIS cleans the code, removes comments and empty lines from our code, keeping only instructions
    private cleanCode(): String[] {
        if(this.Code === "")
            return []
        
        // FIRST: SPLIT THE CODE INTO LINES
        const lines = this.Code.split("\n").filter( line => line.length !== 0)

        const cleanedCode: String[] = []
        // SECOND REMOVE COMMENTS AND RETURN THE FIRST ELEMENT WHICH SHOULD BE THE INSTRUCTIONSs
        for(const line of lines){
            const commentsSeparated = line.split(this.COMMENTS_SEPARATOR)
            cleanedCode.push(commentsSeparated[0])
        }

        return cleanedCode
    }





    public getAlphabet(): String[]{ return this.Alphabet }
    public getCode(): String{ return this.Code }
    public getEpsilon():String{ return this.epsilon }

}

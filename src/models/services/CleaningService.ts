
// THIS cleans the code, removes comments and empty lines from our code, keeping only instructions as String[]

function CleaningService(code: String): String[]{
    const COMMENTS_SEPARATOR = ";"
    if (!code || code.trim() === "") {
            return [];
        }

        const lines = code.split("\n");
        const cleanedCode: string[] = [];

        for (const line of lines) {
            // Strip comments from the line
            const instruction = line.split(COMMENTS_SEPARATOR)[0].trim();

            // Only keep lines that have actual code content
            if (instruction.length > 0) {
                cleanedCode.push(instruction);
            }
        }
        return cleanedCode

}

export default CleaningService
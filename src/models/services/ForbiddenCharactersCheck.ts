
export function containsForbiddenChar(token: string): boolean {
    const SPECIAL_CHARS = [
    '!', '@', '#', '%', '^', '&', '*', '(', ')', 
    '+', '=', '{', '}', '[', ']', '\\', ':', '"', 
    '\'', '?', '/', '`', '~'
    ]
    return SPECIAL_CHARS.some(char => token.includes(char))  
}
export class ExecutionController{
    private stepsCount = 0
    private readonly MAX_STEPS = 1_000_000

    public constructor(){

    }
    canExecute(): boolean {
        return this.stepsCount < this.MAX_STEPS;
    }

    stepExecuted(): void {
        this.stepsCount++;
    }

    reset(): void {
        this.stepsCount = 0;
    }
    
}
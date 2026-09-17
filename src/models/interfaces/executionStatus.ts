export interface ExecutionStatus {
    isExecuting: boolean;
    isHalted: boolean;
    isAccepted: boolean;
    isRejected: boolean;
    stepCount: number;
    errorMessage?: string | null;
}
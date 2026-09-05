export class InstanceManager{

    public static assignId(): string{
        return `thread-${crypto.randomUUID()}`;
    }
}
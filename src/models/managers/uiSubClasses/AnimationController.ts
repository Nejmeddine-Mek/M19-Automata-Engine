export class AnimationController{
    private animationDelay: number
    private isPaused: boolean
    public constructor(delay: number){
        this.animationDelay = delay
        this.isPaused = false
    }
  public setAnimationDelay(newSpeed: number) {
    this.animationDelay = newSpeed;
  }

  public getAnimationDelay(): number {
    return this.animationDelay;
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public isRunning(): boolean {
    return !this.isPaused;
  }

  // Utility: wait for the current speed before next step
  public async delay(): Promise<void> {
    if (this.isPaused) return;
    return new Promise(resolve => setTimeout(resolve, this.animationDelay));
  }
}
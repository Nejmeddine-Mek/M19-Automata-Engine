import type { ActiveTape } from "../interfaces/activeTapeConfigs"
import  { AnimationController } from "./uiSubClasses/AnimationController"
import  { HistoryManager } from "./uiSubClasses/HistoryManager"
import  { TapeRegistry } from "./uiSubClasses/TapeRegistry"
import  { TapeRenderer } from "./uiSubClasses/TapeRenderer"

export class UIManager{
  public registry: TapeRegistry;
  public renderer: TapeRenderer;
  public controller: AnimationController;
  public history: HistoryManager;

  constructor(setActiveTapes: React.Dispatch<React.SetStateAction<ActiveTape[]>>, animationSpeed: number) {
    this.history = new HistoryManager();
    this.registry = new TapeRegistry();
    this.controller = new AnimationController(animationSpeed);
    this.renderer = new TapeRenderer(setActiveTapes, this.history);
  }
}
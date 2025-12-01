import {
  ScreenController,
  type View,
  type ScreenSwitcher,
} from "../../types.ts";
import { GameOverView } from "./game-over-view.ts";

export class GameOverController extends ScreenController {
  private readonly view: GameOverView;
  private screenSwitcher?: ScreenSwitcher;

  constructor() {
    super();
    this.view = new GameOverView();
  }

  getView(): View {
    return this.view;
  }

  /**
   * Set the screen switcher for navigation
   */
  public setScreenSwitcher(switcher: ScreenSwitcher): void {
    this.screenSwitcher = switcher;
  }

  /**
   * Show game over screen with final round
   */
  public showGameOver(finalRound: number): void {
    this.view.setTitle("GAME OVER");
    this.view.setFinalRound(finalRound);

    this.view.setButtonHandlers(
      () => {
        this.onPlayAgain();
      },
      () => {
        this.onReturnHome();
      },
    );

    this.show();
  }

  /**
   * Show game win screen with final round
   */
  public showGameWin(finalRound: number): void {
    this.view.setTitle("YOU WIN!");
    this.view.setFinalRound(finalRound);

    this.view.setButtonHandlers(
      () => {
        this.onPlayAgain();
      },
      () => {
        this.onReturnHome();
      },
    );

    this.show();
  }

  private onPlayAgain(): void {
    this.hide();
    this.screenSwitcher?.switchToScreen({ type: "game" });
  }

  private onReturnHome(): void {
    this.hide();
    this.screenSwitcher?.switchToScreen({ type: "menu" });
  }
}

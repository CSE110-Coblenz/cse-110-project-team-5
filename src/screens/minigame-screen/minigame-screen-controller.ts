import {
  type PotionManager,
  potionDefinitions,
  potionType,
} from "../../models/potion-manager.ts";
import { ScreenController, type ScreenSwitcher } from "../../types.ts";
import { MinigameScreenModel } from "./minigame-screen-model.ts";
import { MinigameScreenView } from "./minigame-screen-view.ts";

/**
 * MinigameScreenController - Bridges model and view for math potion minigame
 */
export class MinigameScreenController extends ScreenController {
  private readonly model: MinigameScreenModel;
  private readonly view: MinigameScreenView;
  private readonly switcher: ScreenSwitcher;
  private readonly potionManager: PotionManager;
  private feedbackTimer: number | undefined;

  constructor(switcher: ScreenSwitcher, potionManager: PotionManager) {
    super();
    this.switcher = switcher;
    this.potionManager = potionManager;
    this.model = new MinigameScreenModel();
    this.view = new MinigameScreenView();
    this.feedbackTimer = undefined;

    const state = this.model.getState();
    void this.view.updatePotions(state.potions);
    this.refreshViewState();
    this.view.setBackButtonHandler(() => {
      this.handleBackToMenu();
    });
  }

  getView(): MinigameScreenView {
    return this.view;
  }

  override show(): void {
    this.model.reset(); // Start fresh when showing
    this.refreshViewState();
    super.show();
  }

  override hide(): void {
    if (this.feedbackTimer !== undefined) {
      globalThis.clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }

    super.hide();
  }

  private handleAnswer(selectedIndex: number): void {
    if (this.feedbackTimer !== undefined) {
      globalThis.clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }

    this.view.setButtonsEnabled(false);
    const result = this.model.submitAnswer(selectedIndex);
    this.view.showAnswerFeedback(selectedIndex, result.correctIndex);
    this.view.updateScoreboard(result.score, result.questionNumber);
    this.view.showFeedback(
      result.isCorrect ? "Correct! +10" : "Not quite... -5",
      result.isCorrect ? "#2E7D32" : "#B23A2F",
    );

    this.feedbackTimer = globalThis.setTimeout(() => {
      const hasNext = this.model.advanceQuestion();
      if (hasNext) {
        this.refreshViewState();
        this.feedbackTimer = undefined;
      } else {
        this.finishMinigame();
      }
    }, 900);
  }

  private finishMinigame(): void {
    let message = "Game Over!";
    let color = "#000000";

    if (this.model.isWin()) {
      const types = [potionType.skipQuestion, potionType.heal];
      const randomType = types[Math.floor(Math.random() * types.length)];
      this.potionManager.addPotion(randomType);

      const potionName = potionDefinitions[randomType].name;
      message = `Success! Earned ${potionName}!`;
      color = "#2E7D32";
    } else {
      message = "Failed! Need 70% to win.";
      color = "#B23A2F";
    }

    this.view.showFeedback(message, color);

    // Delay before going back
    this.feedbackTimer = globalThis.setTimeout(() => {
      this.handleBackToMenu();
    }, 2000);
  }

  private refreshViewState(): void {
    const state = this.model.getState();
    this.view.updateQuestion(state.question);
    this.view.updateAnswers(state.answers, (index) => {
      this.handleAnswer(index);
    });
    this.view.updateScoreboard(state.score, state.questionNumber);
  }

  private handleBackToMenu(): void {
    if (this.feedbackTimer !== undefined) {
      globalThis.clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }

    this.model.reset();
    this.refreshViewState();
    this.switcher.switchToScreen({ type: "menu" });
  }
}

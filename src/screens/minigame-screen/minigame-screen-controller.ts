import {ScreenController, type ScreenSwitcher} from '../../types.ts';
import {MinigameScreenModel} from './minigame-screen-model.ts';
import {MinigameScreenView} from './minigame-screen-view.ts';

/**
 * MinigameScreenController - Bridges model and view for math potion minigame
 */
export class MinigameScreenController extends ScreenController {
	private readonly model: MinigameScreenModel;
	private readonly view: MinigameScreenView;
	private readonly switcher: ScreenSwitcher;
	private feedbackTimer: number | undefined;

	constructor(switcher: ScreenSwitcher) {
		super();
		this.switcher = switcher;
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
			result.isCorrect ? 'Correct! +10' : 'Not quite... -5',
			result.isCorrect ? '#2E7D32' : '#B23A2F',
		);

		this.feedbackTimer = globalThis.setTimeout(() => {
			this.model.advanceQuestion();
			this.refreshViewState();
			this.feedbackTimer = undefined;
		}, 900);
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
		this.switcher.switchToScreen({type: 'menu'});
	}
}

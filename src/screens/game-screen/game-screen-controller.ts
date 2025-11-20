import {
	answerInputBox,
	answerInputForm,
	questionColorDuration,
} from '../../constants.ts';
import {ScreenController} from '../../types.ts';
import {GameScreenModel} from './game-screen-model.ts';
import {GameScreenView} from './game-screen-view.ts';

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private model: GameScreenModel;
	private readonly view: GameScreenView;

	constructor() {
		super();

		this.model = new GameScreenModel();
		this.view = new GameScreenView();

		answerInputForm.addEventListener('submit', (event) => {
			event.preventDefault();

			if (answerInputBox.valueAsNumber === this.model.getAnswer()) {
				this.onAnswerSuccess();
			} else {
				this.onAnswerFail();
			}
		});
	}

	startGame(): void {
		this.model = new GameScreenModel();
		this.generateNewQuestion();
		this.view.setQuestionBoxColor('white', 0);
		this.view.show();

		const initialHealth = this.model.getHealth();

		this.view.updateHealth(initialHealth);

		// Maybe put loop here later for multiple monsters
		this.view.spawnMonster(() => {
			this.model.decreaseHealth(10);
			const currentHealth = this.model.getHealth();
			this.view.updateHealth(currentHealth);
		});
	}

	/**
	 * Get the view group
	 */
	getView(): GameScreenView {
		return this.view;
	}

	private generateNewQuestion(): void {
		const randomValue = Math.floor(Math.random() * 10);
		this.model.setQuestionAndAnswer(
			`the answer is ${randomValue}`,
			randomValue,
		);
		this.view.updateQuestionPrompt(this.model);
	}

	private onAnswerSuccess() {
		answerInputForm.reset();
		this.view.setQuestionBoxColor('green', questionColorDuration);
		this.generateNewQuestion();
	}

	private onAnswerFail(): void {
		answerInputForm.reset();
		this.view.setQuestionBoxColor('red', questionColorDuration);
		this.generateNewQuestion();
	}
}

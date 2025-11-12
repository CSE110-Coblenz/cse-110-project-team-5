import {answerInputBox, answerInputForm} from '../../constants.ts';
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
		this.view.show();
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
		console.log('correct');
		answerInputForm.reset();
		this.generateNewQuestion();
	}

	private onAnswerFail(): void {
		console.log('failed');
	}
}

import {ScreenController} from '../../types.ts';
import {GameScreenModel} from './game-screen-model.ts';
import {GameScreenView} from './game-screen-view.ts';

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private readonly model: GameScreenModel;
	private readonly view: GameScreenView;

	constructor() {
		super();

		this.model = new GameScreenModel();
		this.view = new GameScreenView();
	}

	startGame(): void {
		this.model.reset();
		this.view.show();
	}

	/**
	 * Get final score
	 */
	getFinalScore(): number {
		return this.model.getScore();
	}

	/**
	 * Get the view group
	 */
	getView(): GameScreenView {
		return this.view;
	}
}

import {ScreenController, type ScreenSwitcher} from '../../types.ts';
import {GameScreenModel} from './game-screen-model.ts';
import {GameScreenView} from './game-screen-view.ts';

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private readonly model: GameScreenModel;
	private readonly view: GameScreenView;
	private readonly screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.model = new GameScreenModel();
		this.view = new GameScreenView(() => {
			this.screenSwitcher.switchToScreen({type: 'game'});
		});
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

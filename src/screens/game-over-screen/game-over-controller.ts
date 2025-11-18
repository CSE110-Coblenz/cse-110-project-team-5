import {ScreenController} from '../../types.ts';
import type {View, ScreenSwitcher} from '../../types.ts';
import {GameOverView} from './game-over-view.ts';

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
		this.view.setFinalRound(finalRound);
		
		this.view.setButtonHandlers(
			() => this.onPlayAgain(),
			() => this.onReturnHome()
		);

		this.show();
	}

	private onPlayAgain(): void {
		this.hide();
		this.screenSwitcher?.switchToScreen({type: 'game'});
	}

	private onReturnHome(): void {
		this.hide();
		this.screenSwitcher?.switchToScreen({type: 'menu'});
	}
}
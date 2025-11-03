import {ScreenController, type ScreenSwitcher} from '../../types.ts';
import {MenuScreenView} from './menu-screen-view.ts';

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private readonly view: MenuScreenView;
	private readonly screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new MenuScreenView({
			onPlay: () => {
				this.handleStartClick();
			},
			// TODO: replace these with switching to minigame/help once implemented
			onMiniGame: () => {
				this.handleStartClick();
			},
			onHelp: () => {
				this.handleStartClick();
			},
		});
	}

	getView(): MenuScreenView {
		return this.view;
	}

	/**
	 * Handle start button click
	 */
	private handleStartClick(): void {
		this.screenSwitcher.switchToScreen({type: 'game'});
	}
}

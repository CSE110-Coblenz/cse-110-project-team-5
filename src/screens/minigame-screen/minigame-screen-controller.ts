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

	constructor(switcher: ScreenSwitcher) {
		super();
		this.switcher = switcher;
		this.model = new MinigameScreenModel();
		this.view = new MinigameScreenView();

		const state = this.model.getState();
		this.view.updateQuestion(state.question);
		void this.view.updatePotions(state.potions);
		this.view.updateAnswers(state.answers, () => {
			// For now, just go back to menu on any click; can add feedback later
			this.switcher.switchToScreen({type: 'menu'});
		});
	}

	getView(): MinigameScreenView {
		return this.view;
	}
}

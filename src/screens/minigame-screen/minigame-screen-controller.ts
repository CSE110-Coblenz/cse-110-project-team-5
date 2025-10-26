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

		const answers = this.model.getOptions().map((opt, idx) => ({
			label: opt.label,
			onClick: () => {
				// For now, just go back to menu on any click; can add feedback later
				this.switcher.switchToScreen({type: 'menu'});
			},
			bg: ['#6f8c1a', '#e39a3a', '#cfa6cf', '#b5c3d3'][idx % 4],
		}));

		this.view = new MinigameScreenView({
			questionPrefix: this.model.getQuestionPrefix(),
			highlighted: this.model.getHighlightedExpression(),
			questionSuffix: this.model.getQuestionSuffix(),
			answers,
		});
	}

	getView(): MinigameScreenView {
		return this.view;
	}
}



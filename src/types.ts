import type {Group} from 'konva/lib/Group';

export type View = {
	getGroup(): Group;
	show(): void;
	hide(): void;
};

export type Screen =
	| {type: 'menu'}
	| {type: 'game'}
	| {type: 'minigame'}
	| {type: 'help'};

export abstract class ScreenController {
	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}

	abstract getView(): View;
}

export type ScreenSwitcher = {
	switchToScreen(screen: Screen): void;
};

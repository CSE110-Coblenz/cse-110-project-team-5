/**
 * MinigameScreenModel - Holds question and options for the math minigame
 */
export type MinigameOption = {label: string; isCorrect: boolean};

export type MinigameViewState = {
	question: {prefix: string; highlighted: string; suffix: string};
	answers: Array<{label: string}>;
	potions: Array<{url: string}>; // Expected length: 3
};

export class MinigameScreenModel {
	private questionPrefix: string;
	private questionHighlighted: string;
	private questionSuffix: string;
	private options: MinigameOption[];
	private potions: Array<{url: string}>;

	constructor() {
		this.questionPrefix = 'Simplify ';
		this.questionHighlighted = '3(x+2)';
		this.questionSuffix = ' to its full expression:';
		this.options = [
			{label: '3x + 6', isCorrect: true},
			{label: '3x + 2', isCorrect: false},
			{label: '6x + 3', isCorrect: false},
			{label: '6x + 2', isCorrect: false},
		];
		this.potions = [
			{url: '/minigame_images/red_potion.png'},
			{url: '/minigame_images/green_potion.png'},
			{url: '/minigame_images/blue_potion.png'},
		];
	}

	getState(): MinigameViewState {
		return {
			question: {
				prefix: this.questionPrefix,
				highlighted: this.questionHighlighted,
				suffix: this.questionSuffix,
			},
			answers: this.options.map((o) => ({label: o.label})),
			potions: this.potions,
		};
	}

	getOptions(): MinigameOption[] {
		return this.options;
	}

	setQuestion(prefix: string, highlighted: string, suffix: string): void {
		this.questionPrefix = prefix;
		this.questionHighlighted = highlighted;
		this.questionSuffix = suffix;
	}

	setOptions(options: MinigameOption[]): void {
		this.options = options;
	}

	setPotions(potions: Array<{url: string}>): void {
		this.potions = potions;
	}

	reset(): void {
		this.setQuestion('Simplify ', '3(x+2)', ' to its full expression:');
		this.setOptions([
			{label: '3x + 6', isCorrect: true},
			{label: '3x + 2', isCorrect: false},
			{label: '6x + 3', isCorrect: false},
			{label: '6x + 2', isCorrect: false},
		]);
		this.setPotions([
			{url: '/minigame_images/red_potion.png'},
			{url: '/minigame_images/green_potion.png'},
			{url: '/minigame_images/blue_potion.png'},
		]);
	}
}

/**
 * MinigameScreenModel - Holds question and options for the math minigame
 */
export type MinigameOption = {
	label: string;
	isCorrect: boolean;
};

export class MinigameScreenModel {
	private readonly question: string;
	private readonly highlighted: string;
	private readonly options: MinigameOption[];

	constructor() {
		// Static seed content for the first iteration, can be expanded later.
		this.question = 'Simplify';
		this.highlighted = '3(x+2)';
		this.options = [
			{label: '3x + 6', isCorrect: true},
			{label: '3x + 2', isCorrect: false},
			{label: '6x + 3', isCorrect: false},
			{label: '6x + 2', isCorrect: false},
		];
	}

	getQuestionPrefix(): string {
		return `${this.question} `;
	}

	getHighlightedExpression(): string {
		return this.highlighted;
	}

	getQuestionSuffix(): string {
		return ' to its full expression:';
	}

	getOptions(): MinigameOption[] {
		return this.options;
	}
}



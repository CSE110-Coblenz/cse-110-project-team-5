/**
 * MinigameScreenModel - Holds question and options for the math minigame
 */
export type MinigameOption = {label: string; isCorrect: boolean};

export type MinigameViewState = {
	question: {prefix: string; highlighted: string; suffix: string};
	answers: Array<{label: string}>;
	potions: Array<{url: string}>; // Expected length: 3
	score: number;
	questionNumber: number;
};

export type MinigameAnswerResult = {
	isCorrect: boolean;
	correctIndex: number;
	score: number;
	questionNumber: number;
};

export class MinigameScreenModel {
	private readonly questionPrefix: string;
	private questionHighlighted: string;
	private readonly questionSuffix: string;
	private options: MinigameOption[];
	private readonly potions: Array<{url: string}>;
	private score: number;
	private questionNumber: number;
	private readonly rng: () => number;

	constructor(rng: () => number = Math.random) {
		this.rng = rng;
		this.questionPrefix = 'Expand ';
		this.questionHighlighted = '';
		this.questionSuffix = ' to its full expression:';
		this.options = [];
		this.potions = [
			{url: '/minigame_images/red_potion.png'},
			{url: '/minigame_images/green_potion.png'},
			{url: '/minigame_images/blue_potion.png'},
		];
		this.score = 0;
		this.questionNumber = 1;
		this.generateNewQuestion();
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
			score: this.score,
			questionNumber: this.questionNumber,
		};
	}

	submitAnswer(index: number): MinigameAnswerResult {
		const option = this.options[index];
		const correctIndex = this.options.findIndex((o) => o.isCorrect);
		const isCorrect = Boolean(option?.isCorrect);

		if (isCorrect) {
			this.score += 10;
		} else {
			this.score = Math.max(0, this.score - 5);
		}

		return {
			isCorrect,
			correctIndex,
			score: this.score,
			questionNumber: this.questionNumber,
		};
	}

	advanceQuestion(): void {
		this.questionNumber += 1;
		this.generateNewQuestion();
	}

	reset(): void {
		this.score = 0;
		this.questionNumber = 1;
		this.generateNewQuestion();
	}

	private generateNewQuestion(): void {
		const multiplier = this.randomInt(2, 9);
		const constant = this.randomNonZeroInt(-9, 9);

		this.questionHighlighted = `${multiplier}(x ${constant > 0 ? '+ ' : '- '}${Math.abs(
			constant,
		)})`;

		const correctLabel = this.formatLinearExpression(
			multiplier,
			multiplier * constant,
		);
		const distractors = this.generateDistractors(
			multiplier,
			constant,
			correctLabel,
		);

		const options: MinigameOption[] = [
			{label: correctLabel, isCorrect: true},
			...distractors.map((label) => ({label, isCorrect: false})),
		];

		this.options = this.shuffle(options);
	}

	private generateDistractors(
		multiplier: number,
		constant: number,
		correct: string,
	): string[] {
		const distractors: string[] = [];
		const candidateExpressions = [
			this.formatLinearExpression(multiplier, constant),
			this.formatLinearExpression(multiplier + 1, multiplier * constant),
			this.formatLinearExpression(
				Math.max(multiplier - 1, 2),
				multiplier * constant,
			),
			this.formatLinearExpression(multiplier, multiplier * (constant + 1)),
			this.formatLinearExpression(multiplier * constant, multiplier + constant),
			this.formatLinearExpression(multiplier, multiplier - constant),
		];

		for (const expression of candidateExpressions) {
			if (expression !== correct && !distractors.includes(expression)) {
				distractors.push(expression);
			}

			if (distractors.length >= 3) {
				break;
			}
		}

		while (distractors.length < 3) {
			const randomExpression = this.formatLinearExpression(
				this.randomInt(2, 9),
				this.randomInt(-15, 15),
			);
			if (
				randomExpression !== correct &&
				!distractors.includes(randomExpression)
			) {
				distractors.push(randomExpression);
			}
		}

		return distractors.slice(0, 3);
	}

	private formatLinearExpression(
		xCoefficient: number,
		constant: number,
	): string {
		const xPart = `${xCoefficient}x`;
		if (constant === 0) {
			return xPart;
		}

		const sign = constant > 0 ? ' + ' : ' - ';
		return `${xPart}${sign}${Math.abs(constant)}`;
	}

	private randomInt(min: number, max: number): number {
		const clampedMin = Math.ceil(min);
		const clampedMax = Math.floor(max);
		return Math.floor(this.rng() * (clampedMax - clampedMin + 1)) + clampedMin;
	}

	private randomNonZeroInt(min: number, max: number): number {
		let value = 0;
		while (value === 0) {
			value = this.randomInt(min, max);
		}

		return value;
	}

	private shuffle<T>(items: T[]): T[] {
		const array = [...items];
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(this.rng() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}

		return array;
	}
}

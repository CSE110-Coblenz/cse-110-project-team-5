/**
 * GameScreenModel - Manages game state
 */
export class GameScreenModel {
	private score = 0;
	private health = 100;

	/**
	 * Reset game state for a new game
	 */
	reset(): void {
		this.score = 0;
		this.health = 100;
	private currentQuestion = "YOU SHOULDN'T SEE THIS";
	private currentAnswer = -999;

	public setQuestionAndAnswer(question: string, answer: number): void {
		this.currentQuestion = question;
		this.currentAnswer = answer;
	}

	public getQuestion(): string {
		return this.currentQuestion;
	}

	public getAnswer(): number {
		return this.currentAnswer;
	}

	/**
	 * Get current health
	 */
	getHealth(): number {
		return this.health;
	}

	/**
	 * Decrease health when monster reaches the end
	 */
	decreaseHealth(amount: number): void {
		this.health -= amount;
		if (this.health < 0) {
			this.health = 0;
		}
	}
}

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
	}

	/**
	 * Increment score when lemon is clicked
	 */
	incrementScore(): void {
		this.score++;
	}

	/**
	 * Get current score
	 */
	getScore(): number {
		return this.score;
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

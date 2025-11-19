import { Monster } from "./models/monster.ts";
import { MonsterManager } from "./models/monster-manager.ts";

/**
 * GameScreenModel - Manages game state
 */
export class GameScreenModel {
	private health = 100;
	private currentQuestion = "YOU SHOULDN'T SEE THIS";
	private currentAnswer = -999;
	private round = 1;
	private monsterManager: MonsterManager;
	private monstersPerRound = 5; // set the number of monsters per round

	constructor() {
		this.monsterManager = new MonsterManager(this.monstersPerRound);
	}

	/**
	 * Get monster manager (so controller can access monsters)
	 */
	getMonsterManager(): MonsterManager {
		return this.monsterManager;
	}

	/**
	 * Reset game state for a new game
	 */
	reset(): void {
		this.health = 100;
		this.round = 1;
		this.monsterManager.reset();
	}

	/**
	 * Start a new round - spawn monsters
	 */
	startRound(): void {
		this.monsterManager.spawnMonsters();
	}

	/**
	 * Check if current round is complete
	 */
	isRoundComplete(): boolean {
		return this.monsterManager.isRoundComplete();
	}

	/**
	 * Advance to next round
	 */
	nextRound(): void {
		this.round++;
	}

	/**
	 * Get current round number
	 */
	getRound(): number {
		return this.round;
	}

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

	/**
	 * Check if game is over
	 */
	isGameOver(): boolean {
		return this.health <= 0;
	}

	/* ******************* MONSTER MODEL LOGIC ******************* */

	/**
	 * Eliminate first alive monster (when answer is correct)
	 * Returns the eliminated monster's ID, or null if none
	 */
	eliminateFirstMonster(): number | null {
		const monster = this.monsterManager.eliminateFirstAliveMonster();
		return monster ? monster.id : null;
	}

	/**
	 * Handle monster reaching the end
	 */
	handleMonsterReachedEnd(monsterId: number): void {
		this.monsterManager.removeMonster(monsterId);
		this.decreaseHealth(10);
	}

	public getMonsterById(monsterId: number): Monster | null {
    	return this.monsterManager.getMonsterById(monsterId);
	}
}

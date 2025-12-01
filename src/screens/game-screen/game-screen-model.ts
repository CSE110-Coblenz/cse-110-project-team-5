import { type Monster } from "./models/monster.ts";
import { MonsterManager } from "./models/monster-manager.ts";

/**
 * GameScreenModel - Manages game state
 */
export class GameScreenModel {
  private health = 100;
  private round = 1;
  private readonly monsterManager: MonsterManager;

  constructor() {
    this.monsterManager = new MonsterManager(this.getMonstersPerRound());
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
    this.monsterManager.resetSpawnedTracking();
    this.monsterManager.spawnMonsters(this.round);
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
   * Increase health (e.g. potion)
   */
  increaseHealth(amount: number): void {
    this.health += amount;
    if (this.health > 100) {
      this.health = 100;
    }
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.health <= 0;
  }

  /* ******************* MONSTER MODEL LOGIC ******************* */
  // Mark monster as spawned (visible on screen)
  markMonsterAsSpawned(monsterId: number): void {
    this.monsterManager.markMonsterAsSpawned(monsterId);
  }

  // Get current active monster (first spawned & alive)
  getCurrentActiveMonster(): Monster | undefined {
    return this.monsterManager.getFirstSpawnedAliveMonster();
  }

  // Kills monster when question answered correctly
  eliminateMonster(monsterId: number): Monster | undefined {
    return this.monsterManager.eliminateMonsterById(monsterId);
  }

  /**
   * Handle monster reaching the end
   */
  handleMonsterReachedEnd(monsterId: number): void {
    this.monsterManager.removeMonster(monsterId);
    this.decreaseHealth(10);
  }

  public getMonsterById(monsterId: number): Monster | undefined {
    return this.monsterManager.getMonsterById(monsterId);
  }

  // Gets number of monsters per round
  private getMonstersPerRound(): number {
    return 5;
  }
}

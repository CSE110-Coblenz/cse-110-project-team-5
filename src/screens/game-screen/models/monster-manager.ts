// Monster manager, takes care of handling monster life cycle each round

import { Monster } from "./monster.ts";

export class MonsterManager {
  private currentMonsters: Monster[] = [];
  private readonly monstersPerRound: number;
  private readonly spawnedMonsterIds = new Set<number>();
  // Private readonly monstersPerRound: number;
  private nextMonsterId = 0;
  private aliveCount = 0;

  constructor(monstersPerRound: number) {
    this.monstersPerRound = monstersPerRound;
  }

  // Spawn monsters at the start of each round
  public spawnMonsters(round: number): void {
    this.currentMonsters = [];
    this.spawnedMonsterIds.clear();
    for (let i = 0; i < this.monstersPerRound; i++) {
      const monster = new Monster(this.nextMonsterId++, round);
      this.currentMonsters.push(monster);
    }

    this.aliveCount = this.monstersPerRound; // *** NEW ***
  }

  public markMonsterAsSpawned(monsterId: number): void {
    this.spawnedMonsterIds.add(monsterId);
  }

  public getFirstSpawnedAliveMonster(): Monster | undefined {
    return (
      this.currentMonsters.find(
        (m) => m.isAlive() && this.spawnedMonsterIds.has(m.id),
      ) ?? undefined
    );
  }

  // Eliminate monster by ID (called when player answers correctly)
  public eliminateMonsterById(monsterId: number): Monster | undefined {
    const index = this.currentMonsters.findIndex((m) => m.id === monsterId);
    if (index !== -1) {
      const monster = this.currentMonsters[index];
      if (monster.isAlive()) {
        monster.kill();
        this.currentMonsters.splice(index, 1);
        this.aliveCount--;
        this.spawnedMonsterIds.delete(monsterId);
        return monster;
      }
    }

    return undefined;
  }

  // Gives controller access to current monsters
  public getMonsters(): Monster[] {
    return this.currentMonsters;
  }

  // Returns number of alive monsters
  public getAliveMonstersCount(): number {
    return this.aliveCount;
  }

  // Removes monster when it reaches end of path
  public removeMonster(monsterId: number): Monster | undefined {
    const index = this.currentMonsters.findIndex((m) => m.id === monsterId);
    if (index !== -1) {
      const monster = this.currentMonsters[index];
      this.currentMonsters.splice(index, 1);
      if (monster.isAlive()) {
        this.aliveCount--;
      }

      this.spawnedMonsterIds.delete(monsterId);
      return monster;
    }

    return undefined;
  }

  // Retrieves monster by ID
  public getMonsterById(monsterId: number): Monster | undefined {
    return this.currentMonsters.find((m) => m.id === monsterId) ?? undefined;
  }

  // Checks if all monsters are eliminated or have reached end of path
  public isRoundComplete(): boolean {
    return this.currentMonsters.length === 0;
  }

  // Reset spawned tracking (called at start of new round)
  public resetSpawnedTracking(): void {
    this.spawnedMonsterIds.clear();
  }

  public reset(): void {
    this.currentMonsters = [];
    this.spawnedMonsterIds.clear();
    this.nextMonsterId = 0;
    this.aliveCount = 0;
  }
}

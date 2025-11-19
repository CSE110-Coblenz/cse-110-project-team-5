// Monster manager, takes care of handling monster life cycle each round

import { Monster } from "./monster";

export class MonsterManager {
    private currentMonsters: Monster[] = [];
    private spawnedMonsterIds: Set<number> = new Set();
    private monstersPerRound: number;
    private nextMonsterId: number = 0;
    private aliveCount: number = 0; 

    constructor(monstersPerRound: number) {
        this.monstersPerRound = monstersPerRound;
    }

    // spawn monsters at the start of each round
    public spawnMonsters(): void {
        this.currentMonsters = [];
        this.spawnedMonsterIds.clear();
        for (let i = 0; i < this.monstersPerRound; i++) {
            const monster = new Monster(this.nextMonsterId++);
            this.currentMonsters.push(monster);
        }
        this.aliveCount = this.monstersPerRound; // *** NEW ***
    }

    public markMonsterAsSpawned(monsterId: number): void {
        this.spawnedMonsterIds.add(monsterId);
    }

    public getFirstSpawnedAliveMonster(): Monster | null {
        return this.currentMonsters.find(
            m => m.isAlive() && this.spawnedMonsterIds.has(m.id)
        ) || null;
    }

    // eliminate monster by ID (called when player answers correctly)
    public eliminateMonsterById(monsterId: number): Monster | null {
        const index = this.currentMonsters.findIndex(m => m.id === monsterId);
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
        return null;
    }

    // gives controller access to current monsters
    public getMonsters(): Monster[] {
        return this.currentMonsters;
    }

    // returns number of alive monsters
    public getAliveMonstersCount(): number {
        return this.aliveCount; 
    }

    // removes monster when it reaches end of path 
    public removeMonster(monsterId: number): Monster | null {
        const index = this.currentMonsters.findIndex(m => m.id === monsterId);
        if (index !== -1) {
            const monster = this.currentMonsters[index];
            this.currentMonsters.splice(index, 1);
            if (monster.isAlive()) { 
                this.aliveCount--;
            }
            this.spawnedMonsterIds.delete(monsterId);
            return monster;
        }
        return null;
    }

    // retrieves monster by ID
    public getMonsterById(monsterId: number): Monster | null {
        return this.currentMonsters.find(m => m.id === monsterId) || null;
    }

    // checks if all monsters are eliminated or have reached end of path
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
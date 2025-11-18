// Monster manager, takes care of handling monster life cycle each round

import { Monster } from "./monster";

export class MonsterManager {
    private currentMonsters: Monster[] = [];
    private monstersPerRound: number;
    private nextMonsterId: number = 0;
    private aliveCount: number = 0; 

    constructor(monstersPerRound: number) {
        this.monstersPerRound = monstersPerRound;
    }

    // spawn monsters at the start of each round
    public spawnMonsters(): void {
        this.currentMonsters = [];
        for (let i = 0; i < this.monstersPerRound; i++) {
            const monster = new Monster(this.nextMonsterId++);
            this.currentMonsters.push(monster);
        }
        this.aliveCount = this.monstersPerRound; // *** NEW ***
    }

    // gives controller access to current monsters
    public getMonsters(): Monster[] {
        return this.currentMonsters;
    }

    // returns number of alive monsters
    public getAliveMonstersCount(): number {
        return this.aliveCount; 
    }

    // finds and returns first alive monster
    public getFirstAliveMonster(): Monster | null {
        return this.currentMonsters.find(m => m.isAlive()) || null;
    }

    // removes first alive monster from queue (FIFO), called when player answers correctly
    public eliminateFirstAliveMonster(): Monster | null {
        const index = this.currentMonsters.findIndex(m => m.isAlive());
        if (index !== -1) {
            const monster = this.currentMonsters[index];
            monster.kill();
            this.currentMonsters.splice(index, 1);
            this.aliveCount--; 
            return monster;
        }
        return null;
    }

    // removes monster by ID, called when monster reaches end of path (could potentially build on this in the future)
    public removeMonster(monsterId: number): Monster | null {
        const index = this.currentMonsters.findIndex(m => m.id === monsterId);
        if (index !== -1) {
            const monster = this.currentMonsters[index];
            this.currentMonsters.splice(index, 1);
            if (monster.isAlive()) { 
                this.aliveCount--;
            }
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

    public reset(): void {
        this.currentMonsters = [];
        this.nextMonsterId = 0;
        this.aliveCount = 0; 
    }
}
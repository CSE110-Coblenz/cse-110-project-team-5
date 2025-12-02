import {describe, it, expect, beforeEach} from 'vitest';
import {MonsterManager} from '../src/screens/game-screen/models/monster-manager.ts';

describe('MonsterManager', () => {
	let monsterManager: MonsterManager;
	const monstersPerRound = 10;

	beforeEach(() => {
		monsterManager = new MonsterManager(monstersPerRound);
	});

	describe('spawning monster logic per round', () => {
		it('spawns correct number of monsters per round', () => {
			monsterManager.spawnMonsters(1);
			expect(monsterManager.getMonsters()).toHaveLength(monstersPerRound);
			expect(monsterManager.getAliveMonstersCount()).toBe(monstersPerRound);
		});

		it('assign unique IDs to each spawned monster', () => {
			monsterManager.spawnMonsters(1);
			const monsters = monsterManager.getMonsters();
			const ids = monsters.map((m) => m.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(monstersPerRound);
		});
	});

	describe('eliminate monster logic', () => {
		it('eliminates a monster by ID', () => {
			monsterManager.spawnMonsters(1);
			const monsters = monsterManager.getMonsters();
			const monsterToEliminate = monsters[0];
			const eliminatedMonster = monsterManager.eliminateMonsterById(
				monsterToEliminate.id,
			);
			expect(eliminatedMonster).toBeDefined();
			expect(eliminatedMonster?.id).toBe(monsterToEliminate.id);
			expect(monsterManager.getMonsters()).toHaveLength(monstersPerRound - 1);
			expect(monsterManager.getAliveMonstersCount()).toBe(monstersPerRound - 1);
		});

		it('should clear monsters when new rounfd starts', () => {
			monsterManager.spawnMonsters(1);
			monsterManager.spawnMonsters(2);
			expect(monsterManager.getMonsters()).toHaveLength(monstersPerRound);
		});
	});
});

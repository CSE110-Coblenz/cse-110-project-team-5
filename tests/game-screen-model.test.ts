import {describe, it, expect, beforeEach, vi} from 'vitest';
import {GameScreenModel} from '../src/screens/game-screen/game-screen-model.ts';

// Mock MonsterManager
vi.mock('../src/screens/game-screen/models/monster-manager.ts', () => {
	return {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		MonsterManager: class MockMonsterManager {
			private monsters: Array<{id: number; spawned: boolean; alive: boolean}> =
				[];

			// eslint-disable-next-line @typescript-eslint/member-ordering
			reset = vi.fn(() => {
				this.monsters = [];
			});

			// eslint-disable-next-line @typescript-eslint/member-ordering
			resetSpawnedTracking = vi.fn();

			// eslint-disable-next-line @typescript-eslint/member-ordering
			spawnMonsters = vi.fn(() => {
				// Create 5 mock monsters for testing
				this.monsters = Array.from({length: 5}, (_, i) => ({
					id: i + 1,
					spawned: false,
					alive: true,
				}));
			});

			// eslint-disable-next-line @typescript-eslint/member-ordering
			isRoundComplete = vi.fn(() => {
				return this.monsters.every((m) => !m.alive || m.spawned);
			});

			// eslint-disable-next-line @typescript-eslint/member-ordering
			markMonsterAsSpawned = vi.fn((id: number) => {
				const monster = this.monsters.find((m) => m.id === id);
				if (monster) {
					monster.spawned = true;
				}
			});

			// eslint-disable-next-line @typescript-eslint/member-ordering
			getFirstSpawnedAliveMonster = vi.fn(() => {
				const monster = this.monsters.find((m) => m.spawned && m.alive);
				return monster
					? {
							id: monster.id,
							getQuestion: () => 'What is 2+2?',
							getAnswer: () => 4,
							getSpeed: () => 1,
						}
					: undefined;
			});

			// eslint-disable-next-line @typescript-eslint/member-ordering
			eliminateMonsterById = vi.fn((id: number) => {
				const monster = this.monsters.find((m) => m.id === id);
				if (monster?.alive) {
					monster.alive = false;
					return {
						id: monster.id,
						getQuestion: () => 'What is 2+2?',
						getAnswer: () => 4,
						getSpeed: () => 1,
					};
				}

				return undefined;
			});

			// eslint-disable-next-line @typescript-eslint/member-ordering
			removeMonster = vi.fn((id: number) => {
				const index = this.monsters.findIndex((m) => m.id === id);
				if (index !== -1) {
					this.monsters.splice(index, 1);
				}
			});

			// eslint-disable-next-line @typescript-eslint/member-ordering
			getMonsterById = vi.fn((id: number) => {
				const monster = this.monsters.find((m) => m.id === id);
				return monster
					? {
							id: monster.id,
							getQuestion: () => 'What is 2+2?',
							getAnswer: () => 4,
							getSpeed: () => 1,
						}
					: undefined;
			});

			// eslint-disable-next-line @typescript-eslint/member-ordering
			getMonsters = vi.fn(() => this.monsters);
		},
	};
});

describe('GameScreenModel', () => {
	let model: GameScreenModel;

	beforeEach(() => {
		vi.clearAllMocks();
		model = new GameScreenModel();
	});

	describe('constructor', () => {
		it('should initialize with default values', () => {
			expect(model.getHealth()).toBe(100);
			expect(model.getRound()).toBe(1);
			expect(model.getMonsterManager()).toBeDefined();
		});
	});

	describe('health management', () => {
		it('should decrease health by specified amount', () => {
			model.decreaseHealth(20);
			expect(model.getHealth()).toBe(80);
		});

		it('should not allow health to go below 0', () => {
			model.decreaseHealth(150);
			expect(model.getHealth()).toBe(0);
		});

		it('should increase health by specified amount', () => {
			model.decreaseHealth(30);
			model.increaseHealth(20);
			expect(model.getHealth()).toBe(90);
		});

		it('should not allow health to exceed 100', () => {
			model.increaseHealth(50);
			expect(model.getHealth()).toBe(100);
		});

		it('should report game over when health is 0', () => {
			expect(model.isGameOver()).toBe(false);
			model.decreaseHealth(100);
			expect(model.isGameOver()).toBe(true);
		});
	});

	describe('round management', () => {
		it('should start at round 1', () => {
			expect(model.getRound()).toBe(1);
		});

		it('should advance to next round', () => {
			model.nextRound();
			expect(model.getRound()).toBe(2);
		});

		it('should reset round to 1 on reset', () => {
			model.nextRound();
			model.nextRound();
			model.reset();
			expect(model.getRound()).toBe(1);
		});
	});

	describe('startRound', () => {
		it('should reset spawned tracking', () => {
			model.startRound();
			const manager = model.getMonsterManager();
			expect(manager.resetSpawnedTracking).toHaveBeenCalled();
		});

		it('should spawn monsters for current round', () => {
			model.startRound();
			const manager = model.getMonsterManager();
			expect(manager.spawnMonsters).toHaveBeenCalledWith(1);
		});
	});

	describe('round completion', () => {
		it('should check if round is complete', () => {
			model.startRound();
			const isComplete = model.isRoundComplete();
			expect(isComplete).toBeDefined();
		});
	});

	describe('monster management', () => {
		beforeEach(() => {
			model.startRound();
		});

		it('should mark monster as spawned', () => {
			model.markMonsterAsSpawned(1);
			const manager = model.getMonsterManager();
			expect(manager.markMonsterAsSpawned).toHaveBeenCalledWith(1);
		});

		it('should get current active monster', () => {
			model.markMonsterAsSpawned(1);
			const activeMonster = model.getCurrentActiveMonster();
			expect(activeMonster).toBeDefined();
		});

		it('should eliminate monster by id', () => {
			model.markMonsterAsSpawned(1);
			const eliminated = model.eliminateMonster(1);
			expect(eliminated).toBeDefined();
			expect(eliminated?.id).toBe(1);
		});

		it('should return undefined when eliminating non-existent monster', () => {
			const eliminated = model.eliminateMonster(999);
			expect(eliminated).toBeUndefined();
		});

		it('should handle monster reaching end', () => {
			const initialHealth = model.getHealth();
			model.handleMonsterReachedEnd(1);
			expect(model.getHealth()).toBe(initialHealth - 10);
		});

		it('should remove monster when it reaches end', () => {
			model.handleMonsterReachedEnd(1);
			const manager = model.getMonsterManager();
			expect(manager.removeMonster).toHaveBeenCalledWith(1);
		});

		it('should get monster by id', () => {
			const monster = model.getMonsterById(1);
			expect(monster).toBeDefined();
		});
	});

	describe('reset', () => {
		it('should reset health to 100', () => {
			model.decreaseHealth(50);
			model.reset();
			expect(model.getHealth()).toBe(100);
		});

		it('should reset round to 1', () => {
			model.nextRound();
			model.nextRound();
			model.reset();
			expect(model.getRound()).toBe(1);
		});

		it('should reset monster manager', () => {
			model.reset();
			const manager = model.getMonsterManager();
			expect(manager.reset).toHaveBeenCalled();
		});
	});

	describe('game over scenarios', () => {
		it('should not be game over with full health', () => {
			expect(model.isGameOver()).toBe(false);
		});

		it('should be game over when health reaches 0', () => {
			model.decreaseHealth(100);
			expect(model.isGameOver()).toBe(true);
		});

		it('should be game over after multiple monsters reach end', () => {
			for (let i = 0; i < 10; i++) {
				model.handleMonsterReachedEnd(i);
			}

			expect(model.isGameOver()).toBe(true);
		});
	});
});

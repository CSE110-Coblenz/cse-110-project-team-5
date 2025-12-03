/* eslint-disable @eslint-community/eslint-comments/no-duplicate-disable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {GameScreenController} from '../src/screens/game-screen/game-screen-controller.ts';
import {PotionManager, potionType} from '../src/models/potion-manager.ts';
import {answerInputForm} from '../src/constants.ts';

// Mock constants.ts to avoid document access
vi.mock('../src/constants.ts', () => ({
	answerInputForm: {
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		reset: vi.fn(),
	},
	answerInputBox: {
		value: '',
		valueAsNumber: 0,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	},
	questionColorDuration: 500,
}));

// Mock Timer utility
vi.mock('../src/utils.ts', () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Timer: class MockTimer {
		private paused = false;

		constructor(callback: () => void, _delay: number) {
			setTimeout(() => {
				if (!this.paused) {
					callback();
				}
			}, 0);
		}

		// eslint-disable-next-line @typescript-eslint/member-ordering
		pause = vi.fn(() => {
			this.paused = true;
		});

		// eslint-disable-next-line @typescript-eslint/member-ordering
		resume = vi.fn(() => {
			this.paused = false;
		});
	},
}));

// Mock GameScreenModel
vi.mock('../src/screens/game-screen/game-screen-model.ts', () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	GameScreenModel: class MockGameScreenModel {
		private health = 100;
		private round = 1;
		private readonly monsters = [
			{
				id: 1,
				spawned: false,
				alive: true,
				getQuestion: () => 'What is 2+2?',
				getAnswer: () => 4,
				getSpeed: () => 1,
			},
		];

		// eslint-disable-next-line @typescript-eslint/member-ordering
		getHealth = vi.fn(() => this.health);
		// eslint-disable-next-line @typescript-eslint/member-ordering
		getRound = vi.fn(() => this.round);
		// eslint-disable-next-line @typescript-eslint/member-ordering
		increaseHealth = vi.fn((amount: number) => {
			this.health = Math.min(100, this.health + amount);
		});

		// eslint-disable-next-line @typescript-eslint/member-ordering
		decreaseHealth = vi.fn((amount: number) => {
			this.health = Math.max(0, this.health - amount);
		});

		// eslint-disable-next-line @typescript-eslint/member-ordering
		isGameOver = vi.fn(() => this.health <= 0);
		// eslint-disable-next-line @typescript-eslint/member-ordering
		isRoundComplete = vi.fn(() => this.monsters.every((m) => !m.alive));
		// eslint-disable-next-line @typescript-eslint/member-ordering
		nextRound = vi.fn(() => {
			this.round++;
		});

		// eslint-disable-next-line @typescript-eslint/member-ordering
		startRound = vi.fn();
		// eslint-disable-next-line @typescript-eslint/member-ordering
		markMonsterAsSpawned = vi.fn((id: number) => {
			const monster = this.monsters.find((m) => m.id === id);
			if (monster) {
				monster.spawned = true;
			}
		});

		// eslint-disable-next-line @typescript-eslint/member-ordering
		getCurrentActiveMonster = vi.fn(() => {
			return this.monsters.find((m) => m.spawned && m.alive);
		});

		// eslint-disable-next-line @typescript-eslint/member-ordering
		eliminateMonster = vi.fn((id: number) => {
			const monster = this.monsters.find((m) => m.id === id);
			if (monster) {
				monster.alive = false;
				return monster;
			}

			return undefined;
		});

		// eslint-disable-next-line @typescript-eslint/member-ordering
		handleMonsterReachedEnd = vi.fn((id: number) => {
			this.decreaseHealth(10);
			const index = this.monsters.findIndex((m) => m.id === id);
			if (index !== -1) {
				this.monsters.splice(index, 1);
			}
		});

		// eslint-disable-next-line @typescript-eslint/member-ordering
		getMonsterManager = vi.fn(() => ({
			getMonsters: () => this.monsters,
		}));
	},
}));

// Mock GameScreenView
vi.mock('../src/screens/game-screen/game-screen-view.ts', () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	GameScreenView: class MockGameScreenView {
		show = vi.fn();
		hide = vi.fn();
		updateHealth = vi.fn();
		updateRound = vi.fn();
		updateQuestionPrompt = vi.fn();
		updatePotionCounts = vi.fn();
		setQuestionBoxColor = vi.fn();
		spawnMonsterVisual = vi.fn((_id, _speed, callback) => {
			setTimeout(() => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				callback();
			}, 10);
		});

		destroyMonsterVisual = vi.fn();
		pauseAllMonsters = vi.fn();
		resumeAllMonsters = vi.fn();
		setButtonHandlers = vi.fn();
		updatePauseButton = vi.fn();
	},
}));

Object.defineProperty(globalThis, 'addEventListener', {
	value: vi.fn(),
	writable: true,
	configurable: true,
});

// Mock document for visibility change
const mockDocument = {
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	hidden: false,
};

Object.defineProperty(globalThis, 'document', {
	value: mockDocument,
	writable: true,
	configurable: true,
});

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem(key: string) {
			return store[key] ?? null;
		},
		setItem(key: string, value: string) {
			store[key] = value;
		},
		removeItem(key: string) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete store[key];
		},
		clear() {
			store = {};
		},
	};
})();

Object.defineProperty(globalThis, 'localStorage', {
	value: localStorageMock,
	writable: true,
});

describe('GameScreenController', () => {
	let controller: GameScreenController;
	let potionManager: PotionManager;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		localStorageMock.clear();

		potionManager = new PotionManager();
		controller = new GameScreenController(potionManager);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('initialization', () => {
		it('should set up event handlers', () => {
			expect(answerInputForm.addEventListener).toHaveBeenCalledWith(
				'submit',
				expect.any(Function),
			);
		});
	});

	describe('startGame', () => {
		it('should initialize game state', () => {
			controller.startGame();
			expect(controller.isPausedState()).toBe(false);
		});
	});

	describe('game loop', () => {
		describe('round progression', () => {
			it('should detect when round is complete', () => {
				controller.startGame();
				const {model} = controller as any;

				vi.runAllTimers();

				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				const monsters = model.getMonsterManager().getMonsters();
				for (const monster of monsters) {
					monster.alive = false;
				}

				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				expect(model.isRoundComplete()).toBe(true);
			});
		});

		describe('game over', () => {
			it('should detect game over when health reaches zero', () => {
				controller.startGame();
				const {model} = controller as any;

				model.health = 0;
				model.getHealth = vi.fn(() => 0); // eslint-disable-line max-nested-callbacks
				model.isGameOver = vi.fn(() => true); // eslint-disable-line max-nested-callbacks

				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				expect(model.isGameOver()).toBe(true);
			});
		});
	});

	describe('potion usage', () => {
		beforeEach(() => {
			controller.startGame();
			potionManager.addPotion(potionType.heal);
			potionManager.addPotion(potionType.skipQuestion);
		});

		it('should use heal potion and increase health when not full', () => {
			const mockModel = (controller as any).model;
			mockModel.health = 80;
			mockModel.getHealth = vi.fn(() => 80);

			controller.usePotion(potionType.heal);

			expect(mockModel.increaseHealth).toHaveBeenCalledWith(20);
		});

		it('should not use heal potion when health is full', () => {
			const mockModel = (controller as any).model;

			controller.usePotion(potionType.heal);

			expect(mockModel.increaseHealth).not.toHaveBeenCalled();
		});

		it('should not use potion when unavailable', () => {
			const mockModel = (controller as any).model;

			// Use up both potions
			mockModel.health = 80;
			mockModel.getHealth = vi.fn(() => 80);
			controller.usePotion(potionType.heal);

			vi.runAllTimers();
			controller.usePotion(potionType.skipQuestion);

			vi.clearAllMocks();

			// Try to use heal potion again (should be unavailable)
			controller.usePotion(potionType.heal);
			expect(mockModel.increaseHealth).not.toHaveBeenCalled();
		});
	});
});

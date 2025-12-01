import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {
	PotionManager,
	potionType,
	type PotionType,
} from '../src/models/potion-manager.ts';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem(key: string) {
			return store[key] || null;
		},
		setItem(key: string, value: string) {
			store[key] = value.toString();
		},
		removeItem(key: string) {
			delete store[key]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
		},
		clear() {
			store = {};
		},
	};
})();

globalThis.localStorage = localStorageMock as any; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

describe('PotionManager', () => {
	let potionManager: PotionManager;

	beforeEach(() => {
		localStorage.clear();
		potionManager = new PotionManager();
	});

	afterEach(() => {
		localStorage.clear();
	});

	describe('addPotion', () => {
		it('starts with empty inventory', () => {
			expect(potionManager.getInventory()).toHaveLength(0);
		});

		it('add health potion to inventory', () => {
			potionManager.addPotion(potionType.heal);
			expect(potionManager.getInventory()).toContainEqual(
				expect.objectContaining({type: potionType.heal}),
			);
		});

		it('add skip question potion to inventory', () => {
			potionManager.addPotion(potionType.skipQuestion);
			expect(potionManager.getInventory()).toContainEqual(
				expect.objectContaining({type: potionType.skipQuestion}),
			);
		});

		it('checks inventory size after adding potions', () => {
			potionManager.addPotion(potionType.heal);
			potionManager.addPotion(potionType.skipQuestion);
			expect(potionManager.getInventory()).toHaveLength(2);
		});
	});

	describe('usePotion', () => {
		it('uses a potion that already exists in inventory', () => {
			potionManager.addPotion(potionType.heal);
			potionManager.addPotion(potionType.skipQuestion);
			const result = potionManager.usePotion(potionType.heal);
			expect(result).toBe(true);
			expect(potionManager.getInventory()).toHaveLength(1);
			expect(potionManager.hasPotion(potionType.heal)).toBe(false);
			expect(potionManager.getInventory()).toContainEqual(
				expect.objectContaining({type: potionType.skipQuestion}),
			);
		});
	});
});

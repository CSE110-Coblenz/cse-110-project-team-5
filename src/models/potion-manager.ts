export const potionType = {
	timeSlow: 'Time Slow Potion',
	heal: 'Heal Potion',
} as const;

export type PotionType = (typeof potionType)[keyof typeof potionType];

export type Potion = {
	type: PotionType;
	name: string;
	description: string;
	image: string;
};

export const potionDefinitions: Record<PotionType, Omit<Potion, 'type'>> = {
	[potionType.timeSlow]: {
		name: 'Time Slow Potion',
		description: 'Slows all enemies down by 50% for 5 seconds.',
		image: '/minigame_images/blue_potion.png', // Using blue for slow
	},
	[potionType.heal]: {
		name: 'Heal Potion',
		description: 'Restores 20 health points.',
		image: '/minigame_images/red_potion.png', // Using red for heal
	},
};

export class PotionManager {
	private inventory: Potion[] = [];

	constructor() {
		this.loadFromStorage();
	}

	addPotion(type: PotionType): void {
		const definition = potionDefinitions[type];
		this.inventory.push({
			type,
			...definition,
		});
		console.log(
			`[PotionManager] Added ${definition.name}. Inventory size: ${this.inventory.length}`,
		);
		this.saveToStorage();
	}

	usePotion(type: PotionType): boolean {
		const index = this.inventory.findIndex((p) => p.type === type);
		if (index !== -1) {
			const potion = this.inventory[index];
			this.inventory.splice(index, 1);
			console.log(
				`[PotionManager] Used ${potion.name}. Inventory size: ${this.inventory.length}`,
			);
			this.saveToStorage();
			return true;
		}

		return false;
	}

	getStorageKey(): string {
		return 'cse110_team5_potion_inventory';
	}

	getInventory(): Potion[] {
		return [...this.inventory];
	}

	hasPotion(type: PotionType): boolean {
		return this.inventory.some((p) => p.type === type);
	}

	getCounts(): Record<PotionType, number> {
		const counts = {
			[potionType.timeSlow]: 0,
			[potionType.heal]: 0,
		};
		for (const potion of this.inventory) {
			counts[potion.type]++;
		}

		return counts;
	}

	private saveToStorage(): void {
		try {
			// We only need to save the types, as definitions are static
			const data = this.inventory.map((p) => p.type);
			localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
		} catch (error) {
			console.error('Failed to save potion inventory:', error);
		}
	}

	private loadFromStorage(): void {
		try {
			const data = localStorage.getItem(this.getStorageKey());
			if (data) {
				const types = JSON.parse(data) as PotionType[];
				this.inventory = types.map((type) => ({
					type,
					...potionDefinitions[type],
				}));
				console.log(
					`[PotionManager] Loaded ${this.inventory.length} potions from storage.`,
				);
			}
		} catch (error) {
			console.error('Failed to load potion inventory:', error);
			this.inventory = [];
		}
	}
}

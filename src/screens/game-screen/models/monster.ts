// Simple Monster class

export class Monster {
	public readonly question: string;
	public readonly answer: number;
	public readonly id: number;
	private speed: number;
	private baseSpeed: number;
	private alive = true;
	private pathProgress = 0; // 0.0 to 1.0

	// Can change speed here in constructor to make monsters go faster/slower while testing
	constructor(id: number, speed = 2) {
		this.id = id;
		this.speed = speed;
		this.baseSpeed = speed;
		// Generate question and answer for this monster
		const randomValue = Math.floor(Math.random() * 10);
		this.question = `the answer is ${randomValue}`;
		this.answer = randomValue;
	}

	// Checks if monster is alive
	isAlive(): boolean {
		return this.alive;
	}

	// Kills the monster
	kill(): void {
		this.alive = false;
	}

	// Gets the path progress
	getPathProgress(): number {
		return this.pathProgress;
	}

	// Sets the path progress
	setPathProgress(progress: number): void {
		this.pathProgress = Math.min(1, Math.max(0, progress));
	}

	// Gets the speed
	getSpeed(): number {
		return this.speed;
	}

	// Sets the speed
	setSpeed(speed: number): void {
		this.speed = speed;
		this.baseSpeed = speed; // Update base speed if set manually
	}

	// Apply a temporary speed modifier (e.g. from potion)
	applySpeedModifier(multiplier: number): void {
		this.speed = this.baseSpeed * multiplier;
	}

	// Gets a monster's question
	getQuestion(): string {
		return this.question;
	}

	// Gets a monster's answer
	getAnswer(): number {
		return this.answer;
	}
}

// Simple Monster class

export class Monster {
    private alive: boolean = true;
    private pathProgress: number = 0; // 0.0 to 1.0
    private speed: number = 1.0; // 1.0 = normal, 0.5 = half speed
    public readonly id: number;
    
    // can change speed here in constructor to make monsters go faster/slower while testing
    constructor(id: number, speed: number = 2.0) {
        this.id = id;
        this.speed = speed;
    }

    // checks if monster is alive
    isAlive(): boolean {
        return this.alive;
    }

    // kills the monster
    kill(): void {
        this.alive = false;
    }

    // gets the path progress
    getPathProgress(): number {
        return this.pathProgress;
    }

    // sets the path progress
    setPathProgress(progress: number): void {
        this.pathProgress = Math.min(1.0, Math.max(0, progress));
    }

    // gets the speed
    getSpeed(): number {
        return this.speed;
    }

    // sets the speed
    setSpeed(speed: number): void {
        this.speed = speed;
    }
}
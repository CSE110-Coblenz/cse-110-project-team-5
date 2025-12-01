// Simple Monster class

export class Monster {
  public readonly question: string;
  public readonly answer: number;
  public readonly id: number;
  private speed: number;
  private alive = true;
  private pathProgress = 0; // 0.0 to 1.0

  // Can change speed here in constructor to make monsters go faster/slower while testing
  constructor(id: number, round: number, speed = 2) {
    this.id = id;
    this.speed = speed;
    // Generate question based on round number
    const { question, answer } = this.generateQuestion(round);
    this.question = question;
    this.answer = answer;
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
  }

  // Gets a monster's question
  getQuestion(): string {
    return this.question;
  }

  // Gets a monster's answer
  getAnswer(): number {
    return this.answer;
  }

  // Generate algebraic equation based on round difficulty
  private generateQuestion(round: number): {
    question: string;
    answer: number;
  } {
    const x = Math.floor(Math.random() * 20) + 1; // Answer is 1-20

    if (round <= 3) {
      // Rounds 1-3: Simple addition (x + a = b)
      const a = Math.floor(Math.random() * 10) + 1;
      const b = x + a;
      return { question: `x + ${a} = ${b}`, answer: x };
    }

    if (round <= 6) {
      // Rounds 4-6: Simple subtraction (x - a = b)
      const a = Math.floor(Math.random() * x) + 1;
      const b = x - a;
      return { question: `x - ${a} = ${b}`, answer: x };
    }

    if (round <= 9) {
      // Rounds 7-9: Simple multiplication (ax = b)
      const a = Math.floor(Math.random() * 5) + 2; // 2-6
      const xMult = Math.floor(Math.random() * 10) + 1;
      const b = a * xMult;
      return { question: `${a}x = ${b}`, answer: xMult };
    }

    // Round 10: Mix of all types
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const a = Math.floor(Math.random() * 15) + 1;
      const b = x + a;
      return { question: `x + ${a} = ${b}`, answer: x };
    }

    if (type === 1) {
      const a = Math.floor(Math.random() * x) + 1;
      const b = x - a;
      return { question: `x - ${a} = ${b}`, answer: x };
    }

    const a = Math.floor(Math.random() * 5) + 2;
    const xMult = Math.floor(Math.random() * 10) + 1;
    const b = a * xMult;
    return { question: `${a}x = ${b}`, answer: xMult };
  }
}

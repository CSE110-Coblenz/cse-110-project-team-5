import {
	answerInputBox,
	answerInputForm,
	questionColorDuration,
} from '../../constants.ts';
import {
	type PotionManager,
	potionType,
	type PotionType,
} from '../../models/potion-manager.ts';
import {ScreenController} from '../../types.ts';
import {Timer} from '../../utils.ts';
import {type GameOverController} from '../game-over-screen/game-over-controller.ts';
import {GameScreenModel} from './game-screen-model.ts';
import {GameScreenView} from './game-screen-view.ts';
import {type Monster} from './models/monster.ts';

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private model: GameScreenModel;
	private readonly view: GameScreenView;
	private gameOverController?: GameOverController; // Reference to GameOverController
	private isPaused = false; // Game paused state
	private spawnTimers: Timer[] = []; // Track spawn timeouts
	private spawnedMonsterIds = new Set<number>(); // Set of currently spawned monster IDs
	private readonly potionManager: PotionManager;

	constructor(potionManager: PotionManager) {
		super();

		this.potionManager = potionManager;
		this.model = new GameScreenModel();
		this.view = new GameScreenView();

		answerInputForm.addEventListener('submit', (event) => {
			event.preventDefault();
			if (this.isPaused) return;

			this.handleAnswerSubmit();
		});

		globalThis.addEventListener('keydown', (event) => {
			if (this.isPaused) return;
			if (event.key.toLowerCase() === 'h') {
				this.usePotion(potionType.heal);
			}

			if (event.key.toLowerCase() === 's') {
				this.usePotion(potionType.timeSlow);
			}
		});

		// Handles visibility change to pause/resume game
		// ensures that visuals are smooth if player leaves the tab
		let pausedBeforeVisibitlityChange = false;
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				pausedBeforeVisibitlityChange = this.isPaused;
				this.pause();
			} else if (!pausedBeforeVisibitlityChange) {
				this.resume();
			}
		});

		this.view.setButtonHandlers(
			() => {
				if (this.isPaused) {
					this.resume();
				} else {
					this.pause();
				}

				this.view.updatePauseButton(this.isPaused);
			},
			() => {
				this.usePotion(potionType.heal);
			},
			() => {
				this.usePotion(potionType.timeSlow);
			},
		);
	}

	public usePotion(type: PotionType): void {
		if (type === potionType.heal && this.model.getHealth() >= 100) {
			console.log('Health full, cannot use potion.');
			this.view.updateQuestionPrompt('Health Full!');
			setTimeout(() => {
				this.updateCurrentQuestion();
			}, 1500);
			return;
		}

		if (this.potionManager.usePotion(type)) {
			console.log(`Using potion: ${type}`);
			this.updatePotionCounts();

			if (type === potionType.heal) {
				this.applyHeal();
			} else if (type === potionType.timeSlow) {
				this.applyTimeSlow();
			}
		} else {
			console.log(`No potion available: ${type}`);
		}
	}

	// Allows controllers to communicate (game-screen -> game-over)
	public setGameOverController(controller: GameOverController): void {
		this.gameOverController = controller;
	}

	startGame(): void {
		this.model = new GameScreenModel();
		this.isPaused = false;
		this.spawnTimers = [];
		this.spawnedMonsterIds = new Set();
		this.view.setQuestionBoxColor('white', 0);
		this.view.show();

		const initialHealth = this.model.getHealth();
		this.view.updateHealth(initialHealth);
		this.view.updateRound(this.model.getRound());
		this.updatePotionCounts();

		this.startRound();
	}

	/**
	 * Get the view group
	 */
	getView(): GameScreenView {
		return this.view;
	}

	// Pause game
	public pause(): void {
		if (this.isPaused) return; // Already paused

		console.log('[CONTROLLER] Pausing game');
		this.isPaused = true;

		// Pause all future monster spawns
		for (const timer of this.spawnTimers) {
			timer.pause();
		}

		// Pause all monster animations
		this.view.pauseAllMonsters();
	}

	// Resume game from pause
	public resume(): void {
		if (!this.isPaused) return; // Already running

		console.log('[CONTROLLER] Resuming game');
		this.isPaused = false;

		// Resume all monster animations
		this.view.resumeAllMonsters();

		// Resume future monster spawns
		for (const timer of this.spawnTimers) {
			timer.resume();
		}
	}

	// Toggle pause state
	public togglePause(): void {
		if (this.isPaused) {
			this.resume();
		} else {
			this.pause();
		}
	}

	// Returns whether the game is currently paused
	public isPausedState(): boolean {
		return this.isPaused;
	}

	// Handles answer submission
	private handleAnswerSubmit(): void {
		const currentMonster = this.model.getCurrentActiveMonster();

		if (!currentMonster) {
			console.log('No monster spawned yet!');
			answerInputForm.reset();
			return;
		}

		const userAnswer = answerInputBox.valueAsNumber;

		if (userAnswer === currentMonster.getAnswer()) {
			this.onAnswerSuccess(currentMonster.id);
		} else {
			this.onAnswerFail();
		}
	}

	private updatePotionCounts(): void {
		const counts = this.potionManager.getCounts();
		this.view.updatePotionCounts(
			counts[potionType.heal],
			counts[potionType.timeSlow],
		);
	}

	private applyHeal(): void {
		this.model.increaseHealth(20);
		this.view.updateHealth(this.model.getHealth());
		this.view.updateQuestionPrompt('Healed 20 Health!');

		setTimeout(() => {
			this.updateCurrentQuestion();
		}, 1500);
	}

	private applyTimeSlow(): void {
		const monsters = this.model.getMonsterManager().getMonsters();
		for (const monster of monsters) {
			monster.applySpeedModifier(5); // Super slow (20% speed)
		}

		this.view.updateQuestionPrompt('Time Slowed!');

		setTimeout(() => {
			for (const monster of monsters) {
				monster.applySpeedModifier(1);
			}

			this.updateCurrentQuestion();
		}, 5000);
	}

	private onAnswerSuccess(monsterId: number): void {
		const eliminatedMonster = this.model.eliminateMonster(monsterId);

		if (eliminatedMonster) {
			this.view.destroyMonsterVisual(monsterId);
		}

		answerInputForm.reset();
		this.view.setQuestionBoxColor('green', questionColorDuration);
		this.updateCurrentQuestion();
		this.checkRoundEnd();
	}

	// Update question display based on current active monster
	private updateCurrentQuestion(): void {
		const currentMonster = this.model.getCurrentActiveMonster();

		if (currentMonster) {
			this.view.updateQuestionPrompt(currentMonster.getQuestion());
			console.log(
				`[CONTROLLER] Updated question to: ${currentMonster.getQuestion()}`,
			);
		} else {
			this.view.updateQuestionPrompt('Waiting for next monster...');
		}
	}

	private onAnswerFail(): void {
		this.view.setQuestionBoxColor('red', questionColorDuration);
		answerInputForm.reset();
	}

	private startRound(): void {
		this.model.startRound();

		this.spawnTimers = [];
		this.spawnedMonsterIds = new Set();

		const monsters: Monster[] = this.model.getMonsterManager().getMonsters();

		// Don't show question yet - wait for first monster to actually spawn
		this.view.updateQuestionPrompt('Get ready...');

		// Spawn monsters with staggered delay
		for (const [index, monster] of monsters.entries()) {
			const delay: number = index * this.spawnDelay;

			this.spawnTimers.push(
				new Timer(() => {
					this.spawnMonsterVisual(monster.id, monster.getSpeed());
					this.spawnedMonsterIds.add(monster.id);
				}, delay),
			);
		}
	}

	// Spawn monster visual through view
	private spawnMonsterVisual(monsterId: number, monsterSpeed: number): void {
		console.log(`[CONTROLLER] Spawning monster ${monsterId}`);

		this.model.markMonsterAsSpawned(monsterId);

		// Update question AFTER marking as spawned, so getCurrentActiveMonster() works correctly
		this.updateCurrentQuestion();

		this.view.spawnMonsterVisual(monsterId, monsterSpeed, () => {
			if (!this.isPaused) {
				this.handleMonsterReachedEnd(monsterId);
			}
		});
	}

	// Handle monster reaching the end of the path
	private handleMonsterReachedEnd(monsterId: number): void {
		this.model.handleMonsterReachedEnd(monsterId);
		this.view.updateHealth(this.model.getHealth());

		if (this.model.isGameOver()) {
			this.endGame();
		} else {
			this.checkRoundEnd();
		}
	}

	// Check if round is complete and proceed to next round
	private checkRoundEnd(): void {
		if (this.model.isRoundComplete()) {
			this.model.nextRound();
			this.view.updateRound(this.model.getRound());

			setTimeout(() => {
				if (!this.isPaused) {
					this.startRound();
				}
			}, 1000);
		}
	}

	private endGame(): void {
		// This.view.hide();

		if (this.gameOverController) {
			this.gameOverController.showGameOver(this.model.getRound());
		} else {
			console.error('GameOverController not set!');
		}
	}

	private get spawnDelay(): number {
		return 1000;
	}
}

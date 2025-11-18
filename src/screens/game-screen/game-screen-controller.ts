import {answerInputBox, answerInputForm} from '../../constants.ts';
import {ScreenController} from '../../types.ts';
import {GameScreenModel} from './model/game-screen-model.ts';
import {GameScreenView} from './game-screen-view.ts';
import {GameOverController} from '../game-over-screen/game-over-controller.ts'; 

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private model: GameScreenModel;
	private readonly view: GameScreenView;
	private readonly SPAWN_DELAY_MS = 2000; // Delay between spawns
	private gameOverController?: GameOverController; // Reference to GameOverController
	private isPaused: boolean = false; // Game paused state
	private spawnTimeouts: number[] = [];	// Track spawn timeouts
	private pendingMonsterIds: number[] = []; // Queue of monster IDs to be spawned
	private spawnedMonsterIds: Set<number> = new Set(); // Set of currently spawned monster IDs

	constructor() {
		super();

		this.model = new GameScreenModel();
		this.view = new GameScreenView();

		answerInputForm.addEventListener('submit', (event) => {
			event.preventDefault();
			if (this.isPaused) return;

			if (answerInputBox.valueAsNumber === this.model.getAnswer()) {
				this.onAnswerSuccess();
			} else {
				this.onAnswerFail();
			}
		});

		// Handles visibility change to pause/resume game
		// ensures that visuals are smooth if player leaves the tab
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				this.pause(); 
			} else {
				this.resume(); 
			}
		});
	}

	// allows controllers to communicate (game-screen -> game-over)
	public setGameOverController(controller: GameOverController): void {
		this.gameOverController = controller;
	}

	startGame(): void {
		this.model = new GameScreenModel();
		this.isPaused = false;
		this.spawnTimeouts = [];
		this.pendingMonsterIds = [];
		this.spawnedMonsterIds = new Set();
		this.generateNewQuestion();
		this.view.show();

		const initialHealth = this.model.getHealth();
		this.view.updateHealth(initialHealth);
		this.view.updateRound(this.model.getRound());

		this.startRound();
	}

	/**
	 * Get the view group
	 */
	getView(): GameScreenView {
		return this.view;
	}

	private generateNewQuestion(): void {
		const randomValue = Math.floor(Math.random() * 10);
		this.model.setQuestionAndAnswer(
			`the answer is ${randomValue}`,
			randomValue,
		);
		this.view.updateQuestionPrompt(this.model);
	}

	private onAnswerSuccess() {
		const eliminatedMonsterId = this.model.eliminateFirstMonster();

		if (eliminatedMonsterId !== null) {
			this.view.destroyMonsterVisual(eliminatedMonsterId);
		}

		console.log('correct');
		answerInputForm.reset();
		this.generateNewQuestion();
		this.checkRoundEnd();
	}

	private onAnswerFail(): void {
		console.log('failed');
	}

	private startRound(): void {
		this.model.startRound();

		const monsters = this.model.getMonsterManager().getMonsters();
		
		this.spawnTimeouts = [];
		this.pendingMonsterIds = [];
		this.spawnedMonsterIds = new Set();
		
		// Spawn monsters with staggered delay
		monsters.forEach((monster, index) => {
			const delay = index * this.SPAWN_DELAY_MS;
			
			// Add to pending list
			this.pendingMonsterIds.push(monster.id);
			
			const timeoutId = window.setTimeout(() => {
				if (!this.isPaused) {
					this.spawnMonsterVisual(monster.id, this.model.getMonsterById(monster.id)?.getSpeed() || 1.0);
					this.spawnedMonsterIds.add(monster.id);
					// Remove from pending after spawning
					this.pendingMonsterIds = this.pendingMonsterIds.filter(id => id !== monster.id);
				}
			}, delay);
			
			this.spawnTimeouts.push(timeoutId);
		});
	}

	// spawn monster visual through view
	private spawnMonsterVisual(monsterId: number, monsterSpeed: number): void {
		console.log(`[CONTROLLER] Spawning monster ${monsterId}`);
		this.view.spawnMonsterVisual(monsterId, monsterSpeed, () => {
			if (!this.isPaused) {
				this.handleMonsterReachedEnd(monsterId);
			}
		});
	}

	// handle monster reaching the end of the path
	private handleMonsterReachedEnd(monsterId: number): void {
		this.model.handleMonsterReachedEnd(monsterId);
		this.view.updateHealth(this.model.getHealth());

		if (this.model.isGameOver()) {
			this.endGame();
		} else {
			this.checkRoundEnd();
		}
	}

	// check if round is complete and proceed to next round
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

	// pause game
	public pause(): void {
		if (this.isPaused) return; // Already paused
		
		console.log('[CONTROLLER] Pausing game');
		this.isPaused = true;
		
		// Clear all pending spawn timeouts
		this.spawnTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
		this.spawnTimeouts = [];
		
		// Pause all monster animations
		this.view.pauseAllMonsters();
		
		// this.view.showPauseOverlay();
	}
	
	// resume game from pause
	public resume(): void {
		if (!this.isPaused) return; // Already running
		
		console.log('[CONTROLLER] Resuming game');
		this.isPaused = false;
		
		// Resume all monster animations
		this.view.resumeAllMonsters();
		
		// Spawn all pending monsters with even spacing
		if (this.pendingMonsterIds.length > 0) {
			console.log(`[CONTROLLER] Resuming ${this.pendingMonsterIds.length} pending spawns`);
			
			this.pendingMonsterIds.forEach((monsterId, index) => {
				const delay = index * this.SPAWN_DELAY_MS;
				
				const timeoutId = window.setTimeout(() => {
					if (!this.isPaused) {
						this.spawnMonsterVisual(monsterId, this.model.getMonsterById(monsterId)?.getSpeed() || 1.0);
						this.spawnedMonsterIds.add(monsterId);
					}
				}, delay);
				
				this.spawnTimeouts.push(timeoutId);
			});
			
			// Clear pending since we've rescheduled them
			this.pendingMonsterIds = [];
		}
		
		// this.view.hidePauseOverlay();
	}

	// toggle pause state
	public togglePause(): void {
		if (this.isPaused) {
			this.resume();
		} else {
			this.pause();
		}
	}
	
	// returns whether the game is currently paused
	public isPausedState(): boolean {
		return this.isPaused;
	}

	private endGame(): void {
		this.view.hide();
		
		if (this.gameOverController) {
			this.gameOverController.showGameOver(this.model.getRound());
		} else {
			console.error('GameOverController not set!');
		}
	}
}

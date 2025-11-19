import {
	answerInputBox,
	answerInputForm,
	questionColorDuration,
} from '../../constants.ts';
import {ScreenController} from '../../types.ts';
import {GameScreenModel} from './game-screen-model.ts';
import {GameScreenView} from './game-screen-view.ts';
import {GameOverController} from '../game-over-screen/game-over-controller.ts'; 
import { Monster } from './models/monster.ts';

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private model: GameScreenModel;
	private readonly view: GameScreenView;
	private readonly SPAWN_DELAY_MS = 1000; // Delay between spawns
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
			
			this.handleAnswerSubmit();
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
		// this.generateNewQuestion();
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

	// private generateNewQuestion(): void {
	// 	const randomValue = Math.floor(Math.random() * 10);
	// 	this.model.setQuestionAndAnswer(
	// 		`the answer is ${randomValue}`,
	// 		randomValue,
	// 	);
	// 	this.view.updateQuestionPrompt(this.model);
	// }

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

	private onAnswerSuccess(monsterId: number): void {
		const eliminatedMonster = this.model.eliminateMonster(monsterId);

		 if (eliminatedMonster) {
            this.view.destroyMonsterVisual(monsterId);
            console.log('correct');
        }

		console.log('correct');
        answerInputForm.reset();
        this.updateCurrentQuestion(); 
        this.checkRoundEnd();
    }

    // Update question display based on current active monster
	private updateCurrentQuestion(): void {
		const currentMonster = this.model.getCurrentActiveMonster();
		
		if (currentMonster) {
			this.view.updateQuestionPrompt(currentMonster.getQuestion());
			console.log(`[CONTROLLER] Updated question to: ${currentMonster.getQuestion()}`);
		} else {
			this.view.updateQuestionPrompt('Waiting for next monster...');
		}
	}

	private onAnswerFail(): void {
		console.log('failed');
		answerInputForm.reset();
	}

	private startRound(): void {
		this.model.startRound();

		this.spawnTimeouts = [];
		this.pendingMonsterIds = [];
		this.spawnedMonsterIds = new Set();
		
		const monsters: Monster[] = this.model.getMonsterManager().getMonsters();
		
		// Don't show question yet - wait for first monster to actually spawn
		this.view.updateQuestionPrompt('Get ready...');

		// Spawn monsters with staggered delay
		monsters.forEach((monster: Monster, index: number) => {
			const delay: number = index * this.SPAWN_DELAY_MS;
			this.pendingMonsterIds.push(monster.id);
			
			const timeoutId: number = window.setTimeout(() => {
				if (!this.isPaused) {
					this.spawnMonsterVisual(
						monster.id,
						monster.getSpeed()
					);
					this.spawnedMonsterIds.add(monster.id);
					this.pendingMonsterIds = this.pendingMonsterIds.filter((id: number) => id !== monster.id);
				}
			}, delay);
			
			this.spawnTimeouts.push(timeoutId);
		});
	}

	// spawn monster visual through view
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
		// this.view.hide();
		
		if (this.gameOverController) {
			this.gameOverController.showGameOver(this.model.getRound());
		} else {
			console.error('GameOverController not set!');
		}
	}
}

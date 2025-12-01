import Konva from 'konva';
import type {View} from '../../types.ts';
import {stageWidth, stageHeight} from '../../constants.ts';
import {createButton} from '../../utils.ts';

export class GameOverView implements View {
	private readonly group: Konva.Group;
	private playAgainButton!: Konva.Group;
	private homeButton!: Konva.Group;

	constructor() {
		this.group = new Konva.Group({visible: false});
		this.initializeView();
	}

	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	/**
	 * Set click handlers for buttons
	 */
	public setButtonHandlers(onPlayAgain: () => void, onHome: () => void): void {
		this.playAgainButton.on('click tap', onPlayAgain);
		this.homeButton.on('click tap', onHome);
	}

	/**
	 * Update the final score display
	 */
	public setFinalRound(round: number): void {
		const roundText = this.group.findOne('.finalRound');
		if (roundText && roundText instanceof Konva.Text) {
			roundText.text(`You reached Round ${round}`);
		}
	}

	/**
	 * Set the title text (e.g., "GAME OVER" or "YOU WIN!")
	 */
	public setTitle(title: string): void {
		const titleText = this.group.findOne('.titleText');
		if (titleText && titleText instanceof Konva.Text) {
			titleText.text(title);
		}
	}

	private initializeView(): void {
		// Translucent overlay - much more subtle
		const overlay = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
			fill: 'black',
			opacity: 0.5,
		});
		this.group.add(overlay);

		// Game Over panel - warm beige color like main menu
		const panel = new Konva.Rect({
			x: stageWidth * 0.3,
			y: stageHeight * 0.25,
			width: stageWidth * 0.4,
			height: stageHeight * 0.5,
			fill: '#F5E6D3', // Warm beige matching main menu
			cornerRadius: 20,
			stroke: '#8B4513', // Brown border
			strokeWidth: 4,
		});
		this.group.add(panel);

		// Game Over text - brown like main menu title
		const gameOverText = new Konva.Text({
			x: stageWidth * 0.3,
			y: stageHeight * 0.3,
			width: stageWidth * 0.4,
			text: 'GAME OVER',
			fontSize: 72,
			fontFamily: 'Jersey 10',
			fill: '#5C3317', // Dark brown
			align: 'center',
			name: 'titleText',
		});
		this.group.add(gameOverText);

		// Final round text - brown
		const finalRoundText = new Konva.Text({
			x: stageWidth * 0.3,
			y: stageHeight * 0.4,
			width: stageWidth * 0.4,
			text: 'You reached Round 1',
			fontSize: 36,
			fontFamily: 'Jersey 10',
			fill: '#5C3317', // Dark brown
			align: 'center',
			name: 'finalRound',
		});
		this.group.add(finalRoundText);

		// Play Again button - green matching main menu
		this.playAgainButton = createButton(
			stageWidth * 0.35,
			stageHeight * 0.52,
			stageWidth * 0.3,
			60,
			'Play Again',
			'#6B8E4E', // Green from main menu
		);
		this.group.add(this.playAgainButton);

		// Home button - purple matching main menu Help button
		this.homeButton = createButton(
			stageWidth * 0.35,
			stageHeight * 0.62,
			stageWidth * 0.3,
			60,
			'Return Home',
			'#B8A8D4', // Purple from main menu
		);
		this.group.add(this.homeButton);
	}
}

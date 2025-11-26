import Konva from 'konva';
import type {View} from '../../types.ts';
import {stageWidth, stageHeight, answerInputForm} from '../../constants.ts';
import {createButton} from '../../utils.ts';

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private readonly group: Konva.Group;
	private roundIndicator!: Konva.Text;
	private healthIndicator!: Konva.Text;
	private questionPrompt!: Konva.Text;
	private questionBar!: Konva.Rect;
	private pauseButton!: Konva.Group;
	private background!: Konva.Rect;
	private pathDefinition = new Array<{x: number; y: number}>();
	private colorTween: Konva.Tween | undefined;
	private readonly monsterVisuals = new Map<number, Konva.Rect>(); // Maps monster IDs to their visuals
	private readonly monsterTweens = new Map<number, Konva.Tween>(); // Maps monster IDs to their tweens
	private healPotionButton!: Konva.Group;
	private skipQuestionPotionButton!: Konva.Group;

	constructor() {
		this.group = new Konva.Group({visible: false});
		this.initializeView();
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
		this.toggleAnswerInput(true);
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
		this.toggleAnswerInput(false);
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	public setButtonHandlers(
		onPause: () => void,
		onHeal: () => void,
		onSkip: () => void,
	): void {
		this.pauseButton.on('click tap', onPause);

		this.healPotionButton.on('click tap', onHeal);
		this.healPotionButton.on('mouseenter', () => {
			document.body.style.cursor = 'pointer';
		});
		this.healPotionButton.on('mouseleave', () => {
			document.body.style.cursor = 'default';
		});

		this.skipQuestionPotionButton.on('click tap', onSkip);
		this.skipQuestionPotionButton.on('mouseenter', () => {
			document.body.style.cursor = 'pointer';
		});
		this.skipQuestionPotionButton.on('mouseleave', () => {
			document.body.style.cursor = 'default';
		});
	}

	// Spawn monster visual along path
	public spawnMonsterVisual(
		monsterId: number,
		monsterSpeed: number,
		onReachEnd: () => void,
	): void {
		const startPoint = this.pathDefinition[0];

		const monster = new Konva.Rect({
			x: startPoint.x,
			y: startPoint.y,
			width: 30,
			height: 30,
			fill: 'red',
			offsetX: 15,
			offsetY: 15,
		});

		this.group.add(monster);
		this.monsterVisuals.set(monsterId, monster);

		let index = 0;
		const baseTotalDuration = 60; // Takes a monster 30s to traverse the whole path
		let currentTween: Konva.Tween | undefined; // Track current tween

		const tweenOnFinish = () => {
			index++;
			if (index >= this.pathDefinition.length) {
				monster.destroy();
				this.monsterVisuals.delete(monsterId);
				this.monsterTweens.delete(monsterId); // Clean up
				onReachEnd();
			} else {
				const nextPoint = this.pathDefinition[index];

				currentTween = new Konva.Tween({
					node: monster,
					duration:
						baseTotalDuration / this.pathDefinition.length / monsterSpeed, // Adjust duration based on speed
					x: nextPoint.x,
					y: nextPoint.y,
					onFinish: tweenOnFinish,
				});

				this.monsterTweens.set(monsterId, currentTween); // Track it
				currentTween.play();
			}
		};

		tweenOnFinish();
	}

	// Destroy monster visual and its tween
	public destroyMonsterVisual(monsterId: number): void {
		const monster = this.monsterVisuals.get(monsterId);
		const tween = this.monsterTweens.get(monsterId);

		if (tween) {
			tween.destroy(); // Stop and destroy the tween
			this.monsterTweens.delete(monsterId);
		}

		if (monster) {
			monster.destroy();
			this.monsterVisuals.delete(monsterId);
		}
	}

	public setQuestionBoxColor(color: string, duration: number): void {
		this.colorTween?.destroy();
		this.questionBar.fill(color);
		this.colorTween = new Konva.Tween({
			node: this.questionBar,
			duration,
			fill: 'white',
		});
		this.colorTween.play();
	}

	// Pause monster animations
	public pauseAllMonsters(): void {
		for (const tween of this.monsterTweens.values()) {
			tween.pause();
		}
	}

	// Resume monster animations
	public resumeAllMonsters(): void {
		for (const tween of this.monsterTweens.values()) {
			tween.play();
		}
	}

	public updateHealth(newHealth: number): void {
		this.healthIndicator.text(`Health: ${newHealth}`);
	}

	public updateRound(roundNumber: number): void {
		this.roundIndicator.text(`Round: ${roundNumber}`);
	}

	public updateQuestionPrompt(questionText: string): void {
		// Update the Konva text element
		this.questionPrompt.text(questionText);

		const questionElement = document.querySelector('#question-prompt');
		if (questionElement) {
			questionElement.textContent = questionText;
		}
	}

	public updatePauseButton(isPaused: boolean): void {
		(this.pauseButton.find('Text')[0] as Konva.Text).text(
			isPaused ? 'Resume' : 'Pause',
		);
		this.background.fill(isPaused ? 'red' : '#6B8E23');
		this.questionPrompt.fill(isPaused ? 'white' : 'black');
	}

	public updatePotionCounts(healCount: number, skipCount: number): void {
		const healText = this.healPotionButton.findOne('Text')!;
		if (healText) {
			(healText as Konva.Text).text(`Heal x${healCount}`);
		}

		const skipText = this.skipQuestionPotionButton.findOne('Text')!;
		if (skipText) {
			(skipText as Konva.Text).text(`Skip x${skipCount}`);
		}

		this.group.getLayer()?.batchDraw();
	}

	private initializeView(): void {
		this.createBackground();
		this.createPath();
		this.createVisualElements();
		this.createTextElements();
		this.createPotionButtons();
		this.createTowerVisuals();
	}

	private createPotionButtons(): void {
		// Heal Potion Button (Red) - Placed below the tower
		this.healPotionButton = new Konva.Group({
			x: stageWidth * 0.85,
			y: stageHeight * 0.88,
		});

		const healBg = new Konva.Rect({
			width: 80,
			height: 80,
			fill: 'rgba(255, 255, 255, 0.2)',
			cornerRadius: 10,
			stroke: '#E53935',
			strokeWidth: 2,
		});

		this.healPotionButton.add(healBg);

		Konva.Image.fromURL('/minigame_images/red_potion.png', (img) => {
			img.width(50);
			img.height(50);
			img.x(15); // Centered: (80 - 50) / 2
			img.y(10);
			this.healPotionButton.add(img);
		});

		const healLabel = new Konva.Text({
			x: 0,
			y: 60,
			text: 'Heal x0',
			fontSize: 16,
			fontFamily: 'Jersey 10',
			fill: 'white',
			width: 80, // Match background width
			align: 'center',
		});
		this.healPotionButton.add(healLabel);

		this.group.add(this.healPotionButton);

		// Skip Question Potion Button (Blue) - Placed below the tower
		this.skipQuestionPotionButton = new Konva.Group({
			x: stageWidth * 0.91, // Right side under tower
			y: stageHeight * 0.88, // Below tower
		});

		const skipQuestionBg = new Konva.Rect({
			width: 80,
			height: 80,
			fill: 'rgba(255, 255, 255, 0.2)',
			cornerRadius: 10,
			stroke: '#1E88E5',
			strokeWidth: 2,
		});

		this.skipQuestionPotionButton.add(skipQuestionBg);

		Konva.Image.fromURL('/minigame_images/blue_potion.png', (img) => {
			img.width(50);
			img.height(50);
			img.x(15); // Centered: (80 - 50) / 2
			img.y(10);
			this.skipQuestionPotionButton.add(img);
		});

		const skipLabel = new Konva.Text({
			x: 0,
			y: 60,
			text: 'Skip x0',
			fontSize: 16,
			fontFamily: 'Jersey 10',
			fill: 'white',
			width: 80, // Match background width
			align: 'center',
		});
		this.skipQuestionPotionButton.add(skipLabel);

		this.group.add(this.skipQuestionPotionButton);
	}

	private createBackground(): void {
		this.background = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
			fill: '#6B8E23',
		});
		this.group.add(this.background);
	}

	private createPath(): void {
		// Path Points to match reference design
		this.pathDefinition = [
			{x: 0, y: stageHeight * 0.27},
			{x: stageWidth * 0.2, y: stageHeight * 0.27},
			{x: stageWidth * 0.2, y: stageHeight * 0.43},
			{x: stageWidth * 0.08, y: stageHeight * 0.43},
			{x: stageWidth * 0.08, y: stageHeight * 0.8},
			{x: stageWidth * 0.33, y: stageHeight * 0.8},
			{x: stageWidth * 0.33, y: stageHeight * 0.27},
			{x: stageWidth * 0.73, y: stageHeight * 0.27},
			{x: stageWidth * 0.73, y: stageHeight * 0.43},
			{x: stageWidth * 0.47, y: stageHeight * 0.43},
			{x: stageWidth * 0.47, y: stageHeight * 0.73},
			{x: stageWidth * 0.82, y: stageHeight * 0.73},
		];

		const pathPointsFlat = this.pathDefinition.flatMap((point) => [
			point.x,
			point.y,
		]);

		const path = new Konva.Line({
			points: pathPointsFlat,
			stroke: '#8C8C8C',
			strokeWidth: 42,
			lineCap: 'square',
			lineJoin: 'miter',
		});
		this.group.add(path);
	}

	private createVisualElements(): void {
		const topLeftBar = new Konva.Rect({
			x: stageWidth * 0.01,
			y: stageHeight * 0.043,
			width: 430,
			height: 54,
			fill: '#143F09',
		});

		this.group.add(topLeftBar);

		this.questionBar = new Konva.Rect({
			x: stageWidth * 0.275,
			y: stageHeight * 0.043,
			width: 800,
			height: 54,
			fill: 'white',
		});

		this.group.add(this.questionBar);

		const sideBar = new Konva.Rect({
			x: stageWidth * 0.82,
			y: 0,
			width: stageWidth * 0.18,
			height: stageHeight,
			fill: '#8B6A3E',
		});
		this.group.add(sideBar);

		const towerHeader = new Konva.Rect({
			x: stageWidth * 0.84,
			y: stageHeight * 0.043,
			width: stageWidth * 0.14,
			height: 54,
			fill: '#C49A6C',
		});
		this.group.add(towerHeader);
	}

	private createTextElements(): void {
		this.roundIndicator = new Konva.Text({
			x: stageWidth * 0.02,
			y: stageHeight * 0.048,
			text: 'Round: 1',
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'white',
		});
		this.group.add(this.roundIndicator);

		this.healthIndicator = new Konva.Text({
			x: stageWidth * 0.13,
			y: stageHeight * 0.046,
			text: 'Health: ...',
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'white',
		});
		this.group.add(this.healthIndicator);

		this.questionPrompt = new Konva.Text({
			x: stageWidth * 0.283,
			y: stageHeight * 0.047,
			text: "PLACEHOLDER QUESTION YOU SHOULDN'T SEE THIS",
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'black',
		});
		this.group.add(this.questionPrompt);

		this.pauseButton = createButton(
			stageWidth * 0.725,
			stageHeight * 0.043,
			120,
			53,
			'Pause',
			'#B8A8D4',
		);
		this.group.add(this.pauseButton);

		const towerHeaderText = new Konva.Text({
			x: stageWidth * 0.881,
			y: stageHeight * 0.047,
			text: 'Tower',
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'black',
		});
		this.group.add(towerHeaderText);
	}

	private createTowerVisuals(): void {
		const towerY = stageHeight * 0.1;
		const towerWidth = 400;
		const towerHeight = 800;
		const towerX = stageWidth * 0.79;

		/*
		Konva.Image.fromURL('/gamescreen_images/tower3.png', (img) => {
			img.x(towerX);
			img.y(towerY);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});
		*/

		Konva.Image.fromURL('/gamescreen_images/tower5.png', (img) => {
			img.x(towerX);
			img.y(towerY);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});

		/*
		Konva.Image.fromURL('/gamescreen_images/tower4.png', (img) => {
			img.x(towerX);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});
		*/

		/*
		Konva.Image.fromURL('/gamescreen_images/tower.png', (img) => {
			img.x(towerX);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});
		*/
	}

	private toggleAnswerInput(active: boolean): void {
		answerInputForm.hidden = !active;
	}
}

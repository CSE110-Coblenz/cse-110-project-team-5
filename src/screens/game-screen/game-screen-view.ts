import Konva from 'konva';
import type {View} from '../../types.ts';
import {stageWidth, stageHeight, answerInputForm} from '../../constants.ts';
import type {GameScreenModel} from './game-screen-model.ts';

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private readonly group: Konva.Group;
	private roundIndicator!: Konva.Text;
	private healthIndicator!: Konva.Text;
	private questionPrompt!: Konva.Text;
	private pathDefinition = new Array<{x: number; y: number}>();
	private monsterVisuals = new Map<number, Konva.Rect>(); // maps monster IDs to their visuals
	private monsterTweens = new Map<number, Konva.Tween>();  // maps monster IDs to their tweens


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

	// spawn monster visual along path
	public spawnMonsterVisual(monsterId: number, monsterSpeed: number, onReachEnd: () => void): void {
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
		const baseTotalDuration = 60; // takes a monster 30s to traverse the whole path
		let currentTween: Konva.Tween | null = null;  // Track current tween

		const tweenOnFinish = () => {
			index++;
			if (index >= this.pathDefinition.length) {
				monster.destroy();
				this.monsterVisuals.delete(monsterId);
				this.monsterTweens.delete(monsterId);  // Clean up
				onReachEnd();
			} else {
				const nextPoint = this.pathDefinition[index];

				currentTween = new Konva.Tween({
					node: monster,
					duration: (baseTotalDuration / this.pathDefinition.length) /monsterSpeed, // Adjust duration based on speed
					x: nextPoint.x,
					y: nextPoint.y,
					onFinish: tweenOnFinish,
				});
				
				this.monsterTweens.set(monsterId, currentTween);  // Track it
				currentTween.play();
			}
		};

		tweenOnFinish();
	}

	// destroy monster visual and its tween
	public destroyMonsterVisual(monsterId: number): void {
		const monster = this.monsterVisuals.get(monsterId);
		const tween = this.monsterTweens.get(monsterId);
		
		if (tween) {
			tween.destroy();  // Stop and destroy the tween
			this.monsterTweens.delete(monsterId);
		}
		
		if (monster) {
			monster.destroy();
			this.monsterVisuals.delete(monsterId);
		}
	}

	// pause monster animations
	public pauseAllMonsters(): void {
		this.monsterTweens.forEach((tween) => {
			tween.pause();
		});
	}

	// resume monster animations
	public resumeAllMonsters(): void {
		this.monsterTweens.forEach((tween) => {
			tween.play();
		});
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
		
		const questionElement = document.getElementById('question-prompt');
		if (questionElement) {
			questionElement.textContent = questionText;
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

	private initializeView(): void {
		this.createBackground();
		this.createPath();
		this.createVisualElements();
		this.createTextElements();
		this.createTowerVisuals();
	}

	private createBackground(): void {
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
			fill: '#6B8E23',
		});
		this.group.add(bg);
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
			y: stageHeight * 0.03,
			width: stageWidth * 0.14,
			height: stageHeight * 0.055,
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

		const towerHeaderText = new Konva.Text({
			x: stageWidth * 0.881,
			y: stageHeight * 0.035,
			text: 'Tower',
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'black',
		});
		this.group.add(towerHeaderText);
	}

	private createTowerVisuals(): void {
		const towerSpacing = stageHeight * 0.2;
		const towerY = stageHeight * 0.1;
		const towerWidth = 150;
		const towerHeight = 200;
		const towerX = stageWidth * 0.88;

		Konva.Image.fromURL('/gamescreen_images/tower3.png', (img) => {
			img.x(towerX);
			img.y(towerY);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});

		Konva.Image.fromURL('/gamescreen_images/tower2.png', (img) => {
			img.x(towerX);
			img.y(towerY + towerSpacing);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});

		Konva.Image.fromURL('/gamescreen_images/tower4.png', (img) => {
			img.x(towerX);
			img.y(towerY + towerSpacing * 2);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});

		Konva.Image.fromURL('/gamescreen_images/tower.png', (img) => {
			img.x(towerX);
			img.y(towerY + towerSpacing * 3);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});
	}

	private toggleAnswerInput(active: boolean): void {
		answerInputForm.hidden = !active;
	}
}

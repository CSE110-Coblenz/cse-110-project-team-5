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
	private questionBar!: Konva.Rect;
	private pathDefinition = new Array<{x: number; y: number}>();

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

	public spawnMonster(onMonsterReachEnd: () => void): void {
		const startPoint = this.pathDefinition[0];

		// Create monster as a red square
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

		let index = 0;
		const speed = 6;

		// Function to move to the next point
		const tweenOnFinish = () => {
			index++;
			if (index >= this.pathDefinition.length) {
				monster.destroy();
				onMonsterReachEnd();
			} else {
				const nextPoint = this.pathDefinition[index];

				new Konva.Tween({
					node: monster,
					duration: speed,
					x: nextPoint.x,
					y: nextPoint.y,
					onFinish: tweenOnFinish,
				}).play();
			}
		};

		tweenOnFinish();
	}

	public updateHealth(newHealth: number): void {
		this.healthIndicator.text(`Health: ${newHealth}`);
	}

	public updateQuestionPrompt(model: GameScreenModel): void {
		this.questionPrompt.text(model.getQuestion());
	}

	public setQuestionBoxColor(color: string): void {
		this.questionBar.fill(color);
		this.group.getLayer()?.draw();
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

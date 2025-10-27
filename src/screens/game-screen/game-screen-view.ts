import Konva from 'konva';
import type {View} from '../../types.ts';
import {stageWidth, stageHeight} from '../../constants.ts';

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private readonly group: Konva.Group;
	private readonly scoreText: Konva.Text;
	private readonly timerText: Konva.Text;

	constructor() {
		this.group = new Konva.Group({visible: false});

		// Background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
			fill: '#6B8E23', // Grass green
		});
		this.group.add(bg);

		// Path Points to match reference design
		const pathPoints = [
			0, stageHeight * 0.27,
			stageWidth * 0.2, stageHeight * 0.27,
			stageWidth * 0.2, stageHeight * 0.43,
			stageWidth * 0.08, stageHeight * 0.43,
			stageWidth * 0.08, stageHeight * 0.8,
			stageWidth * 0.33, stageHeight * 0.8,
			stageWidth * 0.33, stageHeight * 0.27,
			stageWidth * 0.73, stageHeight * 0.27,
			stageWidth * 0.73, stageHeight * 0.43,
			stageWidth * 0.47, stageHeight * 0.43,
			stageWidth * 0.47, stageHeight * 0.73,
			stageWidth * 0.82, stageHeight * 0.73,
		];

		const path = new Konva.Line({
			points: pathPoints,
			stroke: '#8C8C8C',
			strokeWidth: 28,
			lineCap: 'square',
			lineJoin: 'miter',
		});
		this.group.add(path);

		// Bar For Round, Health indicator
		const topLeftBar = new Konva.Rect({
			x: stageWidth * 0.01,
			y: stageHeight * 0.043,
			width: 201.5,
			height: 30,
			fill: '#143F09',
		});

		this.group.add(topLeftBar);

		const topRightBar = new Konva.Rect({
			x: stageWidth * 0.275,
			y: stageHeight * 0.043,
			width: 400,
			height: 30,
			fill: 'white',
		});

		this.group.add(topRightBar);

		// Bar For Towers/Potion
		const sideBar = new Konva.Rect({
			x: stageWidth * 0.82,
			y: 0,
			width: stageWidth * 0.18,
			height: stageHeight,
			fill: '#8B6A3E',
		});
		this.group.add(sideBar);

		const answerBar = new Konva.Rect({
			x: stageWidth * 0.0145,
			y: stageHeight * 0.91,
			width: stageWidth * 0.792,
			height: 28,
			fill: 'white',
		});
		this.group.add(answerBar);

		const towerHeader = new Konva.Rect({
			x: stageWidth * 0.84,
			y: stageHeight * 0.03,
			width: stageWidth * 0.14,
			height: stageHeight * 0.055,
			fill: '#C49A6C',
		});
		this.group.add(towerHeader);

		const roundIndicator = new Konva.Text({
			x: stageWidth * 0.02,
			y: stageHeight * 0.048,
			text: 'Round: 1',
			fontSize: 24,
			fontFamily: 'Jersey 10',
			fill: 'white',
		});
		this.group.add(roundIndicator);

		const healthIndicator = new Konva.Text({
			x: stageWidth * 0.13,
			y: stageHeight * 0.048,
			text: 'Health: 100',
			fontSize: 24,
			fontFamily: 'Jersey 10',
			fill: 'white',
		});
		this.group.add(healthIndicator);

		const questionPrompt = new Konva.Text({
			x: stageWidth * 0.283,
			y: stageHeight * 0.049,
			text: 'What is x equal to?                               4x-4 = 0',
			fontSize: 24,
			fontFamily: 'Jersey 10',
			fill: 'black',
		});
		this.group.add(questionPrompt);

		const answer = new Konva.Text({
			x: stageWidth * 0.02,
			y: stageHeight * 0.915,
			text: 'x = ',
			fontSize: 24,
			fontFamily: 'Jersey 10',
			fill: 'black',
		});
		this.group.add(answer);

		const towerHeaderText = new Konva.Text({
			x: stageWidth * 0.881,
			y: stageHeight * 0.035,
			text: 'Tower',
			fontSize: 24,
			fontFamily: 'Jersey 10',
			fill: 'black',
		});
		this.group.add(towerHeaderText);

		const towerSpacing = stageHeight * 0.15
		const towerY = stageHeight * 0.1;
		const towerWidth = 55;
		const towerHeight = 80;
        const towerX = stageWidth * 0.88;

		Konva.Image.fromURL('/tower.png', (img) => {
            img.setAttrs({
                x: towerX,
                y: towerY,
                width: towerWidth,
                height: towerHeight,
            });
            this.group.add(img);
        });

		Konva.Image.fromURL('/tower2.png', (img) => {
			img.setAttrs({
				x: towerX,
				y: towerY + towerSpacing,
				width: towerWidth,
				height: towerHeight,
			});
			this.group.add(img);
		});
		
		Konva.Image.fromURL('/tower3.png', (img) => {
			img.setAttrs({
				x: towerX,
				y: towerY + 2 * towerSpacing,
				width: towerWidth,
				height: towerHeight,
			});
			this.group.add(img);
		});

		Konva.Image.fromURL('/tower4.png', (img) => {
			img.setAttrs({
				x: towerX,
				y: towerY + 3 * towerSpacing,
				width: towerWidth,
				height: towerHeight,
			});
			this.group.add(img);
		});
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}

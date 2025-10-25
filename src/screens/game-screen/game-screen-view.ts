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

		// Bar For Round, Health indicator and Question
		const topBar = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight * 0.1,
			fill: '#143F09',
		});

		this.group.add(topBar);

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
			x: 0,
			y: stageHeight * 0.9,
			width: stageWidth * 0.82,
			height: stageHeight * 0.1,
			fill: '#143F09',
		});
		this.group.add(answerBar);
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

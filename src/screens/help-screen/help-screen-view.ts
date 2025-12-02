import Konva from 'konva';
import type {View} from '../../types.ts';
import {stageWidth, stageHeight} from '../../constants.ts';

type HelpCallbacks = {
	onBack: () => void;
};

// Tutorial type
type TutorialStep = {
	x: number;
	y: number;
	text: string;
};

export class HelpScreenView implements View {
	private readonly group: Konva.Group;

	// Tutorial Steps
	private currentStep = 0;
	private readonly steps: TutorialStep[];

	// Bubble UI creation
	private bubbleGroup!: Konva.Group;
	private bubbleRect!: Konva.Rect;
	private bubbleText!: Konva.Text;

	// Potions
	private healPotionButton!: Konva.Group;
	private skipQuestionPotionButton!: Konva.Group;

	// Creates whole help screen
	constructor({onBack}: HelpCallbacks) {
		this.group = new Konva.Group({visible: false}); // Root group

		// Steps of the tutorial
		this.steps = [
			{
				x: stageWidth * 0.4,
				y: stageHeight * 0.4,
				text: 'Welcome! This quick tutorial will teach you how to play.',
			},
			{
				x: stageWidth * 0.3,
				y: stageHeight * 0.1,
				text: 'At the top is your question bar. Solve each math question quickly!',
			},
			{
				x: stageWidth * 0.02,
				y: stageHeight * 0.1,
				text: 'Your health and current round is shown here.',
			},
			{
				x: stageWidth * 0.1,
				y: stageHeight * 0.4,
				text: 'This is a monster, they move along this path toward your tower.',
			},
			{
				x: stageWidth * 0.65,
				y: stageHeight * 0.6,
				text: 'This is your tower. Protect it by answering questions correctly before a monster gets here!',
			},
			{
				x: stageWidth * 0.4,
				y: stageHeight * 0.9,
				text: 'Type your answer in the box below the game screen.',
			},
			{
				x: stageWidth * 0.75,
				y: stageHeight * 0.8,
				text: "Use the heal and skip potions to help you when you're in trouble.",
			},
			{
				x: stageWidth * 0.6,
				y: stageHeight * 0.8,
				text: "That's the basics! Click Finish to return to the menu.",
			},
		];

		// Build the help screen
		this.createBackground();
		this.createPath();
		this.createHud();
		this.createPotion();
		this.createTower();
		this.createBubble();
		this.createNextButton(onBack);
		this.updateStep();
	}

	// View Methods (show/hide)
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

	// Create Background
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

	// Create Path
	private createPath(): void {
		const pathDefinition = [
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

		// Flatten path into 2-d
		const pathPoints = pathDefinition.flatMap((p) => [p.x, p.y]);

		// Draws path
		const path = new Konva.Line({
			points: pathPoints,
			stroke: '#8C8C8C',
			strokeWidth: 42,
			lineCap: 'square',
			lineJoin: 'miter',
		});

		this.group.add(path);

		// Create One Monster
		const monster = new Konva.Rect({
			x: pathDefinition[3].x,
			y: pathDefinition[3].y,
			width: 30,
			height: 30,
			offsetX: 15,
			offsetY: 15,
			fill: 'red',
		});

		this.group.add(monster);
	}

	// Create green grass
	private createHud(): void {
		const topLeftBar = new Konva.Rect({
			x: stageWidth * 0.01,
			y: stageHeight * 0.043,
			width: 430,
			height: 54,
			fill: '#143F09',
		});
		this.group.add(topLeftBar);

		// Health text
		const healthIndicator = new Konva.Text({
			x: stageWidth * 0.13,
			y: stageHeight * 0.046,
			text: 'Health: 100',
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'white',
		});
		this.group.add(healthIndicator);

		// Round text
		const roundIndicator = new Konva.Text({
			x: stageWidth * 0.02,
			y: stageHeight * 0.048,
			text: 'Round: 1',
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'white',
		});
		this.group.add(roundIndicator);

		// Question bar
		const questionBar = new Konva.Rect({
			x: stageWidth * 0.275,
			y: stageHeight * 0.043,
			width: 800,
			height: 54,
			fill: 'white',
		});
		this.group.add(questionBar);

		// Question text
		const questionPrompt = new Konva.Text({
			x: stageWidth * 0.283,
			y: stageHeight * 0.047,
			text: '2(x + 2) = 8',
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'black',
		});
		this.group.add(questionPrompt);

		// Tower ground area
		const sideBar = new Konva.Rect({
			x: stageWidth * 0.82,
			y: 0,
			width: stageWidth * 0.18,
			height: stageHeight,
			fill: '#8B6A3E',
		});
		this.group.add(sideBar);

		// Tower text
		const towerLabel = new Konva.Text({
			x: stageWidth * 0.881,
			y: stageHeight * 0.035,
			text: 'Tower',
			fontSize: 51,
			fontFamily: 'Jersey 10',
			fill: 'black',
		});
		this.group.add(towerLabel);
	}

	// Create Tower Image
	private createTower(): void {
		const towerWidth = 400;
		const towerHeight = 800;
		const towerX = stageWidth * 0.79;
		const towerY = stageHeight * 0.1;

		Konva.Image.fromURL('/gamescreen_images/tower5.png', (img) => {
			img.x(towerX);
			img.y(towerY);
			img.width(towerWidth);
			img.height(towerHeight);
			this.group.add(img);
		});
	}

	private createPotion(): void {
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

	// Create Bubble
	private createBubble(): void {
		this.bubbleGroup = new Konva.Group();
		this.group.add(this.bubbleGroup);

		// Rectangle bubble
		this.bubbleRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: 400,
			height: 120,
			fill: 'white',
			stroke: '#143F09',
			strokeWidth: 3,
			cornerRadius: 12,
			shadowBlur: 10,
		});

		// Bubble text
		this.bubbleText = new Konva.Text({
			x: 16,
			y: 16,
			width: 360,
			fontSize: 28,
			lineHeight: 1.2,
			fontFamily: 'Jersey 10',
			fill: '#143F09',
		});

		this.bubbleGroup.add(this.bubbleRect, this.bubbleText);
	}

	// Update Steps
	private updateStep(): void {
		// Current step
		const step = this.steps[this.currentStep];

		// Moves position
		this.bubbleGroup.position({
			x: step.x,
			y: step.y,
		});

		// Gets text
		this.bubbleText.text(step.text);

		// Resize bubble to fit text
		const padding = 20;
		const textWidth = this.bubbleText.width();
		const textHeight = this.bubbleText.height();
		this.bubbleRect.width(textWidth + padding);
		this.bubbleRect.height(textHeight + padding);

		this.group.getLayer()?.batchDraw();
	}

	// Next Button
	private createNextButton(onBack: () => void): void {
		const btnWidth = 200;
		const btnHeight = 70;

		// Group containing next button
		const btn = new Konva.Group({
			x: stageWidth - btnWidth - 400,
			y: stageHeight - btnHeight - 40,
		});

		// Button rectangle
		const rect = new Konva.Rect({
			width: btnWidth,
			height: btnHeight,
			fill: '#143F09',
			cornerRadius: 12,
		});

		// Button Label
		const label = new Konva.Text({
			width: btnWidth,
			height: btnHeight,
			align: 'center',
			verticalAlign: 'middle',
			text: 'Next',
			fontSize: 32,
			fontFamily: 'Jersey 10',
			fill: 'white',
		});

		btn.add(rect, label);

		btn.on('mouseup', () => {
			if (this.currentStep < this.steps.length - 1) {
				this.currentStep++;
				this.updateStep();

				// Last step change button to finish
				if (this.currentStep === this.steps.length - 1) {
					label.text('Finish');
				}
			} else {
				this.currentStep = 0;
				label.text('Next');
				this.updateStep();
				onBack();
			}
		});

		btn.on('mouseenter', () => {
			document.body.style.cursor = 'pointer';
		});
		btn.on('mouseleave', () => {
			document.body.style.cursor = 'default';
		});

		this.group.add(btn);
	}
}

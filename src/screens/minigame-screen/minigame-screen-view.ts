import Konva from 'konva';
import type {View} from '../../types.ts';
import {stageWidth, stageHeight} from '../../constants.ts';
import type {MinigameViewState} from './minigame-screen-model.ts';

export class MinigameScreenView implements View {
	private readonly group: Konva.Group;
	private get jerseyFont(): string {
		return 'Jersey 10';
	}

	private header!: Konva.Rect;
	private prefixText!: Konva.Text;
	private highlightedText!: Konva.Text;
	private suffixText!: Konva.Text;
	private readonly potionImages: Konva.Image[] = [];
	private readonly answerGroups: Konva.Group[] = [];
	private readonly answerTextNodes: Konva.Text[] = [];

	constructor() {
		this.group = new Konva.Group({visible: false});
		void document.fonts.load('24px "Jersey 10"');

		this.buildBackground();
		this.buildQuestionHeader();
		this.buildPotionsRow();
		this.buildAnswerGrid();
		this.layout(stageWidth, stageHeight);
	}

	updateQuestion(question: MinigameViewState['question']): void {
		this.prefixText.text(question.prefix);
		this.highlightedText.text(question.highlighted);
		this.suffixText.text(question.suffix);
		this.prefixText.position({x: this.header.x() + 12, y: this.header.y() + 8});
		this.highlightedText.position({
			x: this.prefixText.x() + this.prefixText.width(),
			y: this.prefixText.y(),
		});
		this.suffixText.position({
			x: this.highlightedText.x() + this.highlightedText.width() + 6,
			y: this.prefixText.y(),
		});
		this.group.getLayer()?.draw();
	}

	async updatePotions(potions: MinigameViewState['potions']): Promise<void> {
		const scale = 0.8;
		const count = Math.min(this.potionImages.length, potions.length);
		const elements = await Promise.all(
			potions.slice(0, count).map(async (p) => this.loadHtmlImage(p.url)),
		);
		for (let i = 0; i < count; i++) {
			const node = this.potionImages[i];
			node.image(elements[i]);
			node.offsetX(node.width() / 2);
			node.offsetY(node.height() / 2);
			node.scale({x: scale, y: scale});
		}

		this.group.getLayer()?.draw();
	}

	updateAnswers(
		answers: MinigameViewState['answers'],
		onSelect: (index: number) => void,
	): void {
		const palette = ['#6f8c1a', '#e39a3a', '#cfa6cf', '#b5c3d3'];
		for (let i = 0; i < this.answerGroups.length && i < answers.length; i++) {
			const group = this.answerGroups[i];
			const rect = group.findOne<Konva.Rect>('Rect');
			const textNode = this.answerTextNodes[i];
			if (rect) rect.fill(palette[i % palette.length]);
			textNode.text(answers[i].label);
			textNode.offsetX(textNode.width() / 2);
			group.off('click');
			group.on('click', () => {
				onSelect(i);
			});
		}

		this.group.getLayer()?.draw();
	}

	layout(width: number, height: number): void {
		const headerWidth = Math.round(width * 0.4);
		this.header.width(headerWidth);
		this.header.position({x: width / 2 - Math.round(width * 0.2), y: 20});

		this.prefixText.position({x: this.header.x() + 12, y: this.header.y() + 8});
		this.highlightedText.position({
			x: this.prefixText.x() + this.prefixText.width(),
			y: this.prefixText.y(),
		});
		this.suffixText.position({
			x: this.highlightedText.x() + this.highlightedText.width() + 6,
			y: this.prefixText.y(),
		});

		const potionY = Math.round(height * 0.2);
		const spacing = 220;
		const centerX = width / 2;
		const leftStart = centerX - spacing;
		const xs = [leftStart, centerX, centerX + spacing];
		for (let i = 0; i < this.potionImages.length; i++) {
			this.potionImages[i].position({x: xs[i], y: potionY});
		}

		const btnW = 240;
		const btnH = 70;
		const gapX = 80;
		const gapY = 35;
		const firstRowY = 420;
		const gridLeft = centerX - (btnW + gapX / 2);
		for (let i = 0; i < this.answerGroups.length; i++) {
			const col = i % 2;
			const row = Math.floor(i / 2);
			const g = this.answerGroups[i];
			const rect = g.findOne<Konva.Rect>('Rect');
			if (rect) {
				rect.position({
					x: gridLeft + col * (btnW + gapX),
					y: firstRowY + row * (btnH + gapY),
				});
				rect.size({width: btnW, height: btnH});
			}

			const txt = this.answerTextNodes[i];
			txt.position({
				x: (rect?.x() ?? 0) + btnW / 2,
				y: (rect?.y() ?? 0) + btnH / 2 - 12,
			});
			txt.offsetX(txt.width() / 2);
		}

		this.group.getLayer()?.draw();
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

	private buildBackground(): void {
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
			fill: '#b5b5b5',
		});
		this.group.add(bg);
	}

	private buildQuestionHeader(): void {
		this.header = new Konva.Rect({
			x: 0,
			y: 0,
			width: 0,
			height: 40,
			fill: '#ffffff',
			cornerRadius: 4,
		});
		this.group.add(this.header);
		this.prefixText = new Konva.Text({
			x: 0,
			y: 0,
			text: '',
			fontSize: 24,
			fontFamily: `${this.jerseyFont}, Arial`,
			fill: '#000',
		});
		this.group.add(this.prefixText);
		this.highlightedText = new Konva.Text({
			x: 0,
			y: 0,
			text: '',
			fontSize: 24,
			fontFamily: `${this.jerseyFont}, Arial`,
			fill: '#e53b40',
			fontStyle: 'bold',
		});
		this.group.add(this.highlightedText);
		this.suffixText = new Konva.Text({
			x: 0,
			y: 0,
			text: '',
			fontSize: 24,
			fontFamily: `${this.jerseyFont}, Arial`,
			fill: '#000',
		});
		this.group.add(this.suffixText);
	}

	private buildPotionsRow(): void {
		for (let i = 0; i < 3; i++) {
			const img = new Konva.Image();
			this.potionImages.push(img);
			this.group.add(img);
		}
	}

	private buildAnswerGrid(): void {
		for (let i = 0; i < 4; i++) {
			const g = new Konva.Group();
			const rect = new Konva.Rect({
				x: 0,
				y: 0,
				width: 240,
				height: 70,
				fill: '#ddd',
				cornerRadius: 8,
				stroke: '#6b6b6b',
				strokeWidth: 2,
			});
			const txt = new Konva.Text({
				x: 0,
				y: 0,
				text: '',
				fontSize: 28,
				fontFamily: `${this.jerseyFont}, Arial`,
				fill: '#3b1a16',
				align: 'center',
			});
			g.add(rect);
			g.add(txt);
			this.answerGroups.push(g);
			this.answerTextNodes.push(txt);
			this.group.add(g);
		}
	}

	private async loadHtmlImage(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.addEventListener('load', () => {
				resolve(img);
			});
			img.addEventListener('error', () => {
				reject(new Error('Failed to load image'));
			});
			img.src = url;
		});
	}
}

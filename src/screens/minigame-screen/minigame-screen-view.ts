import Konva from 'konva';
import type {View} from '../../types.ts';
import {stageWidth, stageHeight} from '../../constants.ts';

type ButtonSpec = {
	text: string;
	background: string;
	position: {x: number; y: number};
	width: number;
	height: number;
	onClick: () => void;
};

/**
 * MinigameScreenView - Renders the math potion minigame UI
 */
export class MinigameScreenView implements View {
	private readonly group: Konva.Group;

	constructor(options: {
		questionPrefix: string;
		highlighted: string;
		questionSuffix: string;
		answers: Array<{label: string; onClick: () => void; bg: string}>;
	}) {
		this.group = new Konva.Group({visible: false});

		// Background (subtle gray as in mock)
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
			fill: '#b5b5b5',
		});
		this.group.add(bg);

		const jerseyFont = 'Jersey 10';
		void document.fonts.load('24px "Jersey 10"');

		// White banner for the question
		const header = new Konva.Rect({
			x: stageWidth / 2 - Math.round(stageWidth * 0.2),
			y: 20,
			width: Math.round(stageWidth * 0.4),
			height: 40,
			fill: '#ffffff',
			cornerRadius: 4,
		});
		this.group.add(header);

		// Compose question text
		const prefixText = new Konva.Text({
			x: header.x() + 12,
			y: header.y() + 8,
			text: options.questionPrefix,
			fontSize: 24,
			fontFamily: `${jerseyFont}, Arial`,
			fill: '#000',
		});
		this.group.add(prefixText);

		const highlightedText = new Konva.Text({
			x: prefixText.x() + prefixText.width(),
			y: prefixText.y(),
			text: options.highlighted,
			fontSize: 24,
			fontFamily: `${jerseyFont}, Arial`,
			fill: '#e53b40',
			fontStyle: 'bold',
		});
		this.group.add(highlightedText);

		const suffixText = new Konva.Text({
			x: highlightedText.x() + highlightedText.width() + 6,
			y: prefixText.y(),
			text: options.questionSuffix,
			fontSize: 24,
			fontFamily: `${jerseyFont}, Arial`,
			fill: '#000',
		});
		this.group.add(suffixText);

		const potionY = Math.round(stageHeight * 0.2);
		const potionScale = 0.8; // Make potions a bit smaller on larger canvases
		const spacing = 220;
		const centerX = stageWidth / 2;
		const leftStart = centerX - spacing;

		const addPotion = (url: string, x: number): void => {
			Konva.Image.fromURL(url, (image) => {
				image.position({x, y: potionY});
				image.offsetX(image.width() / 2);
				image.offsetY(image.height() / 2);
				image.scale({x: potionScale, y: potionScale});
				this.group.add(image);
				this.group.getLayer()?.draw();
			});
		};

		addPotion('/red_potion.png', leftStart);
		addPotion('/green_potion.png', centerX);
		addPotion('/blue_potion.png', centerX + spacing);

		// Answer buttons grid (2x2)
		const btnW = 240;
		const btnH = 70;
		const gapX = 80;
		const gapY = 35;
		const firstRowY = 420;
		const gridLeft = centerX - (btnW + gapX / 2);

		const palette = ['#6f8c1a', '#e39a3a', '#cfa6cf', '#b5c3d3'];
		const textColor = '#3b1a16';

		const specs: ButtonSpec[] = options.answers.map((ans, i) => {
			const col = i % 2;
			const row = Math.floor(i / 2);
			return {
				text: ans.label,
				background: ans.bg,
				position: {
					x: gridLeft + col * (btnW + gapX),
					y: firstRowY + row * (btnH + gapY),
				},
				width: btnW,
				height: btnH,
				onClick: ans.onClick,
			};
		});

		// If caller did not supply custom colors, use default palette
		for (const [i, spec] of specs.entries()) {
			if (!options.answers[i].bg) {
				spec.background = palette[i % palette.length];
			}
		}

		for (const spec of specs) {
			const btnGroup = new Konva.Group();
			const rect = new Konva.Rect({
				x: spec.position.x,
				y: spec.position.y,
				width: spec.width,
				height: spec.height,
				fill: spec.background,
				cornerRadius: 8,
				stroke: '#6b6b6b',
				strokeWidth: 2,
			});
			btnGroup.add(rect);
			const txt = new Konva.Text({
				x: rect.x() + rect.width() / 2,
				y: rect.y() + rect.height() / 2 - 12,
				text: spec.text,
				fontSize: 28,
				fontFamily: `${jerseyFont}, Arial`,
				fill: textColor,
				align: 'center',
			});
			txt.offsetX(txt.width() / 2);
			btnGroup.add(txt);
			btnGroup.on('click', spec.onClick);
			this.group.add(btnGroup);
		}
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
}

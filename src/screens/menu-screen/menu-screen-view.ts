import Konva from 'konva';
import type {View} from '../../types.ts';
import {stageWidth, stageHeight} from '../../constants.ts';

type MenuCallbacks = {
	onPlay: () => void;
	onMiniGame: () => void;
	onHelp: () => void;
};

export class MenuScreenView implements View {
	private readonly group: Konva.Group;

	constructor({onPlay, onMiniGame, onHelp}: MenuCallbacks) {
		this.group = new Konva.Group({visible: true});

		const bgBase = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
			fill: '#F4E4BC',
		});

		const bgTex = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
		});

		const img = new Image();
		img.src = '/images/main-menu/background.png';
		img.addEventListener('load', () => {
			bgTex.fillPatternImage(img);
		});

		this.group.add(bgBase, bgTex);

		const cx = stageWidth / 2;
		const cy = 0;
		const leftX = cx - 800;
		const rightX = cx + 800;
		const path = ` M ${leftX} ${cy + 400} Q ${cx} ${cy - 10} ${rightX} ${cy + 400}`;

		const title = new Konva.TextPath({
			x: 0,
			y: 0,
			text: 'Tower Defense',
			data: path,
			fontSize: 250,
			fontFamily: `'Jersey 10', sans-serif`,
			fill: '#5B2A12',
			align: 'center',
			listening: false,
		});

		this.group.add(title);

		const buttonWidth = 480;
		const buttonHeight = 130;
		const gap = 60;
		const startY = 400;

		const makeButton = (
			label: string,
			y: number,
			fill: string,
			stroke: string,
			onClick: () => void,
		) => {
			const g = new Konva.Group({x: 0, y});

			const rect = new Konva.Rect({
				x: cx - buttonWidth / 2,
				y: 0,
				width: buttonWidth,
				height: buttonHeight,
				cornerRadius: 8,
				fill,
				stroke,
				strokeWidth: 3,
				shadowColor: 'rgba(0,0,0,0.3)',
				shadowBlur: 8,
				shadowOffset: {x: 0, y: 2},
				shadowOpacity: 0.5,
			});

			const text = new Konva.Text({
				x: cx,
				y: buttonHeight / 2 - 40,
				text: label,
				fontSize: 90,
				fontStyle: 'bold',
				fontFamily: `'Jersey 10', sans-serif`,
				fill: '#36150E',
				align: 'center',
			});

			text.offsetX(text.width() / 2);

			g.on('mouseenter', () => {
				document.body.style.cursor = 'pointer';
				g.getLayer()?.batchDraw();
			});
			g.on('mouseleave', () => {
				document.body.style.cursor = 'default';
				g.getLayer()?.batchDraw();
			});
			g.on('mousedown', () => {
				rect.y(2);
				g.getLayer()?.batchDraw();
			});
			g.on('mouseup', () => {
				rect.y(0);
				g.getLayer()?.batchDraw();
				onClick();
			});

			g.add(rect, text);
			return g;
		};

		const playBtn = makeButton('PLAY', startY, '#6E8E43', '#3E5B2C', onPlay);

		const miniBtn = makeButton(
			'MINI GAME',
			startY + buttonHeight + gap,
			'#D98B3B',
			'#A65E17',
			onMiniGame,
		);

		const helpBtn = makeButton(
			'HELP',
			startY + 2 * (buttonHeight + gap),
			'#C7B0CF',
			'#8B6D99',
			onHelp,
		);

		this.group.add(playBtn, miniBtn, helpBtn);
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

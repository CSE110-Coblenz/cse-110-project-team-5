import Konva from "konva";
import type { View } from "../../types.ts";
import { stageWidth, stageHeight } from "../../constants.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private lemonImage: Konva.Image | Konva.Circle | null = null;
	private scoreText: Konva.Text;
	private timerText: Konva.Text;

	constructor(onLemonClick: () => void) {
		this.group = new Konva.Group({ visible: false });

		// Background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: stageWidth,
			height: stageHeight,
			fill: "#87CEEB", // Sky blue
		});
		this.group.add(bg);

		// Score display (top-left)
		this.scoreText = new Konva.Text({
			x: 20,
			y: 20,
			text: "Score: 0",
			fontSize: 32,
			fontFamily: "Arial",
			fill: "black",
		});
		this.group.add(this.scoreText);

		// Timer display (top-right)
		this.timerText = new Konva.Text({
			x: stageWidth - 150,
			y: 20,
			text: "Time: 60",
			fontSize: 32,
			fontFamily: "Arial",
			fill: "red",
		});
		this.group.add(this.timerText);

		Konva.Image.fromURL("/lemon.png", (image) => {
			image.setPosition({
				x: stageWidth / 2,
				y: stageHeight / 2,
			});
			image.offsetX(image.width() / 2);
			image.offsetY(image.height() / 2);
			image.on("click", onLemonClick);
			this.lemonImage = image;
			this.group.add(this.lemonImage);
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

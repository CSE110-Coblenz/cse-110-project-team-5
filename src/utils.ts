import Konva from 'konva';

export function createButton(
	x: number,
	y: number,
	width: number,
	height: number,
	text: string,
	color: string,
): Konva.Group {
	const buttonGroup = new Konva.Group({
		x,
		y,
	});

	const rect = new Konva.Rect({
		width,
		height,
		fill: color,
		cornerRadius: 15, // Slightly more rounded like main menu
		stroke: '#5C3317', // Brown border like main menu buttons
		strokeWidth: 3,
	});

	const label = new Konva.Text({
		width,
		height,
		text,
		fontSize: 36,
		fontFamily: 'Jersey 10',
		fill: '#2C1810', // Dark brown text like main menu
		align: 'center',
		verticalAlign: 'middle',
	});

	buttonGroup.add(rect, label);

	// Hover effects
	buttonGroup.on('mouseenter', () => {
		document.body.style.cursor = 'pointer';
		rect.fill(lightenColor(color));
		buttonGroup.getLayer()?.draw();
	});

	buttonGroup.on('mouseleave', () => {
		document.body.style.cursor = 'default';
		rect.fill(color);
		buttonGroup.getLayer()?.draw();
	});

	return buttonGroup;
}

function lightenColor(color: string): string {
	// Lighten colors on hover
	const colorMap: Record<string, string> = {};
	colorMap['#6B8E4E'] = '#7FA05C'; // Lighter green
	colorMap['#B8A8D4'] = '#C8B8E4'; // Lighter purple
	return colorMap[color] || color;
}

export class Timer {
	private readonly callback: () => void;
	private remainingDuration: number;
	private startTime: number;
	private timeoutId: number;
	private done: boolean;

	constructor(callback: () => void, duration: number) {
		this.callback = () => {
			this.done = true;
			callback();
		};

		this.remainingDuration = duration;
		this.done = duration < 0;

		this.startTime = Date.now();
		this.timeoutId = setTimeout(this.callback, this.remainingDuration);
	}

	public pause(): void {
		if (this.done) return;
		clearTimeout(this.timeoutId);
		this.remainingDuration -= Date.now() - this.startTime;
	}

	public resume(): void {
		if (this.done) return;
		this.startTime = Date.now();
		this.timeoutId = setTimeout(this.callback, this.remainingDuration);
	}
}

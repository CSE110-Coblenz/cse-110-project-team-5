import Konva from "konva";
import type { View } from "../../types.ts";
import { stageWidth, stageHeight } from "../../constants.ts";
import type { MinigameViewState } from "./minigame-screen-model.ts";

export class MinigameScreenView implements View {
  private readonly group: Konva.Group;
  private get jerseyFont(): string {
    return "Jersey 10";
  }

  private header!: Konva.Rect;
  private prefixText!: Konva.Text;
  private highlightedText!: Konva.Text;
  private suffixText!: Konva.Text;
  private readonly potionImages: Konva.Image[] = [];
  private readonly answerGroups: Konva.Group[] = [];
  private readonly answerRects: Konva.Rect[] = [];
  private readonly answerTextNodes: Konva.Text[] = [];
  private readonly answerBasePositions: Array<{
    rectY: number;
    textY: number;
  }> = [];

  private readonly answerBaseFills = [
    "#6E8E43",
    "#D98B3B",
    "#C7B0CF",
    "#B5C3D3",
  ];

  private readonly answerStrokeFills = [
    "#3E5B2C",
    "#A65E17",
    "#8B6D99",
    "#6B7785",
  ];

  private backButtonGroup!: Konva.Group;
  private backButtonRect!: Konva.Rect;
  private backButtonText!: Konva.Text;
  private backButtonBaseY = 0;
  private backButtonTextBaseY = 0;

  private hudBackground!: Konva.Rect;
  private scoreValueText!: Konva.Text;
  private questionValueText!: Konva.Text;
  private feedbackText!: Konva.Text;

  constructor() {
    this.group = new Konva.Group({ visible: false });
    void document.fonts.load('24px "Jersey 10"');

    this.buildBackground();
    this.buildQuestionHeader();
    this.buildHud();
    this.buildBackButton();
    this.buildPotionsRow();
    this.buildAnswerGrid();
    this.layout(stageWidth, stageHeight);
  }

  updateQuestion(question: MinigameViewState["question"]): void {
    this.prefixText.text(question.prefix);
    this.highlightedText.text(question.highlighted);
    this.suffixText.text(question.suffix);
    this.prefixText.position({
      x: this.header.x() + 12,
      y: this.header.y() + 8,
    });
    this.highlightedText.position({
      x: this.prefixText.x() + this.prefixText.width(),
      y: this.prefixText.y(),
    });
    this.suffixText.position({
      x: this.highlightedText.x() + this.highlightedText.width() + 6,
      y: this.prefixText.y(),
    });
    this.clearFeedback();
    this.group.getLayer()?.draw();
  }

  async updatePotions(potions: MinigameViewState["potions"]): Promise<void> {
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
      node.scale({ x: scale, y: scale });
    }

    this.group.getLayer()?.draw();
  }

  updateAnswers(
    answers: MinigameViewState["answers"],
    onSelect: (index: number) => void,
  ): void {
    for (let i = 0; i < this.answerGroups.length; i++) {
      const group = this.answerGroups[i];
      const rect = this.answerRects[i];
      const textNode = this.answerTextNodes[i];
      group.off();

      if (!rect || !textNode) {
        continue;
      }

      if (i >= answers.length) {
        group.visible(false);
        continue;
      }

      group.visible(true);
      rect.fill(this.answerBaseFills[i % this.answerBaseFills.length]);
      rect.opacity(1);
      textNode.text(answers[i].label);
      textNode.offsetX(textNode.width() / 2);

      const handleSelect = () => {
        if (!group.listening()) return;
        onSelect(i);
      };

      const release = (): void => {
        this.setButtonPressed(i, false);
        rect.shadowOffset({ x: 0, y: 6 });
        group.getLayer()?.batchDraw();
      };

      group.on("click", handleSelect);
      group.on("tap", handleSelect);
      group.on("mouseenter", () => {
        if (!group.listening()) return;
        document.body.style.cursor = "pointer";
        rect.shadowOffset({ x: 0, y: 8 });
        group.getLayer()?.batchDraw();
      });
      group.on("mouseleave", () => {
        document.body.style.cursor = "default";
        this.setButtonPressed(i, false);
        rect.shadowOffset({ x: 0, y: 6 });
        group.getLayer()?.batchDraw();
      });
      group.on("mousedown", () => {
        if (!group.listening()) return;
        this.setButtonPressed(i, true);
        rect.shadowOffset({ x: 0, y: 3 });
        group.getLayer()?.batchDraw();
      });
      group.on("mouseup", release);
      group.on("touchstart", () => {
        if (!group.listening()) return;
        this.setButtonPressed(i, true);
        rect.shadowOffset({ x: 0, y: 3 });
        group.getLayer()?.batchDraw();
      });
      group.on("touchend", release);
      group.on("touchcancel", release);
    }

    this.resetAnswerStyles();
    this.setButtonsEnabled(true);
    this.group.getLayer()?.draw();
  }

  setBackButtonHandler(onClick: () => void): void {
    if (!this.backButtonGroup || !this.backButtonRect || !this.backButtonText) {
      return;
    }

    const group = this.backButtonGroup;
    const rect = this.backButtonRect;

    const handleActivate = (): void => {
      if (!group.listening()) return;
      onClick();
    };

    const release = (): void => {
      this.setBackButtonPressed(false);
      rect.shadowOffset({ x: 0, y: 6 });
      group.getLayer()?.batchDraw();
    };

    group.off();
    group.on("click", handleActivate);
    group.on("tap", handleActivate);
    group.on("mouseenter", () => {
      if (!group.listening()) return;
      document.body.style.cursor = "pointer";
      rect.shadowOffset({ x: 0, y: 8 });
      group.getLayer()?.batchDraw();
    });
    group.on("mouseleave", () => {
      document.body.style.cursor = "default";
      this.setBackButtonPressed(false);
      rect.shadowOffset({ x: 0, y: 6 });
      group.getLayer()?.batchDraw();
    });
    group.on("mousedown", () => {
      if (!group.listening()) return;
      this.setBackButtonPressed(true);
      rect.shadowOffset({ x: 0, y: 3 });
      group.getLayer()?.batchDraw();
    });
    group.on("mouseup", release);
    group.on("touchstart", () => {
      if (!group.listening()) return;
      this.setBackButtonPressed(true);
      rect.shadowOffset({ x: 0, y: 3 });
      group.getLayer()?.batchDraw();
    });
    group.on("touchend", release);
    group.on("touchcancel", release);
  }

  layout(width: number, height: number): void {
    const headerWidth = Math.round(width * 0.4);
    this.header.width(headerWidth);
    this.header.height(height * 0.05);
    this.header.position({ x: width / 2 - Math.round(width * 0.2), y: 20 });

    this.prefixText.position({
      x: this.header.x() + 12,
      y: this.header.y() + 8,
    });
    this.highlightedText.position({
      x: this.prefixText.x() + this.prefixText.width(),
      y: this.prefixText.y(),
    });
    this.suffixText.position({
      x: this.highlightedText.x() + this.highlightedText.width() + 6,
      y: this.prefixText.y(),
    });

    const hudWidth = Math.round(width * 0.32);
    const hudHeight = 80;
    const hudX = width / 2 - hudWidth / 2;
    const hudY = this.header.y() + this.header.height() + 16;

    this.hudBackground.size({ width: hudWidth, height: hudHeight });
    this.hudBackground.position({ x: hudX, y: hudY });

    this.scoreValueText.position({
      x: hudX + 20,
      y: hudY + 15,
    });
    this.questionValueText.position({
      x: hudX + 20,
      y: this.scoreValueText.y() + 28,
    });

    this.feedbackText.width(hudWidth - 40);
    this.feedbackText.position({
      x: hudX + 100,
      y: this.questionValueText.y() - 20,
    });
    this.feedbackText.offsetX(0);

    const backBtnWidth = 200;
    const backBtnHeight = 60;
    const backBtnX = backBtnWidth + 40;
    const backBtnY = backBtnHeight - hudY / 2;

    this.backButtonRect.position({ x: backBtnX, y: backBtnY });
    this.backButtonRect.size({ width: backBtnWidth, height: backBtnHeight });
    this.backButtonText.position({
      x: backBtnX + backBtnWidth / 2,
      y: backBtnY + backBtnHeight / 2 - 14,
    });
    this.backButtonText.offsetX(this.backButtonText.width() / 2);

    this.backButtonBaseY = backBtnY;
    this.backButtonTextBaseY = this.backButtonText.y();

    const potionY = Math.min(hudY + hudHeight + 120, height * 0.55);
    const spacing = 220;
    const centerX = width / 2;
    const leftStart = centerX - spacing;
    const xs = [leftStart, centerX, centerX + spacing];
    for (let i = 0; i < this.potionImages.length; i++) {
      this.potionImages[i].position({ x: xs[i], y: potionY });
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
      const rect = this.answerRects[i];
      if (rect) {
        rect.position({
          x: gridLeft + col * (btnW + gapX),
          y: firstRowY + row * (btnH + gapY),
        });
        rect.size({ width: btnW, height: btnH });
      }

      const txt = this.answerTextNodes[i];
      txt.position({
        x: (rect?.x() ?? 0) + btnW / 2,
        y: (rect?.y() ?? 0) + btnH / 2 - 21,
      });
      txt.offsetX(txt.width() / 2);

      this.answerBasePositions[i] = {
        rectY: rect?.y() ?? 0,
        textY: txt.y(),
      };
    }

    this.group.getLayer()?.draw();
  }

  updateScoreboard(score: number, questionNumber: number): void {
    this.scoreValueText.text(`Score: ${score}`);
    this.questionValueText.text(`Question ${questionNumber}`);
    this.group.getLayer()?.draw();
  }

  showAnswerFeedback(selectedIndex: number, correctIndex: number): void {
    for (let i = 0; i < this.answerRects.length; i++) {
      const rect = this.answerRects[i];
      if (!rect) continue;

      if (i === correctIndex) {
        rect.fill("#5CB85C");
        rect.stroke("#3E5B2C");
      } else if (i === selectedIndex) {
        rect.fill("#E57373");
        rect.stroke("#9E2D2D");
      } else {
        rect.fill(this.answerBaseFills[i % this.answerBaseFills.length]);
        rect.stroke(this.answerStrokeFills[i % this.answerStrokeFills.length]);
      }
    }

    this.group.getLayer()?.draw();
  }

  resetAnswerStyles(): void {
    for (let i = 0; i < this.answerRects.length; i++) {
      const rect = this.answerRects[i];
      const base = this.answerBasePositions[i];
      const textNode = this.answerTextNodes[i];
      if (!rect || !base || !textNode) continue;

      rect.fill(this.answerBaseFills[i % this.answerBaseFills.length]);
      rect.stroke(this.answerStrokeFills[i % this.answerStrokeFills.length]);
      rect.shadowOffset({ x: 0, y: 6 });
      this.setButtonPressed(i, false);
      textNode.y(base.textY);
    }

    this.group.getLayer()?.draw();
  }

  setButtonsEnabled(enabled: boolean): void {
    for (let i = 0; i < this.answerGroups.length; i++) {
      const group = this.answerGroups[i];
      const rect = this.answerRects[i];
      const textNode = this.answerTextNodes[i];
      group.listening(enabled);
      if (rect) rect.opacity(enabled ? 1 : 0.6);
      if (textNode) textNode.opacity(enabled ? 1 : 0.6);
    }

    if (!enabled) {
      document.body.style.cursor = "default";
    }
  }

  showFeedback(message: string, color: string): void {
    this.feedbackText.text(message);
    this.feedbackText.fill(color);
    this.group.getLayer()?.draw();
  }

  clearFeedback(): void {
    this.feedbackText.text("");
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

  private setButtonPressed(index: number, pressed: boolean): void {
    const base = this.answerBasePositions[index];
    const rect = this.answerRects[index];
    const textNode = this.answerTextNodes[index];
    if (!base || !rect || !textNode) return;

    const offset = pressed ? 3 : 0;
    rect.y(base.rectY + offset);
    textNode.y(base.textY + offset);
  }

  private setBackButtonPressed(pressed: boolean): void {
    if (!this.backButtonRect || !this.backButtonText) {
      return;
    }

    const offset = pressed ? 3 : 0;
    this.backButtonRect.y(this.backButtonBaseY + offset);
    this.backButtonText.y(this.backButtonTextBaseY + offset);
  }

  private buildBackground(): void {
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: stageWidth,
      height: stageHeight,
      fill: "#b5b5b5",
    });
    this.group.add(bg);
  }

  private buildQuestionHeader(): void {
    this.header = new Konva.Rect({
      x: 0,
      y: 0,
      width: 0,
      height: 40,
      fill: "#ffffff",
      cornerRadius: 4,
    });
    this.group.add(this.header);
    this.prefixText = new Konva.Text({
      x: 0,
      y: 0,
      text: "",
      fontSize: 36,
      fontFamily: `${this.jerseyFont}, Arial`,
      fill: "#000",
    });
    this.group.add(this.prefixText);
    this.highlightedText = new Konva.Text({
      x: 0,
      y: 0,
      text: "",
      fontSize: 36,
      fontFamily: `${this.jerseyFont}, Arial`,
      fill: "#e53b40",
      fontStyle: "bold",
    });
    this.group.add(this.highlightedText);
    this.suffixText = new Konva.Text({
      x: 0,
      y: 0,
      text: "",
      fontSize: 36,
      fontFamily: `${this.jerseyFont}, Arial`,
      fill: "#000",
    });
    this.group.add(this.suffixText);
  }

  private buildHud(): void {
    this.hudBackground = new Konva.Rect({
      x: 0,
      y: 0,
      width: 240,
      height: 130,
      fill: "#ffffff",
      cornerRadius: 4,
    });
    this.group.add(this.hudBackground);

    this.scoreValueText = new Konva.Text({
      x: 0,
      y: 0,
      text: "Score: 0",
      fontSize: 32,
      fontFamily: `${this.jerseyFont}, Arial`,
      fill: "#000000",
    });
    this.group.add(this.scoreValueText);

    this.questionValueText = new Konva.Text({
      x: 0,
      y: 0,
      text: "Question 1",
      fontSize: 32,
      fontFamily: `${this.jerseyFont}, Arial`,
      fill: "#000000",
    });
    this.group.add(this.questionValueText);

    this.feedbackText = new Konva.Text({
      x: 0,
      y: 0,
      text: "",
      fontSize: 36,
      fontFamily: `${this.jerseyFont}, Arial`,
      fill: "#2F4F4F",
      align: "center",
    });
    this.feedbackText.listening(false);
    this.group.add(this.feedbackText);
  }

  private buildBackButton(): void {
    this.backButtonGroup = new Konva.Group();
    this.backButtonRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      fill: "#6E8E43",
      stroke: "#3E5B2C",
      strokeWidth: 3,
      cornerRadius: 8,
      shadowColor: "rgba(0,0,0,0.25)",
      shadowBlur: 12,
      shadowOffset: { x: 0, y: 6 },
      shadowOpacity: 0.6,
    });
    this.backButtonText = new Konva.Text({
      x: 0,
      y: 0,
      text: "MAIN MENU",
      fontSize: 26,
      fontFamily: `${this.jerseyFont}, Arial`,
      fontStyle: "bold",
      fill: "#36150E",
      align: "center",
    });
    this.backButtonGroup.add(this.backButtonRect);
    this.backButtonGroup.add(this.backButtonText);
    this.backButtonGroup.listening(true);
    this.group.add(this.backButtonGroup);
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
        fill: this.answerBaseFills[i % this.answerBaseFills.length],
        cornerRadius: 10,
        stroke: this.answerStrokeFills[i % this.answerStrokeFills.length],
        strokeWidth: 3,
        shadowColor: "rgba(0,0,0,0.25)",
        shadowBlur: 12,
        shadowOffset: { x: 0, y: 6 },
        shadowOpacity: 0.6,
      });
      const txt = new Konva.Text({
        x: 0,
        y: 0,
        text: "",
        fontSize: 42,
        fontFamily: `${this.jerseyFont}, Arial`,
        fill: "#3b1a16",
        align: "center",
      });
      g.add(rect);
      g.add(txt);
      this.answerGroups.push(g);
      this.answerRects.push(rect);
      this.answerTextNodes.push(txt);
      this.answerBasePositions.push({ rectY: rect.y(), textY: txt.y() });
      this.group.add(g);
    }
  }

  private async loadHtmlImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => {
        resolve(img);
      });
      img.addEventListener("error", () => {
        reject(new Error("Failed to load image"));
      });
      img.src = url;
    });
  }
}

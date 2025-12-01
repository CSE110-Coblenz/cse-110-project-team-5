import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { MenuScreenController } from "./screens/menu-screen/menu-screen-controller.ts";
import { GameScreenController } from "./screens/game-screen/game-screen-controller.ts";
import { stageWidth, stageHeight } from "./constants.ts";
import { MinigameScreenController } from "./screens/minigame-screen/minigame-screen-controller.ts";
import { GameOverController } from "./screens/game-over-screen/game-over-controller.ts";
import { PotionManager } from "./models/potion-manager.ts";
import { HelpScreenController } from "./screens/help-screen/help-screen-controller.ts";

/**
 * Main Application - Coordinates all screens
 *
 * This class demonstrates screen management using Konva Groups.
 * Each screen (Menu, Game, Results) has its own Konva.Group that can be
 * shown or hidden independently.
 *
 * Key concept: All screens are added to the same layer, but only one is
 * visible at a time. This is managed by the switchToScreen() method.
 */
class App implements ScreenSwitcher {
  private readonly stage: Konva.Stage;
  private readonly layer: Konva.Layer;

  private readonly menuController: MenuScreenController;
  private readonly gameController: GameScreenController;
  private readonly minigameController: MinigameScreenController;
  private readonly gameOverController: GameOverController;
  private readonly potionManager: PotionManager;
  private readonly helpController: HelpScreenController;

  constructor(container: string) {
    // Initialize Konva stage (the main canvas)
    this.stage = new Konva.Stage({
      container,
      width: stageWidth,
      height: stageHeight,
    });

    // Create a layer (screens will be added to this layer)
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.potionManager = new PotionManager();

    // Initialize all screen controllers
    // Each controller manages a Model, View, and handles user interactions
    this.menuController = new MenuScreenController(this);
    this.gameController = new GameScreenController(this.potionManager);
    this.minigameController = new MinigameScreenController(
      this,
      this.potionManager,
    );
    this.gameOverController = new GameOverController();
    this.helpController = new HelpScreenController(this);

    // Connect game controller to game over controller
    this.gameController.setGameOverController(this.gameOverController);
    this.gameOverController.setScreenSwitcher(this);

    // Add all screen groups to the layer
    // All screens exist simultaneously but only one is visible at a time
    this.layer.add(this.menuController.getView().getGroup());
    this.layer.add(this.gameController.getView().getGroup());
    this.layer.add(this.minigameController.getView().getGroup());
    this.layer.add(this.gameOverController.getView().getGroup());
    this.layer.add(this.helpController.getView().getGroup());

    // Draw the layer (render everything to the canvas)
    this.layer.draw();
  }

  start(): void {
    this.menuController.getView().show();
  }

  /**
   * Switch to a different screen
   *
   * This method implements screen management by:
   * 1. Hiding all screens (setting their Groups to invisible)
   * 2. Showing only the requested screen
   *
   * This pattern ensures only one screen is visible at a time.
   */
  switchToScreen(screen: Screen): void {
    // Hide all screens first by setting their Groups to invisible
    this.menuController.hide();
    this.gameController.hide();
    this.minigameController.hide();
    this.gameOverController.hide();
    this.helpController.hide();

    // Show the requested screen based on the screen type
    switch (screen.type) {
      case "menu": {
        this.menuController.show();
        break;
      }

      case "game": {
        // Start the game (which also shows the game screen)
        this.gameController.startGame();
        break;
      }

      case "minigame": {
        this.minigameController.show();
        break;
      }

      case "help": {
        this.helpController.show();
        break;
      }
    }
  }
}

// Initialize the application
await document.fonts.load('24px "Jersey 10"');
const app = new App("container");
app.start();

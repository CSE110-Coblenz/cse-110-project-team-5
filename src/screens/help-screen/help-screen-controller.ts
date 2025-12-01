import { ScreenController, type ScreenSwitcher } from "../../types.ts";
import { HelpScreenView } from "./help-screen-view.ts";

export class HelpScreenController extends ScreenController {
  private readonly view: HelpScreenView;
  private readonly screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.view = new HelpScreenView({
      onBack: () => {
        this.screenSwitcher.switchToScreen({ type: "menu" });
      },
    });
  }

  getView(): HelpScreenView {
    return this.view;
  }
}

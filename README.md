# Tower Defense 🏰

A tower defense style educational game designed to help students improve their pre-algebra skills. Built with TypeScript, Vite, and Konva.js.

## Overview

Players defend their tower against waves of monsters by solving pre-algebra expansion problems (e.g., "Expand 3(x + 4)"). Correct answers defeat monsters, while wrong answers let them get closer to your tower.

**Target Audience:** Middle school students learning pre-algebra

## Features

- **Progressive Difficulty**: Multiple rounds with increasingly challenging math problems
- **Visual Feedback**: Clear green/red indicators for correct and incorrect answers
- **Potion System**: Earn power-ups through the mini-game:
  - **Heal Potion**: Restore 20 health points
  - **Skip Question Potion**: Skip the current question and eliminate the monster
- **Mini-Game**: Low-pressure quiz game (10 questions, 70% to win a potion)
- **Persistent Progress**: Potions saved to LocalStorage across sessions
- **Interactive Tutorial**: Help screen for new players

## Project Structure

The project follows a **Model-View-Controller (MVC)** architecture for each screen to ensure separation of concerns and testability.

### Key Directories

```
src/
├── main.ts                 # Entry point, App class handles screen switching
├── constants.ts            # Global config (stage dimensions)
├── types.ts                # Shared TypeScript interfaces (View, Screen, ScreenController)
├── utils.ts                # Utility functions
├── models/
│   └── potion-manager.ts   # Manages potion inventory with LocalStorage persistence
└── screens/
    ├── menu-screen/        # Main menu with Play, Mini-Game, Help buttons
    │   ├── menu-screen-controller.ts
    │   └── menu-screen-view.ts
    ├── game-screen/        # Main tower defense gameplay
    │   ├── game-screen-controller.ts
    │   ├── game-screen-model.ts
    │   ├── game-screen-view.ts
    │   └── models/
    │       ├── monster-manager.ts   # Spawns and manages monster waves
    │       └── monster.ts           # Monster entity class
    ├── minigame-screen/    # Potion-earning math quiz
    │   ├── minigame-screen-controller.ts
    │   ├── minigame-screen-model.ts    # Question generation, scoring, win condition
    │   └── minigame-screen-view.ts
    ├── help-screen/        # Tutorial and instructions
    │   ├── help-screen-controller.ts
    │   └── help-screen-view.ts
    └── game-over-screen/   # Win/lose screen
        ├── game-over-controller.ts
        └── game-over-view.ts
```

### Tech Stack

- **Language**: TypeScript
- **Build Tool**: Vite
- **Rendering**: Konva.js (HTML5 Canvas library)
- **Testing**: Vitest
- **Linting**: XO (ESLint + Prettier)

## Architecture Details

### Screen Management

The `App` class in `main.ts` acts as the main router, implementing the `ScreenSwitcher` interface. All screens are Konva Groups added to the same layer—only one is visible at a time.

```typescript
// Screen switching pattern
switchToScreen(screen: Screen): void {
    // Hide all screens first
    this.menuController.hide();
    this.gameController.hide();
    // ...
    // Show requested screen
    switch (screen.type) {
        case 'game': this.gameController.startGame(); break;
        // ...
    }
}
```

### MVC Pattern

Each screen follows the MVC pattern:

- **Model**: Pure game logic, no UI dependencies (e.g., `MinigameScreenModel`)
- **View**: Konva.js rendering only (e.g., `MinigameScreenView`)
- **Controller**: Orchestrates model/view, handles user input (e.g., `MinigameScreenController`)

### Key Design Patterns

- **Dependency Injection**: Controllers receive `ScreenSwitcher` and `PotionManager` for loose coupling
- **Singleton State**: `PotionManager` manages global potion inventory with LocalStorage persistence
- **Observer/Callback**: Views emit events via callbacks passed from controllers

### PotionManager

Handles potion CRUD operations with automatic persistence:

```typescript
// Adding a potion (auto-saves to LocalStorage)
potionManager.addPotion(potionType.heal);

// Using a potion (returns false if none available)
if (potionManager.usePotion(potionType.skipQuestion)) {
    // Apply effect
}

// Get counts for UI display
const counts = potionManager.getCounts();
// { "Heal Potion": 2, "Skip Question Potion": 1 }
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/CSE110-Coblenz/cse-110-project-team-5.git
cd cse-110-project-team-5
```

Install dependencies:

```bash
npm install
```

### Running the Game

Start the development server:

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview  # Preview the build locally
```

## Testing

The project uses **Vitest** for unit testing.

Run all tests:

```bash
npm test
```

### Test Coverage

- `potion-manager.test.ts` - Inventory management, LocalStorage persistence, error handling
- `monster-manager.test.ts` - Monster spawning and wave management
- `minigame-screen-model.test.ts` - Question generation, scoring, win condition
- `minigame-screen-controller.test.ts` - Game flow, potion awards, screen navigation

## Team Members

| Team Member         |
| ------------------- |
| Kile Hsu            |
| Nathan Tosoc        |
| David Li            |
| AnMei Dasbach-Prisk |
| Andrew Doan         |

---

*Developed by Team 5 for CSE 110*

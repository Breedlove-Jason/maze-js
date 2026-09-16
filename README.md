# Maze · The Arcade

A procedural maze game by Jason Breedlove, built with JavaScript, Matter.js, and Vite. Guide the mint ball from the top-left corner to the gold exit at the bottom right. Reach the exit and the walls collapse.

## Choose your difficulty

Choose directly from the dropdown—no code edits required:

| Level | Grid |
|---|---|
| Easy | 12 × 9 |
| Medium | 20 × 15 |
| Hard | 28 × 21 |
| Expert | 40 × 30 (the original size) |

Changing difficulty generates a fresh maze and resets the timer. Select **Start exploring** to begin. **New maze** creates another layout at the selected difficulty. Each generated maze is connected with exactly one route between any two cells.

## Controls

- Arrow keys or WASD move the ball while the court is focused.
- Space pauses or resumes; on-screen buttons also work.
- Hold the directional buttons on a touch screen.
- Releasing movement stops the ball. Leaving the court or browser tab pauses the game.

The timer runs only during play. Best times are stored on this browser/device separately for each difficulty; random layouts vary in length, so best times are personal records rather than a standardized leaderboard. Storage being unavailable does not prevent play. Reduced-motion preference disables the falling-wall celebration.

## Run locally

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

`src/maze.js` generates the maze with iterative depth-first search. `src/world.js` creates Matter.js walls, a sensor exit, and a player body. `src/main.js` owns controls, lifecycle, timer, best times, and celebration. A fixed physics step and cell-relative movement speed keep controls consistent between difficulty levels. Canvas scaling preserves the maze when resizing the window.

Tests check connectivity, passage counts, boundaries, and clean world replacement across all four difficulty levels.

## Vercel

Import this repository with the Vite preset. `vercel.json` sets `npm run build` and the `dist` output folder. No environment variables or database are needed.

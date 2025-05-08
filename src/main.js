// Final Maze Game Fix: Ball Stays in Bounds + No Tunneling
import Matter from "matter-js";
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const WIDTH = 600;
const HEIGHT = 600;
const CELLS = 3;
const UNIT_LENGTH = WIDTH / CELLS;
const WALL_THICKNESS = 2;

const engine = Engine.create();
engine.world.gravity.y = 0;
engine.positionIterations = 10;
engine.velocityIterations = 10;
const { world } = engine;

const render = Render.create({
  element: document.body,
  engine,
  options: {
    width: WIDTH,
    height: HEIGHT,
    wireframes: true,
  },
});
Render.run(render);
const runner = Runner.create();
runner.delta = 1000 / 120;
Runner.run(runner, engine);

// Maze border walls
const walls = [
  Bodies.rectangle(WIDTH / 2, WALL_THICKNESS / 2, WIDTH, WALL_THICKNESS, {
    isStatic: true,
  }),
  Bodies.rectangle(
    WIDTH / 2,
    HEIGHT - WALL_THICKNESS / 2,
    WIDTH,
    WALL_THICKNESS,
    { isStatic: true },
  ),
  Bodies.rectangle(WALL_THICKNESS / 2, HEIGHT / 2, WALL_THICKNESS, HEIGHT, {
    isStatic: true,
  }),
  Bodies.rectangle(
    WIDTH - WALL_THICKNESS / 2,
    HEIGHT / 2,
    WALL_THICKNESS,
    HEIGHT,
    { isStatic: true },
  ),
];
World.add(world, walls);

const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    [arr[counter], arr[index]] = [arr[index], arr[counter]];
  }
  return arr;
};

const grid = Array(CELLS)
  .fill(null)
  .map(() => Array(CELLS).fill(false));
const verticals = Array(CELLS)
  .fill(null)
  .map(() => Array(CELLS - 1).fill(false));
const horizontals = Array(CELLS - 1)
  .fill(null)
  .map(() => Array(CELLS).fill(false));

const visitCell = (row, col) => {
  if (grid[row][col]) return;
  grid[row][col] = true;
  const neighbors = shuffle([
    [row - 1, col, "up"],
    [row, col + 1, "right"],
    [row + 1, col, "down"],
    [row, col - 1, "left"],
  ]);

  for (let [nextRow, nextCol, direction] of neighbors) {
    if (nextRow < 0 || nextRow >= CELLS || nextCol < 0 || nextCol >= CELLS)
      continue;
    if (grid[nextRow][nextCol]) continue;

    if (direction === "left") verticals[row][col - 1] = true;
    else if (direction === "right") verticals[row][col] = true;
    else if (direction === "up") horizontals[row - 1][col] = true;
    else if (direction === "down") horizontals[row][col] = true;

    visitCell(nextRow, nextCol);
  }
};

visitCell(Math.floor(Math.random() * CELLS), Math.floor(Math.random() * CELLS));

// Horizontal maze walls
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, colIndex) => {
    if (open) return;
    World.add(
      world,
      Bodies.rectangle(
        colIndex * UNIT_LENGTH + UNIT_LENGTH / 2,
        rowIndex * UNIT_LENGTH + UNIT_LENGTH,
        UNIT_LENGTH,
        5,
        {
          label: "wall",
          isStatic: true,
        },
      ),
    );
  });
});

// Vertical maze walls
verticals.forEach((row, rowIndex) => {
  row.forEach((open, colIndex) => {
    if (open) return;
    World.add(
      world,
      Bodies.rectangle(
        colIndex * UNIT_LENGTH + UNIT_LENGTH,
        rowIndex * UNIT_LENGTH + UNIT_LENGTH / 2,
        5,
        UNIT_LENGTH,
        { isStatic: true, label: "wall" },
      ),
    );
  });
});

// Goal
const goal = Bodies.rectangle(
  WIDTH - UNIT_LENGTH / 2,
  HEIGHT - UNIT_LENGTH / 2,
  UNIT_LENGTH * 0.7,
  UNIT_LENGTH * 0.7,
  { isStatic: true, label: "goal" },
);
World.add(world, goal);

// Player Ball
const ball = Bodies.circle(UNIT_LENGTH / 2, UNIT_LENGTH / 2, UNIT_LENGTH / 4, {
  label: "ball",
  restitution: 0,
  friction: 0.1,
  frictionAir: 0.02,
  slop: 0,
});
World.add(world, ball);

// Movement
document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  if (event.key === "w" || event.key === "ArrowUp")
    Body.setVelocity(ball, { x, y: -5 });
  else if (event.key === "a" || event.key === "ArrowLeft")
    Body.setVelocity(ball, { x: -5, y });
  else if (event.key === "s" || event.key === "ArrowDown")
    Body.setVelocity(ball, { x, y: 5 });
  else if (event.key === "d" || event.key === "ArrowRight")
    Body.setVelocity(ball, { x: 5, y });
});

// Clamp ball speed to prevent tunneling
Events.on(engine, "beforeUpdate", () => {
  const maxSpeed = 10;
  const { x, y } = ball.velocity;
  Body.setVelocity(ball, {
    x: Math.max(Math.min(x, maxSpeed), -maxSpeed),
    y: Math.max(Math.min(y, maxSpeed), -maxSpeed),
  });
});

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        console.log(body.label);
        if (body.label.includes("wall")) {
          Body.setStatic(body, false);
        }
      });
    }
  });
});

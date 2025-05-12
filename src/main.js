import Matter from 'matter-js';
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const CELLS_HORIZONTAL = 40;
const CELLS_VERTICAL = 30;
const UNIT_LENGTH_X = WIDTH / CELLS_HORIZONTAL;
const UNIT_LENGTH_Y = HEIGHT / CELLS_VERTICAL;

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
    wireframes: false,
  },
});
Render.run(render);
const runner = Runner.create();
runner.delta = 1000 / 120;
Runner.run(runner, engine);

// Maze border walls
const walls = [
  Bodies.rectangle(WIDTH / 2, 0, WIDTH, 2, {
    isStatic: true,
    render: { fillStyle: 'silver' },
  }),
  Bodies.rectangle(WIDTH / 2, HEIGHT, WIDTH, 2, {
    isStatic: true,
    render: { fillStyle: 'silver' },
  }),
  Bodies.rectangle(0, HEIGHT / 2, 2, HEIGHT, {
    isStatic: true,
    render: { fillStyle: 'silver' },
  }),
  Bodies.rectangle(WIDTH, HEIGHT / 2, 2, HEIGHT, {
    isStatic: true,
    render: { fillStyle: 'silver' },
  }),
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

const grid = Array(CELLS_VERTICAL)
  .fill(null)
  .map(() => Array(CELLS_HORIZONTAL).fill(false));
const verticals = Array(CELLS_VERTICAL)
  .fill(null)
  .map(() => Array(CELLS_HORIZONTAL - 1).fill(false));
const horizontals = Array(CELLS_VERTICAL - 1)
  .fill(null)
  .map(() => Array(CELLS_HORIZONTAL).fill(false));

const visitCell = (row, col) => {
  if (grid[row][col]) return;
  grid[row][col] = true;
  const neighbors = shuffle([
    [row - 1, col, 'up'],
    [row, col + 1, 'right'],
    [row + 1, col, 'down'],
    [row, col - 1, 'left'],
  ]);

  for (let [nextRow, nextCol, direction] of neighbors) {
    if (
      nextRow < 0 ||
      nextRow >= CELLS_VERTICAL ||
      nextCol < 0 ||
      nextCol >= CELLS_HORIZONTAL
    )
      continue;
    if (grid[nextRow][nextCol]) continue;

    if (direction === 'left') verticals[row][col - 1] = true;
    else if (direction === 'right') verticals[row][col] = true;
    else if (direction === 'up') horizontals[row - 1][col] = true;
    else if (direction === 'down') horizontals[row][col] = true;

    visitCell(nextRow, nextCol);
  }
};

visitCell(
  Math.floor(Math.random() * CELLS_VERTICAL),
  Math.floor(Math.random() * CELLS_HORIZONTAL),
);

// Horizontal maze walls
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, colIndex) => {
    if (open) return;
    World.add(
      world,
      Bodies.rectangle(
        colIndex * UNIT_LENGTH_X + UNIT_LENGTH_X / 2,
        rowIndex * UNIT_LENGTH_Y + UNIT_LENGTH_Y,
        UNIT_LENGTH_X,
        5,
        {
          label: 'wall',
          isStatic: true,
          render: { fillStyle: 'red' },
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
        colIndex * UNIT_LENGTH_X + UNIT_LENGTH_X,
        rowIndex * UNIT_LENGTH_Y + UNIT_LENGTH_Y / 2,
        5,
        UNIT_LENGTH_Y,
        { isStatic: true, label: 'wall', render: { fillStyle: 'red' } },
      ),
    );
  });
});

// Goal
const goal = Bodies.rectangle(
  WIDTH - UNIT_LENGTH_X / 2,
  HEIGHT - UNIT_LENGTH_Y / 2,
  UNIT_LENGTH_X * 0.7,
  UNIT_LENGTH_Y * 0.7,
  { isStatic: true, label: 'goal', render: { fillStyle: 'green' } },
);
World.add(world, goal);

const ballRadius = Math.min(UNIT_LENGTH_X, UNIT_LENGTH_Y) / 4;
// Player Ball
const ball = Bodies.circle(UNIT_LENGTH_X / 2, UNIT_LENGTH_Y / 2, ballRadius, {
  label: 'ball',
  render: { fillStyle: 'cyan' },
  restitution: 0,
  friction: 0.1,
  frictionAir: 0.02,
  slop: 0,
});
World.add(world, ball);

// Movement
document.addEventListener('keydown', (event) => {
  const { x, y } = ball.velocity;
  if (event.key === 'w' || event.key === 'ArrowUp')
    Body.setVelocity(ball, { x, y: -5 });
  else if (event.key === 'a' || event.key === 'ArrowLeft')
    Body.setVelocity(ball, { x: -5, y });
  else if (event.key === 's' || event.key === 'ArrowDown')
    Body.setVelocity(ball, { x, y: 5 });
  else if (event.key === 'd' || event.key === 'ArrowRight')
    Body.setVelocity(ball, { x: 5, y });
});

// Clamp ball speed to prevent tunneling
Events.on(engine, 'beforeUpdate', () => {
  const maxSpeed = 10;
  const { x, y } = ball.velocity;
  Body.setVelocity(ball, {
    x: Math.max(Math.min(x, maxSpeed), -maxSpeed),
    y: Math.max(Math.min(y, maxSpeed), -maxSpeed),
  });
});

Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector('.winner').classList.remove('hidden');
      world.gravity.y = 1; // Enable gravity
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false); // Make walls dynamic
          body.restitution = 0.5; // Add bounciness
          body.friction = 0.1; // Reduce friction for better bounce
        }
      });
    }
  });
});

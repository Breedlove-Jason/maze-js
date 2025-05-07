import Matter from "matter-js";
const { Engine, Render, Runner, World, Bodies } = Matter;

const WIDTH = 600;
const HEIGHT = 600;
const CELLS = 3;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: WIDTH,
    height: HEIGHT,
    wireframes: true,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// const shape = Bodies.rectangle(200, 200, 50, 50, { isStatic: true });
// World.add(world, shape);

// walls
const walls = [
  Bodies.rectangle(WIDTH / 2, 0, WIDTH, 40, { isStatic: true }),
  Bodies.rectangle(WIDTH / 2, HEIGHT, WIDTH, 40, { isStatic: true }),
  Bodies.rectangle(0, HEIGHT / 2, 40, HEIGHT, { isStatic: true }),
  Bodies.rectangle(WIDTH, HEIGHT / 2, 40, HEIGHT, { isStatic: true }),
];
World.add(world, walls);

// maze generation
const grid = Array(CELLS).fill(null).map(() => Array(CELLS).fill(false));

const verticals = Array(CELLS).fill(null).map(() => Array(CELLS -1).fill(false));

const horizontals = Array(CELLS -1).fill(null).map(()=> Array(CELLS).fill(false));

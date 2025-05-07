import Matter from "matter-js";
const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } =
  Matter;

const colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
];
const WIDTH = 800;
const HEIGHT = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    WIDTH,
    HEIGHT,
    wireframes: false,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);
World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  }),
);

const shape = Bodies.rectangle(200, 200, 50, 50, { isStatic: true });
// World.add(world, shape);

// walls
const walls = [
  Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
  Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
  Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
  Bodies.rectangle(800, 300, 40, 6000, { isStatic: true }),
];
World.add(world, walls);

// random shapes
for (let i = 0; i < 35; i++) {
  if (Math.random() > 0.5) {
    World.add(
      world,
      Bodies.rectangle(Math.random() * WIDTH, Math.random() * HEIGHT, 50, 50),
      {
        render: {
          fillStyle: colors[Math.floor(Math.random() * colors.length)],
        },
      },
    );
  } else {
    World.add(
      world,
      Bodies.circle(Math.random() * WIDTH, Math.random() * HEIGHT, 35, {
        render: {
          fillStyle: colors[Math.floor(Math.random() * colors.length)],
        },
      }),
    );
  }
}

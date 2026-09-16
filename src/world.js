import Matter from 'matter-js';
const { Bodies, Composite } = Matter;
export const WIDTH = 960, HEIGHT = 720;

export function populateWorld(world, maze) {
  const cell = WIDTH / maze.cols;
  const wallStyle = { fillStyle: '#6f9690' };
  const walls = [
    Bodies.rectangle(WIDTH / 2, 0, WIDTH, 8, { isStatic: true, render: wallStyle }),
    Bodies.rectangle(WIDTH / 2, HEIGHT, WIDTH, 8, { isStatic: true, render: wallStyle }),
    Bodies.rectangle(0, HEIGHT / 2, 8, HEIGHT, { isStatic: true, render: wallStyle }),
    Bodies.rectangle(WIDTH, HEIGHT / 2, 8, HEIGHT, { isStatic: true, render: wallStyle }),
  ];
  const thickness = Math.max(3, cell * .07);
  maze.horizontals.forEach((row, r) => row.forEach((open, c) => {
    if (!open) walls.push(Bodies.rectangle((c + .5) * cell, (r + 1) * cell, cell + thickness, thickness,
      { isStatic: true, label: 'wall', render: wallStyle }));
  }));
  maze.verticals.forEach((row, r) => row.forEach((open, c) => {
    if (!open) walls.push(Bodies.rectangle((c + 1) * cell, (r + .5) * cell, thickness, cell + thickness,
      { isStatic: true, label: 'wall', render: wallStyle }));
  }));
  const goal = Bodies.rectangle(WIDTH - cell / 2, HEIGHT - cell / 2, cell * .55, cell * .55,
    { label: 'goal', isStatic: true, isSensor: true, render: { fillStyle: '#f1c778' } });
  const ball = Bodies.circle(cell / 2, cell / 2, cell * .19,
    { label: 'ball', restitution: 0, friction: 0, frictionAir: 0, inertia: Infinity, slop: .01,
      render: { fillStyle: '#b7f9d8' } });
  Composite.add(world, [...walls, goal, ball]);
  return { ball, goal, cell };
}

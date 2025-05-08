import Matter from "matter-js";
const { Engine, Render, Runner, World, Bodies } = Matter;

const WIDTH = 600;
const HEIGHT = 600;
const CELLS = 15;

const UNIT_LENGTH = WIDTH / CELLS;

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
  Bodies.rectangle(WIDTH / 2, 0, WIDTH, 2, { isStatic: true }),
  Bodies.rectangle(WIDTH / 2, HEIGHT, WIDTH, 2, { isStatic: true }),
  Bodies.rectangle(0, HEIGHT / 2, 2, HEIGHT, { isStatic: true }),
  Bodies.rectangle(WIDTH, HEIGHT / 2, 2, HEIGHT, { isStatic: true }),
];
World.add(world, walls);

// modifies the array in place - Fisher-Yates shuffle
const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter]; // Store the current element in a temporary variable
    arr[counter] = arr[index]; // Replace the current element with a randomly selected element
    arr[index] = temp; // Place the original current element at the random position
  }
  return arr;
};

// maze generation
const grid = Array(CELLS)
  .fill(null)
  .map(() => Array(CELLS).fill(false));

const verticals = Array(CELLS)
  .fill(null)
  .map(() => Array(CELLS - 1).fill(false));

const horizontals = Array(CELLS - 1)
  .fill(null)
  .map(() => Array(CELLS).fill(false));

const startRow = Math.floor(Math.random() * CELLS);
const startCol = Math.floor(Math.random() * CELLS);

const visitCell = (row, col) => {
  // if the cell at (row, col) is already visited, return
  if (grid[row][col]) return;

  // mark cell as visited
  grid[row][col] = true;

  // assemble a randomly ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, col, "up"], // up
    [row, col + 1, "right"], // right
    [row + 1, col, "down"], // down
    [row, col - 1, "left"], // left
  ]);
  for (let neighbor of neighbors) {
    const [nextRow, nextCol, direction] = neighbor;
    // if the neighbor is out of bounds, skip it
    if (nextRow < 0 || nextRow >= CELLS || nextCol < 0 || nextCol >= CELLS) {
      continue;
    }
    // if the neighbor is visited, skip it and continue to the next neighbor
    if (grid[nextRow][nextCol]) {
      continue;
    }
    if (direction === "left") {
      verticals[row][col - 1] = true; // remove the wall between the current cell and the neighbor
    } else if (direction === "right") {
      verticals[row][col] = true; // remove the wall between the current cell and the neighbor
    } else if (direction === "up") {
      horizontals[row - 1][col] = true; // remove the wall between the current cell and the neighbor
    } else if (direction === "down") {
      horizontals[row][col] = true; // remove the wall between the current cell and the neighbor
    }
    visitCell(nextRow, nextCol);
  }
};
visitCell(startRow, startCol);

// Create horizontal walls where needed
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return; // Skip if there's an opening (no wall needed)
    }
    // Create a horizontal wall at the bottom of the cell
    const wall = Bodies.rectangle(
        columnIndex * UNIT_LENGTH + UNIT_LENGTH / 2, // X position (center of cell)
        rowIndex * UNIT_LENGTH + UNIT_LENGTH,        // Y position (bottom of cell)
        UNIT_LENGTH,                                 // Width spans the full cell
        5,                                           // Height of wall (thickness)
        { isStatic: true }                           // Make the wall immovable
    );
    World.add(world, wall);
  });
});

// Create vertical walls where needed
verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return; // Skip if there's an opening (no wall needed)
    }
    // Create a vertical wall on the right side of the cell
    const wall = Bodies.rectangle(
        columnIndex * UNIT_LENGTH + UNIT_LENGTH,     // X position (right side of cell)
        rowIndex * UNIT_LENGTH + UNIT_LENGTH / 2,    // Y position (center of cell)
        5,                                           // Width of wall (thickness)
        UNIT_LENGTH,                                 // Height spans the full cell
        { isStatic: true }                           // Make the wall immovable
    );
    World.add(world, wall);
  });
});

// goal
const goal = Bodies.rectangle(
    WIDTH - UNIT_LENGTH / 2, // Center of the cell,
    HEIGHT - UNIT_LENGTH / 2,
    UNIT_LENGTH * 0.7,
    UNIT_LENGTH * 0.7,
    { isStatic: true, label: "goal" }
);
World.add(world, goal);

const ball = Bodies.circle(UNIT_LENGTH / 2, UNIT_LENGTH / 2, UNIT_LENGTH / 4, {isStatic: false, label: "ball"});
World.add(world, ball);

document.addEventListener("keydown", (event) =>{
  console.log(event);
})
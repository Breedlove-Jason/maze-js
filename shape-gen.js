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

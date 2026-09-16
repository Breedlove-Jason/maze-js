import test from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';
import { LEVELS, generateMaze } from '../src/maze.js';
import { populateWorld } from '../src/world.js';
for (const [name, { cols, rows }] of Object.entries(LEVELS)) {
  test(`${name}: all cells reachable with exactly one route between cells`, () => {
    for (let run = 0; run < 8; run++) {
      const m = generateMaze(cols, rows);
      const seen = new Set(['0,0']), queue = [[0, 0]];
      for (let i = 0; i < queue.length; i++) {
        const [r, c] = queue[i];
        const neighbors = [];
        if (c < cols - 1 && m.verticals[r][c]) neighbors.push([r, c + 1]);
        if (c > 0 && m.verticals[r][c - 1]) neighbors.push([r, c - 1]);
        if (r < rows - 1 && m.horizontals[r][c]) neighbors.push([r + 1, c]);
        if (r > 0 && m.horizontals[r - 1][c]) neighbors.push([r - 1, c]);
        for (const n of neighbors) if (!seen.has(n.join(','))) { seen.add(n.join(',')); queue.push(n); }
      }
      assert.equal(seen.size, cols * rows);
      assert.equal([...m.verticals.flat(), ...m.horizontals.flat()].filter(Boolean).length, cols * rows - 1);
    }
  });
  test(`${name}: physics keeps ball inside closed border`, () => {
    const engine = Matter.Engine.create({ positionIterations: 10, velocityIterations: 10 });
    engine.gravity.y = 0;
    const { ball, cell } = populateWorld(engine.world, generateMaze(cols, rows));
    for (let i = 0; i < 600; i++) { Matter.Body.setVelocity(ball, { x: -cell * .065, y: 0 }); Matter.Engine.update(engine, 1000 / 120); }
    assert.ok(ball.position.x > 0);
    assert.ok(ball.position.x < cell / 2);
    Matter.Composite.clear(engine.world, false); Matter.Engine.clear(engine);
    const next = populateWorld(engine.world, generateMaze(cols, rows));
    assert.equal(engine.world.bodies.filter(b => b.label === 'ball').length, 1);
    assert.equal(next.ball.position.x, cell / 2);
  });
}
test('invalid dimensions rejected', () => { for (const args of [[0, 9], [2.5, 3], [1000, 1000]]) assert.throws(() => generateMaze(...args), RangeError); });
for (const [name, { cols, rows }] of Object.entries(LEVELS)) {
  test(`${name}: ball follows generated route and reaches goal sensor`, () => {
    let seed = 42;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const m = generateMaze(cols, rows, random), queue = [[0, 0]], parents = new Map([['0,0', null]]);
    for (let i = 0; i < queue.length; i++) {
      const [r, c] = queue[i], next = [];
      if (c < cols - 1 && m.verticals[r][c]) next.push([r, c + 1]);
      if (c > 0 && m.verticals[r][c - 1]) next.push([r, c - 1]);
      if (r < rows - 1 && m.horizontals[r][c]) next.push([r + 1, c]);
      if (r > 0 && m.horizontals[r - 1][c]) next.push([r - 1, c]);
      for (const n of next) if (!parents.has(n.join(','))) { parents.set(n.join(','), [r, c]); queue.push(n); }
    }
    const path = []; let at = [rows - 1, cols - 1];
    while (at) { path.unshift(at); at = parents.get(at.join(',')); }
    const engine = Matter.Engine.create({ positionIterations: 10, velocityIterations: 10 }); engine.gravity.y = 0;
    const { ball, cell } = populateWorld(engine.world, m); let won = false;
    Matter.Events.on(engine, 'collisionStart', e => { if (e.pairs.some(p => [p.bodyA.label, p.bodyB.label].includes('goal'))) won = true; });
    for (const [r, c] of path.slice(1)) {
      const target = { x: (c + .5) * cell, y: (r + .5) * cell };
      for (let frame = 0; frame < 100; frame++) {
        const dx = target.x - ball.position.x, dy = target.y - ball.position.y, length = Math.hypot(dx, dy);
        if (length < .3) break;
        const speed = Math.min(cell * .065, length * 2);
        Matter.Body.setVelocity(ball, { x: dx / length * speed, y: dy / length * speed });
        Matter.Engine.update(engine, 1000 / 120);
      }
      assert.ok(Math.hypot(target.x - ball.position.x, target.y - ball.position.y) < .3, `stuck at ${r},${c}`);
    }
    assert.ok(won);
  });
}

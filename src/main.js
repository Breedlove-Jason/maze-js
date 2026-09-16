import './style.css';
import Matter from 'matter-js';
import { LEVELS, generateMaze } from './maze.js';
import { WIDTH, HEIGHT, populateWorld } from './world.js';
const { Engine, Render, Composite, Body, Events } = Matter;
const $ = id => document.getElementById(id);
const engine = Engine.create({ positionIterations: 10, velocityIterations: 10 });
engine.gravity.y = 0;
const render = Render.create({ element: $('board'), engine,
  options: { width: WIDTH, height: HEIGHT, wireframes: false, background: '#101c20', pixelRatio: 1 } });
render.canvas.setAttribute('aria-hidden', 'true');
Render.run(render);
let ball, cell, difficulty = 'easy', state = 'ready', elapsed = 0, previous = 0, accumulator = 0, celebration = 0;
const held = new Set(), touch = new Set();
const directions = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
const time = ms => { const total = Math.floor(ms / 1000); return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`; };
function best() { try { const value = Number(localStorage.getItem(`jb-maze-best-${difficulty}`)); return Number.isFinite(value) && value > 0 ? value : null; } catch { return null; } }
function clearInput() { held.clear(); touch.clear(); if (ball) Body.setVelocity(ball, { x: 0, y: 0 }); }
function showState() {
  $('overlay').hidden = state === 'running';
  $('overlay').classList.toggle('won', state === 'won');
  $('pause').disabled = state !== 'running';
  const copy = {
    ready: ['A NEW PATH AWAITS', 'Take the first turn.', 'The clock starts when you do.', 'Start exploring ↗', 'Ready. Reach the gold exit at the bottom right.'],
    paused: ['NO NEED TO RUSH', 'Find your bearings.', 'Your route is waiting right here.', 'Resume exploring ↗', 'Paused. Your timer is stopped.'],
    won: ['YOU FOUND YOUR WAY', 'Down come the walls.', `${LEVELS[difficulty].label} completed in ${time(elapsed)}.`, 'Explore another ↗', `Maze complete in ${time(elapsed)}. Choose another challenge or play again.`],
    running: ['', '', '', '', 'Find the gold exit. Space pauses your journey.'],
  }[state];
  ['overlay-label', 'overlay-title', 'overlay-copy', 'play', 'status'].forEach((id, i) => { $(id).textContent = copy[i]; });
}
function newMaze() {
  clearInput();
  difficulty = Object.hasOwn(LEVELS, $('difficulty').value) ? $('difficulty').value : 'easy';
  const level = LEVELS[difficulty];
  Composite.clear(engine.world, false); Engine.clear(engine); engine.gravity.y = 0;
  ({ ball, cell } = populateWorld(engine.world, generateMaze(level.cols, level.rows)));
  elapsed = 0; accumulator = 0; celebration = 0; previous = 0; state = 'ready';
  $('level').textContent = level.label;
  $('grid-size').textContent = `${level.cols} × ${level.rows} CELLS`;
  $('timer').textContent = time(0); $('best').textContent = best() ? time(best()) : '—';
  showState();
}
function start() {
  if (state === 'won') newMaze();
  clearInput(); state = 'running'; previous = 0; accumulator = 0;
  showState(); $('board').focus({ preventScroll: true });
}
function pause() { clearInput(); if (state === 'running') { state = 'paused'; showState(); } }
function win() {
  if (state !== 'running') return;
  clearInput(); state = 'won';
  if (!best() || elapsed < best()) { try { localStorage.setItem(`jb-maze-best-${difficulty}`, String(elapsed)); } catch {} }
  $('best').textContent = best() ? time(best()) : '—';
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    engine.gravity.y = 1; celebration = 2500;
    engine.world.bodies.filter(body => body.label === 'wall').forEach(body => { Body.setStatic(body, false); body.restitution = .3; });
  }
  showState();
}
Events.on(engine, 'collisionStart', event => {
  if (event.pairs.some(({ bodyA, bodyB }) =>
    (bodyA.label === 'ball' && bodyB.label === 'goal') || (bodyB.label === 'ball' && bodyA.label === 'goal'))) win();
});
function frame(now) {
  const dt = previous ? Math.min(now - previous, 50) : 0; previous = now;
  if (!document.hidden && (state === 'running' || celebration > 0)) {
    accumulator += dt;
    while (accumulator >= 1000 / 120) {
      if (state === 'running') {
        const active = dir => touch.has(dir) || [...held].some(key => directions[key] === dir);
        const x = Number(active('right')) - Number(active('left'));
        const y = Number(active('down')) - Number(active('up'));
        const length = Math.hypot(x, y) || 1;
        Body.setVelocity(ball, { x: x / length * cell * .065, y: y / length * cell * .065 });
        elapsed += 1000 / 120;
      } else celebration -= 1000 / 120;
      Engine.update(engine, 1000 / 120); accumulator -= 1000 / 120;
      if (state === 'won' && celebration <= 0) { accumulator = 0; break; }
    }
    $('timer').textContent = time(elapsed);
  }
  requestAnimationFrame(frame);
}
$('play').addEventListener('click', start);
$('new').addEventListener('click', newMaze);
$('pause').addEventListener('click', pause);
$('difficulty').addEventListener('change', newMaze);
$('board').addEventListener('keydown', event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (directions[key]) { event.preventDefault(); if (state === 'running') held.add(key); }
  if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) state === 'running' ? pause() : start(); }
});
window.addEventListener('keyup', event => held.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
$('board').addEventListener('blur', pause);
$('board').addEventListener('pointerdown', () => $('board').focus({ preventScroll: true }));
for (const button of document.querySelectorAll('[data-dir]')) {
  button.addEventListener('pointerdown', event => { event.preventDefault(); $('board').focus({ preventScroll: true }); button.setPointerCapture(event.pointerId); if (state === 'running') touch.add(button.dataset.dir); });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, () => touch.delete(button.dataset.dir));
}
window.addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
newMaze(); requestAnimationFrame(frame);

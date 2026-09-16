export const LEVELS = Object.freeze({
  easy: { label: 'Easy', cols: 12, rows: 9 },
  medium: { label: 'Medium', cols: 20, rows: 15 },
  hard: { label: 'Hard', cols: 28, rows: 21 },
  expert: { label: 'Expert', cols: 40, rows: 30 },
});

// Iterative depth-first search: a connected maze without recursive stack limits.
export function generateMaze(cols, rows, random = Math.random) {
  if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 2 || rows < 2 || cols > 80 || rows > 80) throw new RangeError('Invalid maze dimensions');
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const verticals = Array.from({ length: rows }, () => Array(cols - 1).fill(false));
  const horizontals = Array.from({ length: rows - 1 }, () => Array(cols).fill(false));
  const stack = [[0, 0]];
  visited[0][0] = true;
  while (stack.length) {
    const [row, col] = stack.at(-1);
    const neighbors = [[row - 1, col], [row, col + 1], [row + 1, col], [row, col - 1]]
      .filter(([r, c]) => r >= 0 && c >= 0 && r < rows && c < cols && !visited[r][c]);
    if (!neighbors.length) { stack.pop(); continue; }
    const [r, c] = neighbors[Math.floor(random() * neighbors.length)];
    if (r === row) verticals[row][Math.min(col, c)] = true;
    else horizontals[Math.min(row, r)][col] = true;
    visited[r][c] = true;
    stack.push([r, c]);
  }
  return { cols, rows, verticals, horizontals };
}

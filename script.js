// script.js const board = document.getElementById("game-board"); const scoreEl = document.getElementById("score"); const highScoreEl = document.getElementById("high-score"); const modeSelect = document.getElementById("modeSelect"); const speedSelect = document.getElementById("speedSelect");

const gridSize = 20; let snake = [{ x: 10, y: 10 }]; let food = null; let direction = { x: 0, y: 0 }; let walls = []; let score = 0; let highScore = localStorage.getItem("snakeHighScore") || 0; let gameLoop; let isBot = false;

highScoreEl.textContent = highScore;

function createBoard() { board.innerHTML = ""; for (let y = 0; y < gridSize; y++) { for (let x = 0; x < gridSize; x++) { const cell = document.createElement("div"); cell.classList.add("cell"); cell.dataset.x = x; cell.dataset.y = y; board.appendChild(cell); } } }

function getCell(x, y) { return board.querySelector(.cell[data-x='${x}'][data-y='${y}']); }

function draw() { document.querySelectorAll(".cell").forEach(cell => { cell.classList.remove("snake", "food", "wall"); }); snake.forEach(s => getCell(s.x, s.y)?.classList.add("snake")); if (food) getCell(food.x, food.y)?.classList.add("food"); walls.forEach(w => getCell(w.x, w.y)?.classList.add("wall")); }

function moveSnake() { const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize || snake.some(p => p.x === head.x && p.y === head.y) || walls.some(w => w.x === head.x && w.y === head.y)) { clearInterval(gameLoop); alert("Game Over"); return location.reload(); }

snake.unshift(head); if (food && head.x === food.x && head.y === food.y) { score++; playEatSound(); placeFood(); updateScore(); } else { snake.pop(); } draw(); }

function updateScore() { scoreEl.textContent = score; if (score > highScore) { highScore = score; localStorage.setItem("snakeHighScore", highScore); highScoreEl.textContent = highScore; } }

function placeFood() { let x, y; do { x = Math.floor(Math.random() * gridSize); y = Math.floor(Math.random() * gridSize); } while (snake.some(p => p.x === x && p.y === y) || walls.some(w => w.x === x && w.y === y)); food = { x, y }; }

function placeWalls() { walls = []; for (let i = 0; i < 10; i++) { let x, y; do { x = Math.floor(Math.random() * gridSize); y = Math.floor(Math.random() * gridSize); } while ((x === 10 && y === 10) || walls.some(w => w.x === x && w.y === y)); walls.push({ x, y }); } }

function playEatSound() { const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.type = "sine"; osc.frequency.value = 440; osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); osc.stop(ctx.currentTime + 0.3); }

function handleKey(e) { switch (e.key) { case "ArrowUp": if (direction.y === 0) direction = { x: 0, y: -1 }; break; case "ArrowDown": if (direction.y === 0) direction = { x: 0, y: 1 }; break; case "ArrowLeft": if (direction.x === 0) direction = { x: -1, y: 0 }; break; case "ArrowRight": if (direction.x === 0) direction = { x: 1, y: 0 }; break; } }

function botAI() { const head = snake[0]; if (!food) return; const dx = food.x - head.x; const dy = food.y - head.y; direction = Math.abs(dx) > Math.abs(dy) ? { x: dx > 0 ? 1 : -1, y: 0 } : { x: 0, y: dy > 0 ? 1 : -1 }; }

function gameTick() { if (isBot) botAI(); moveSnake(); }

function init() { createBoard(); placeFood(); placeWalls(); draw(); direction = { x: 1, y: 0 }; isBot = modeSelect.value === "bot"; const interval = parseInt(speedSelect.value); clearInterval(gameLoop); gameLoop = setInterval(gameTick, interval); }

modeSelect.addEventListener("change", init); speedSelect.addEventListener("change", init); window.addEventListener("keydown", handleKey);

// Cảm ứng let startX, startY; window.addEventListener("touchstart", e => { const touch = e.touches[0]; startX = touch.clientX; startY = touch.clientY; }); window.addEventListener("touchend", e => { const touch = e.changedTouches[0]; const dx = touch.clientX - startX; const dy = touch.clientY - startY; if (Math.abs(dx) > Math.abs(dy)) { direction = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 }; } else { direction = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 }; } });

init();


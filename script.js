// script.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const modalRestartBtn = document.getElementById("modalRestartBtn");
const scoreDisplay = document.getElementById("scoreDisplay");
const speedSelect = document.getElementById("speedSelect");
const modeSelect = document.getElementById("modeSelect");
const finalScore = document.getElementById("finalScore");
const gameOverModal = new bootstrap.Modal(document.getElementById("gameOverModal"));

let snake, food, dx, dy, speed, score, gameLoop, isBot;

const gridSize = 20;
const canvasSize = canvas.width;

function initGame() {
  snake = [{ x: 160, y: 160 }];
  dx = gridSize;
  dy = 0;
  score = 0;
  food = getRandomPosition();
  clearInterval(gameLoop);
  speed = parseInt(speedSelect.value);
  isBot = modeSelect.value === "bot";
  gameLoop = setInterval(draw, speed);
  scoreDisplay.textContent = "Điểm: 0";
  canvas.classList.remove("d-none");
  restartBtn.classList.remove("d-none");
}

function getRandomPosition() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
    };
  } while (snake.some(part => part.x === pos.x && part.y === pos.y));
  return pos;
}

function draw() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, gridSize, gridSize);

  // Move snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (isBot) autoMove(head);

  snake.unshift(head);

  // Check food
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = `Điểm: ${score}`;
    food = getRandomPosition();
    new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg").play();
  } else {
    snake.pop();
  }

  // Draw snake
  ctx.fillStyle = "lime";
  snake.forEach(part => ctx.fillRect(part.x, part.y, gridSize, gridSize));

  // Check collision
  if (
    head.x < 0 ||
    head.x >= canvasSize ||
    head.y < 0 ||
    head.y >= canvasSize ||
    snake.slice(1).some(p => p.x === head.x && p.y === head.y)
  ) {
    gameOver();
  }
}

function autoMove(head) {
  const directions = [
    { x: gridSize, y: 0 },
    { x: -gridSize, y: 0 },
    { x: 0, y: gridSize },
    { x: 0, y: -gridSize }
  ];
  directions.sort((a, b) => {
    const da = Math.hypot((head.x + a.x) - food.x, (head.y + a.y) - food.y);
    const db = Math.hypot((head.x + b.x) - food.x, (head.y + b.y) - food.y);
    return da - db;
  });
  dx = directions[0].x;
  dy = directions[0].y;
}

function gameOver() {
  clearInterval(gameLoop);
  finalScore.textContent = `Bạn đã ghi được ${score} điểm.`;
  gameOverModal.show();
}

function changeDirection(e) {
  const key = e.key;
  if (key === "ArrowUp" && dy === 0) {
    dx = 0; dy = -gridSize;
  } else if (key === "ArrowDown" && dy === 0) {
    dx = 0; dy = gridSize;
  } else if (key === "ArrowLeft" && dx === 0) {
    dx = -gridSize; dy = 0;
  } else if (key === "ArrowRight" && dx === 0) {
    dx = gridSize; dy = 0;
  }
}

// --- Xử lý cảm ứng (touch controls) ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const swipeThreshold = 30;

function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
}

function handleTouchEnd() {
  const dxSwipe = touchEndX - touchStartX;
  const dySwipe = touchEndY - touchStartY;

  if (Math.abs(dxSwipe) > Math.abs(dySwipe)) {
    if (dxSwipe > swipeThreshold && dx === 0) {
      dx = gridSize;
      dy = 0;
    } else if (dxSwipe < -swipeThreshold && dx === 0) {
      dx = -gridSize;
      dy = 0;
    }
  } else {
    if (dySwipe > swipeThreshold && dy === 0) {
      dx = 0;
      dy = gridSize;
    } else if (dySwipe < -swipeThreshold && dy === 0) {
      dx = 0;
      dy = -gridSize;
    }
  }
}

canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd);

startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);
modalRestartBtn.addEventListener("click", () => {
  gameOverModal.hide();
  initGame();
});
document.addEventListener("keydown", changeDirection);

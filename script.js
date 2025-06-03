//script.js
const board = document.getElementById("game-board");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const modeSelect = document.getElementById("modeSelect");
const speedSelect = document.getElementById("speedSelect");

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = null;
let direction = { x: 0, y: 0 };
let walls = [];
let score = 0;
let highScore = parseInt(localStorage.getItem("snakeHighScore")) || 0;
let gameLoop;
let speed = 300;
let isBot = false;

highScoreEl.textContent = highScore;

function createBoard() {
  board.innerHTML = "";
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      board.appendChild(cell);
    }
  }
}

function getCell(x, y) {
  return board.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
}

function placeFood() {
  while (true) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    if (!snake.some(s => s.x === x && s.y === y) && !walls.some(w => w.x === x && w.y === y)) {
      food = { x, y };
      break;
    }
  }
}

function placeWalls() {
  walls = [];
  // Đặt 30 chướng ngại vật ngẫu nhiên
  for (let i = 0; i < 30; i++) {
    while (true) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      if (!snake.some(s => s.x === x && s.y === y) && !walls.some(w => w.x === x && w.y === y) && !(food && food.x === x && food.y === y)) {
        walls.push({ x, y });
        break;
      }
    }
  }
}

function draw() {
  // Xóa toàn bộ trạng thái
  document.querySelectorAll(".cell").forEach(cell => {
    cell.className = "cell";
  });
  // Vẽ walls
  walls.forEach(w => {
    getCell(w.x, w.y).classList.add("wall");
  });
  // Vẽ food
  if (food) {
    getCell(food.x, food.y).classList.add("food");
  }
  // Vẽ snake
  snake.forEach(s => {
    getCell(s.x, s.y).classList.add("snake");
  });
}

function playEatSound() {
  try {
    // Tạo âm thanh "beep" đơn giản không cần file
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const o = context.createOscillator();
    const g = context.createGain();
    o.type = "square";
    o.frequency.value = 440;
    o.connect(g);
    g.connect(context.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
    o.stop(context.currentTime + 0.1);
  } catch (e) {
    // Nếu trình duyệt không hỗ trợ AudioContext, bỏ qua
  }
}

function update() {
  let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Giới hạn board (cho rắn chết nếu va chạm tường)
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    gameOver();
    return;
  }
  // Va chạm chướng ngại vật
  if (walls.some(w => w.x === head.x && w.y === head.y)) {
    gameOver();
    return;
  }
  // Va chạm thân rắn
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Ăn food
  if (food && head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    playEatSound();
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  clearInterval(gameLoop);
  alert(`Game over! Điểm của bạn: ${score}`);
  if (score > highScore) {
    localStorage.setItem("snakeHighScore", score);
    highScore = score;
    highScoreEl.textContent = highScore;
  }
  resetGame();
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  placeFood();
  placeWalls();
  draw();
}

function botChooseDirection() {
  // Bot đơn giản: tìm hướng đến food mà không va chạm
  const head = snake[0];
  const dx = food.x - head.x;
  const dy = food.y - head.y;
  let options = [];

  // Tạo các hướng khả thi
  if (dx !== 0) {
    options.push({ x: Math.sign(dx), y: 0 });
  }
  if (dy !== 0) {
    options.push({ x: 0, y: Math.sign(dy) });
  }
  // Thêm hướng ngẫu nhiên phòng trường hợp trên đều không đi được
  options.push({ x: 0, y: 1 });
  options.push({ x: 0, y: -1 });
  options.push({ x: 1, y: 0 });
  options.push({ x: -1, y: 0 });

  for (let dir of options) {
    let nextPos = { x: head.x + dir.x, y: head.y + dir.y };
    if (
      nextPos.x >= 0 &&
      nextPos.x < gridSize &&
      nextPos.y >= 0 &&
      nextPos.y < gridSize &&
      !walls.some(w => w.x === nextPos.x && w.y === nextPos.y) &&
      !snake.some(s => s.x === nextPos.x && s.y === nextPos.y)
    ) {
      return dir;
    }
  }
  // Nếu không tìm được hướng đi an toàn, giữ nguyên hướng cũ
  return direction;
}

function gameTick() {
  if (isBot) {
    direction = botChooseDirection();
  }
  // Nếu chưa có hướng (lúc bắt đầu) thì rắn không di chuyển
  if (direction.x === 0 && direction.y === 0) return;
  update();
}

function keyDownHandler(e) {
  if (isBot) return; // Bot chơi thì không cần người điều khiển
  switch (e.key) {
    case "ArrowUp":
      if (direction.y !== 1) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y !== -1) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x !== 1) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x !== -1) direction = { x: 1, y: 0 };
      break;
  }
}

function startGame() {
  clearInterval(gameLoop);
  speed = parseInt(speedSelect.value);
  isBot = modeSelect.value === "bot";
  resetGame();
  gameLoop = setInterval(gameTick, speed);
}

modeSelect.addEventListener("change", startGame);
speedSelect.addEventListener("change", startGame);
window.addEventListener("keydown", keyDownHandler);

createBoard();
startGame();

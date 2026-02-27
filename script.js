// script.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const modalRestartBtn = document.getElementById("modalRestartBtn");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const speedSelect = document.getElementById("speedSelect");
const modeSelect = document.getElementById("modeSelect");
const sizeSelect = document.getElementById("sizeSelect");
const botDifficulty = document.getElementById("botDifficulty");
const botDifficultyContainer = document.getElementById("botDifficultyContainer");
const soundToggle = document.getElementById("soundToggle");
const finalScoreDisplay = document.getElementById("finalScore");
const highScoreMsg = document.getElementById("highScoreMsg");

// Khởi tạo Modal khi DOM đã sẵn sàng
let gameOverModal;
document.addEventListener("DOMContentLoaded", () => {
    gameOverModal = new bootstrap.Modal(document.getElementById("gameOverModal"));
});

// Âm thanh với xử lý lỗi
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const hitSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flick.ogg");

function playSound(sound) {
    if (soundToggle.checked) {
        sound.play().catch(e => console.warn("Không thể phát âm thanh:", e));
    }
}

let snake, food, dx, dy, score, gameLoop, isBot, botLevel;
let gridSize = 20;
let highScore = localStorage.getItem("snakeHighScore") || 0;

highScoreDisplay.textContent = highScore;

modeSelect.addEventListener("change", () => {
    botDifficultyContainer.classList.toggle("d-none", modeSelect.value !== "bot");
});

function initGame() {
    const size = parseInt(sizeSelect.value);
    canvas.width = size;
    canvas.height = size;

    // Đặt rắn ở giữa bàn chơi
    const startX = Math.floor(size / (2 * gridSize)) * gridSize;
    const startY = Math.floor(size / (2 * gridSize)) * gridSize;

    snake = [
        { x: startX, y: startY },
        { x: startX - gridSize, y: startY },
        { x: startX - 2 * gridSize, y: startY }
    ];

    dx = gridSize;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;

    isBot = modeSelect.value === "bot";
    botLevel = botDifficulty.value;

    food = getRandomPosition();

    clearInterval(gameLoop);

    // Vẽ trạng thái ban đầu ngay lập tức
    render();

    const speed = parseInt(speedSelect.value);
    gameLoop = setInterval(main, speed);

    startBtn.classList.add("d-none");
    restartBtn.classList.remove("d-none");
}

function main() {
    if (isBot) handleBotMove();

    if (didGameEnd()) {
        gameOver();
        return;
    }

    advanceSnake();
    render();
}

function render() {
    clearCanvas();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    for(let i=0; i<=canvas.width; i+=gridSize) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
    }
    for(let i=0; i<=canvas.height; i+=gridSize) {
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#4caf50" : "#81c784";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 2;
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
        ctx.strokeRect(part.x, part.y, gridSize, gridSize);
    });
}

function advanceSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        playSound(eatSound);
        food = getRandomPosition();
    } else {
        snake.pop();
    }
}

function didGameEnd() {
    // Va chạm thân
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    // Va chạm tường
    const hitWall = snake[0].x < 0 || snake[0].x >= canvas.width ||
                    snake[0].y < 0 || snake[0].y >= canvas.height;
    return hitWall;
}

function drawFood() {
    ctx.fillStyle = "#f44336";
    ctx.strokeStyle = "#b71c1c";
    ctx.lineWidth = 2;
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
}

function getRandomPosition() {
    let foodX, foodY;
    while (true) {
        foodX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        foodY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        if (!snake.some(part => part.x === foodX && part.y === foodY)) break;
    }
    return { x: foodX, y: foodY };
}

function gameOver() {
    clearInterval(gameLoop);
    playSound(hitSound);

    finalScoreDisplay.textContent = `Điểm của bạn: ${score}`;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highScoreDisplay.textContent = highScore;
        highScoreMsg.classList.remove("d-none");
    } else {
        highScoreMsg.classList.add("d-none");
    }

    if (gameOverModal) gameOverModal.show();
}

function changeDirection(event) {
    if (isBot) return;

    const keyPressed = event.keyCode;
    const LEFT_KEY = 37;
    const UP_KEY = 38;
    const RIGHT_KEY = 39;
    const DOWN_KEY = 40;

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (keyPressed === LEFT_KEY && !goingRight) { dx = -gridSize; dy = 0; }
    if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -gridSize; }
    if (keyPressed === RIGHT_KEY && !goingLeft) { dx = gridSize; dy = 0; }
    if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = gridSize; }
}

function handleBotMove() {
    const head = snake[0];
    const possibleMoves = [
        { dx: gridSize, dy: 0 },
        { dx: -gridSize, dy: 0 },
        { dx: 0, dy: gridSize },
        { dx: 0, dy: -gridSize }
    ];

    let safeMoves = possibleMoves.filter(move => {
        const nextX = head.x + move.dx;
        const nextY = head.y + move.dy;
        if (nextX < 0 || nextX >= canvas.width || nextY < 0 || nextY >= canvas.height) return false;
        return !snake.some(part => part.x === nextX && part.y === nextY);
    });

    if (safeMoves.length === 0) safeMoves = possibleMoves;

    safeMoves.sort((a, b) => {
        const distA = Math.abs(head.x + a.dx - food.x) + Math.abs(head.y + a.dy - food.y);
        const distB = Math.abs(head.x + b.dx - food.x) + Math.abs(head.y + b.dy - food.y);
        return distA - distB;
    });

    const bestMove = (botLevel === "hard") ? safeMoves[0] : possibleMoves.sort((a, b) => {
        const distA = Math.abs(head.x + a.dx - food.x) + Math.abs(head.y + a.dy - food.y);
        const distB = Math.abs(head.x + b.dx - food.x) + Math.abs(head.y + b.dy - food.y);
        return distA - distB;
    })[0];

    if (bestMove.dx !== -dx || bestMove.dy !== -dy) {
        dx = bestMove.dx;
        dy = bestMove.dy;
    }
}

// Vuốt màn hình
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, {passive: true});

canvas.addEventListener('touchend', e => {
    if (isBot) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > 30 && dx === 0) { dx = deltaX > 0 ? gridSize : -gridSize; dy = 0; }
    } else {
        if (Math.abs(deltaY) > 30 && dy === 0) { dy = deltaY > 0 ? gridSize : -gridSize; dx = 0; }
    }
}, {passive: true});

document.addEventListener("keydown", changeDirection);
startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);
modalRestartBtn.addEventListener("click", () => {
    gameOverModal.hide();
    initGame();
});

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
const gameOverModal = new bootstrap.Modal(document.getElementById("gameOverModal"));

// Âm thanh
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const hitSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flick.ogg");

let snake, food, dx, dy, score, gameLoop, isBot, botLevel;
let gridSize = 20;
let highScore = localStorage.getItem("snakeHighScore") || 0;

highScoreDisplay.textContent = highScore;

// Chuyển đổi hiển thị tùy chọn Bot
modeSelect.addEventListener("change", () => {
    if (modeSelect.value === "bot") {
        botDifficultyContainer.classList.remove("d-none");
    } else {
        botDifficultyContainer.classList.add("d-none");
    }
});

function initGame() {
    const size = parseInt(sizeSelect.value);
    canvas.width = size;
    canvas.height = size;

    snake = [
        { x: gridSize * 5, y: gridSize * 5 },
        { x: gridSize * 4, y: gridSize * 5 },
        { x: gridSize * 3, y: gridSize * 5 }
    ];

    dx = gridSize;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;

    isBot = modeSelect.value === "bot";
    botLevel = botDifficulty.value;

    food = getRandomPosition();

    clearInterval(gameLoop);
    const speed = parseInt(speedSelect.value);
    gameLoop = setInterval(main, speed);

    startBtn.classList.add("d-none");
    restartBtn.classList.remove("d-none");
}

function main() {
    if (isBot) {
        handleBotMove();
    }

    if (didGameEnd()) {
        gameOver();
        return;
    }

    clearCanvas();
    drawFood();
    advanceSnake();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vẽ lưới mờ
    ctx.strokeStyle = "#222";
    for(let i=0; i<canvas.width; i+=gridSize) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=gridSize) {
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#4caf50" : "#81c784";
        ctx.strokeStyle = "#111";
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
        ctx.strokeRect(part.x, part.y, gridSize, gridSize);
    });
}

function advanceSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
    if (didEatFood) {
        score += 10;
        scoreDisplay.textContent = score;
        if (soundToggle.checked) eatSound.play();
        food = getRandomPosition();
    } else {
        snake.pop();
    }
}

function didGameEnd() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvas.width - gridSize;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > canvas.height - gridSize;
    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function drawFood() {
    ctx.fillStyle = "#f44336";
    ctx.strokeStyle = "#b71c1c";
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
}

function getRandomPosition() {
    let foodX, foodY;
    while (true) {
        foodX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        foodY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;

        // Kiểm tra xem mồi có đè lên thân rắn không
        let isOverSnake = false;
        snake.forEach(part => {
            if (part.x === foodX && part.y === foodY) isOverSnake = true;
        });
        if (!isOverSnake) break;
    }
    return { x: foodX, y: foodY };
}

function gameOver() {
    clearInterval(gameLoop);
    if (soundToggle.checked) hitSound.play();

    finalScoreDisplay.textContent = `Điểm của bạn: ${score}`;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highScoreDisplay.textContent = highScore;
        highScoreMsg.classList.remove("d-none");
    } else {
        highScoreMsg.classList.add("d-none");
    }

    gameOverModal.show();
}

function changeDirection(event) {
    if (isBot) return; // Không cho phép đổi hướng nếu đang ở chế độ Bot

    const keyPressed = event.keyCode;
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -gridSize; dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0; dy = -gridSize;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = gridSize; dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0; dy = gridSize;
    }
}

// Logic cho Bot
function handleBotMove() {
    const head = snake[0];
    const possibleMoves = [
        { dx: gridSize, dy: 0 },
        { dx: -gridSize, dy: 0 },
        { dx: 0, dy: gridSize },
        { dx: 0, dy: -gridSize }
    ];

    // Lọc các nước đi không gây chết ngay lập tức (đối với chế độ "Khó")
    let safeMoves = possibleMoves.filter(move => {
        const nextX = head.x + move.dx;
        const nextY = head.y + move.dy;

        // Tránh tường
        if (nextX < 0 || nextX >= canvas.width || nextY < 0 || nextY >= canvas.height) return false;

        // Tránh thân mình
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === nextX && snake[i].y === nextY) return false;
        }
        return true;
    });

    // Nếu không có nước đi an toàn, Bot vẫn phải đi một hướng nào đó
    if (safeMoves.length === 0) safeMoves = possibleMoves;

    // Chọn nước đi tốt nhất dựa trên khoảng cách đến mồi
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

    // Cập nhật hướng đi
    // Tránh quay đầu 180 độ
    if (bestMove.dx !== -dx || bestMove.dy !== -dy || snake.length === 1) {
        dx = bestMove.dx;
        dy = bestMove.dy;
    }
}

// Xử lý vuốt màn hình
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, false);

canvas.addEventListener('touchend', e => {
    if (isBot) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30 && dx === 0) { dx = gridSize; dy = 0; }
        else if (deltaX < -30 && dx === 0) { dx = -gridSize; dy = 0; }
    } else {
        if (deltaY > 30 && dy === 0) { dx = 0; dy = gridSize; }
        else if (deltaY < -30 && dy === 0) { dx = 0; dy = -gridSize; }
    }
}, false);

// Event Listeners
document.addEventListener("keydown", changeDirection);
startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);
modalRestartBtn.addEventListener("click", () => {
    gameOverModal.hide();
    initGame();
});

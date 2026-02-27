// script.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const modalRestartBtn = document.getElementById("modalRestartBtn");
const score1Display = document.getElementById("score1");
const score2Display = document.getElementById("score2");
const p2NameDisplay = document.getElementById("p2Name");
const modeSelect = document.getElementById("modeSelect");
const aiDifficulty = document.getElementById("aiDifficulty");
const aiDifficultyContainer = document.getElementById("aiDifficultyContainer");
const soundToggle = document.getElementById("soundToggle");
const winnerTitle = document.getElementById("winnerTitle");
const finalScoreMsg = document.getElementById("finalScoreMsg");

let gameOverModal;
document.addEventListener("DOMContentLoaded", () => {
    gameOverModal = new bootstrap.Modal(document.getElementById("gameOverModal"));
});

// Âm thanh
const kickSound = new Audio("https://actions.google.com/sounds/v1/cartoon/punch_kick.ogg");
const goalSound = new Audio("https://actions.google.com/sounds/v1/cartoon/claps_and_cheers.ogg");

function playSound(sound) {
    if (soundToggle.checked) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

// Cấu hình game
const gravity = 0.5;
const friction = 0.98;
const playerSpeed = 5;
const jumpForce = -12;
const ballRadius = 15;
const playerRadius = 30;
const goalWidth = 60;
const goalHeight = 150;

let p1, p2, ball, score1, score2, gameActive = false, animationId;
let keys = {};

class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Vẽ mắt cho cầu thủ
        if (this.radius > 20) {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x + (this.vx >= 0 ? 10 : -10), this.y - 10, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    applyPhysics() {
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Va chạm đất
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }

        // Va chạm tường
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.5;
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -0.5;
        }
    }
}

function initGame() {
    score1 = 0;
    score2 = 0;
    score1Display.textContent = "0";
    score2Display.textContent = "0";
    p2NameDisplay.textContent = modeSelect.value === "pva" ? "Máy" : "Người chơi 2";
    aiDifficultyContainer.classList.toggle("d-none", modeSelect.value === "pvp");

    resetPositions();
    gameActive = true;
    startBtn.classList.add("d-none");
    restartBtn.classList.remove("d-none");

    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function resetPositions() {
    p1 = new Entity(100, canvas.height - playerRadius, playerRadius, "#3b82f6");
    p2 = new Entity(canvas.width - 100, canvas.height - playerRadius, playerRadius, "#ef4444");
    ball = new Entity(canvas.width / 2, canvas.height / 2, ballRadius, "white");
}

function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();

    handleInput();
    if (modeSelect.value === "pva") handleAI();

    [p1, p2, ball].forEach(e => {
        if (e === ball) {
            e.vx *= friction;
            // Giới hạn tốc độ bóng
            const maxSpeed = 15;
            if (Math.abs(e.vx) > maxSpeed) e.vx = Math.sign(e.vx) * maxSpeed;
            if (Math.abs(e.vy) > maxSpeed) e.vy = Math.sign(e.vy) * maxSpeed;
        }
        e.applyPhysics();
    });

    checkCollisions();
    checkGoal();

    [p1, p2, ball].forEach(e => e.draw());

    animationId = requestAnimationFrame(gameLoop);
}

function drawField() {
    // Vẽ cỏ mờ
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI*2);
    ctx.stroke();

    // Vẽ khung thành
    ctx.fillStyle = "white";
    // Khung thành trái
    ctx.fillRect(0, canvas.height - goalHeight, 10, goalHeight);
    ctx.fillRect(0, canvas.height - goalHeight, goalWidth, 5);
    // Khung thành phải
    ctx.fillRect(canvas.width - 10, canvas.height - goalHeight, 10, goalHeight);
    ctx.fillRect(canvas.width - goalWidth, canvas.height - goalHeight, goalWidth, 5);
}

function handleInput() {
    // P1: Mũi tên
    if (keys['ArrowLeft']) p1.vx = -playerSpeed;
    else if (keys['ArrowRight']) p1.vx = playerSpeed;
    else p1.vx = 0;

    if (keys['ArrowUp'] && p1.grounded) {
        p1.vy = jumpForce;
    }

    // P2: WAD (nếu PvP)
    if (modeSelect.value === "pvp") {
        if (keys['KeyA']) p2.vx = -playerSpeed;
        else if (keys['KeyD']) p2.vx = playerSpeed;
        else p2.vx = 0;

        if (keys['KeyW'] && p2.grounded) {
            p2.vy = jumpForce;
        }
    }
}

function handleAI() {
    const diff = aiDifficulty.value;
    let reaction = 0.05;
    if (diff === "medium") reaction = 0.1;
    if (diff === "hard") reaction = 0.2;

    // Di chuyển về phía bóng
    const targetX = ball.x;
    if (p2.x < targetX - 20) p2.vx = playerSpeed * (diff === "easy" ? 0.7 : 1);
    else if (p2.x > targetX + 20) p2.vx = -playerSpeed * (diff === "easy" ? 0.7 : 1);
    else p2.vx = 0;

    // Nhảy nếu bóng ở trên đầu hoặc cần sút
    if (ball.y < p2.y - 50 && ball.x > p2.x - 50 && ball.x < p2.x + 50 && p2.grounded) {
        if (Math.random() < reaction) p2.vy = jumpForce;
    }
}

function checkCollisions() {
    [p1, p2].forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < ball.radius + p.radius) {
            playSound(kickSound);
            // Tính toán hướng đẩy bóng
            const angle = Math.atan2(dy, dx);
            const force = 10;
            ball.vx = Math.cos(angle) * force + p.vx;
            ball.vy = Math.sin(angle) * force + p.vy;

            // Đẩy bóng ra khỏi cầu thủ để tránh kẹt
            const overlap = ball.radius + p.radius - dist;
            ball.x += Math.cos(angle) * overlap;
            ball.y += Math.sin(angle) * overlap;
        }
    });
}

function checkGoal() {
    // Ghi bàn vào lưới trái (P2 ghi điểm)
    if (ball.x - ball.radius < 10 && ball.y > canvas.height - goalHeight) {
        score2++;
        score2Display.textContent = score2;
        goalScored("Người chơi 2 / Máy");
    }
    // Ghi bàn vào lưới phải (P1 ghi điểm)
    if (ball.x + ball.radius > canvas.width - 10 && ball.y > canvas.height - goalHeight) {
        score1++;
        score1Display.textContent = score1;
        goalScored("Người chơi 1");
    }
}

function goalScored(who) {
    playSound(goalSound);
    gameActive = false;

    if (score1 >= 5 || score2 >= 5) {
        showGameOver();
    } else {
        setTimeout(() => {
            resetPositions();
            gameActive = true;
            gameLoop();
        }, 1500);
    }
}

function showGameOver() {
    gameActive = false;
    winnerTitle.textContent = score1 >= 5 ? "NGƯỜI CHƠI 1 THẮNG!" : (modeSelect.value === "pva" ? "MÁY THẮNG!" : "NGƯỜI CHƠI 2 THẮNG!");
    finalScoreMsg.textContent = `${score1} - ${score2}`;
    gameOverModal.show();
}

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
modalRestartBtn.addEventListener('click', () => {
    gameOverModal.hide();
    initGame();
});

modeSelect.addEventListener('change', () => {
    aiDifficultyContainer.classList.toggle("d-none", modeSelect.value === "pvp");
});

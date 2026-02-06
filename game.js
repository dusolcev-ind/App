const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'MENU';
let balls = [];
let path = [];
let spawnTimer = 0;

// 1. Define the Path (A simple S-curve)
function initPath() {
    for (let i = 0; i < 800; i++) {
        path.push({
            x: 100 + i * 0.8,
            y: 300 + Math.sin(i * 0.02) * 150
        });
    }
}

// 2. Ball Object
class Ball {
    constructor(color) {
        this.color = color;
        this.distance = 0; // Distance along the path
        this.radius = 15;
    }

    update() {
        this.distance += 1.5; // Movement speed
    }

    draw() {
        const pos = path[Math.floor(this.distance)];
        if (!pos) return;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// 3. Game Logic
function startGame() {
    gameState = 'PLAYING';
    document.getElementById('main-menu').classList.add('hidden');
    balls = [];
    initPath();
    animate();
}

function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    menu.classList.toggle('hidden');
}

function animate() {
    if (gameState !== 'PLAYING') return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the track (visual guide)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 30;
    ctx.beginPath();
    path.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Spawn new balls
    spawnTimer++;
    if (spawnTimer > 30) {
        balls.push(new Ball(['#e74c3c', '#f1c40f', '#3498db', '#9b59b6'][Math.floor(Math.random() * 4)]));
        spawnTimer = 0;
    }

    // Update and Draw balls
    balls.forEach((ball, index) => {
        ball.update();
        ball.draw();

        // Game over check (if ball reaches end of path)
        if (ball.distance >= path.length - 1) {
            alert("Game Over!");
            gameState = 'MENU';
            document.getElementById('main-menu').classList.remove('hidden');
        }
    });

    requestAnimationFrame(animate);
}

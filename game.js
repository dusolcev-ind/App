const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'PLAYING';
let balls = [];
let projectiles = [];
let path = [];
const SHOOTER_POS = { x: 400, y: 300 };
let mousePos = { x: 0, y: 0 };

// 1. Initialize Path
function initPath() {
    path = [];
    for (let i = 0; i < 1000; i++) {
        path.push({
            x: 100 + i * 0.7,
            y: 300 + Math.sin(i * 0.015) * 180
        });
    }
}

// 2. The Projectile (The fired ball)
class Projectile {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 8;
        this.radius = 15;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.color = '#ffffff';
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        // Deactivate if off-screen
        if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600) this.active = false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// 3. The Chain Ball
class Ball {
    constructor(color) {
        this.color = color;
        this.distance = 0; 
        this.radius = 15;
    }

    getPosition() {
        return path[Math.floor(this.distance)] || { x: -100, y: -100 };
    }

    draw() {
        const pos = this.getPosition();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.stroke();
        ctx.closePath();
    }
}

// --- INPUT HANDLING ---
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => {
    if (gameState !== 'PLAYING') return;
    const angle = Math.atan2(mousePos.y - SHOOTER_POS.y, mousePos.x - SHOOTER_POS.x);
    projectiles.push(new Projectile(SHOOTER_POS.x, SHOOTER_POS.y, angle));
});

// --- CORE LOGIC ---

function update() {
    if (gameState !== 'PLAYING') return;

    // A. Spawn Logic (The "Tight Chain" fix)
    // We only spawn a ball if there's enough room (diameter = 30px)
    if (balls.length === 0 || balls[balls.length - 1].distance > 35) {
        balls.push(new Ball(['#e74c3c', '#f1c40f', '#3498db', '#2ecc71'][Math.floor(Math.random() * 4)]));
    }

    // B. Update Ball Chain
    balls.forEach(ball => ball.distance += 1);

    // C. Update Projectiles
    projectiles.forEach(p => p.update());

    // D. Collision Detection (Projectile vs Chain)
    projectiles.forEach(p => {
        balls.forEach((ball, bIdx) => {
            const bPos = ball.getPosition();
            const dist = Math.sqrt((p.x - bPos.x)**2 + (p.y - bPos.y)**2);
            
            if (dist < 30) { // Collision radius
                balls.splice(bIdx, 1); // Destroy ball
                p.active = false;      // Destroy projectile
            }
        });
    });

    // Clean up inactive projectiles
    projectiles = projectiles.filter(p => p.active);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Shooter (The Frog)
    const angle = Math.atan2(mousePos.y - SHOOTER_POS.y, mousePos.x - SHOOTER_POS.x);
    ctx.save();
    ctx.translate(SHOOTER_POS.x, SHOOTER_POS.y);
    ctx.rotate(angle);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(-20, -20, 40, 40); // Simple square shooter
    ctx.fillStyle = '#fff';
    ctx

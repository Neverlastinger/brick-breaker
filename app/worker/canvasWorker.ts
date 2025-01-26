import Ball from './Ball';
import BrickManager from './BrickManager';
import Platform from './Platform';
import level1 from './levels/1';
import level2 from './levels/2';

const BALL_SPEED = 10;
const BALL_RADIUS = 10;

const levels = [level1, level2];
let currentLevelIndex = 0;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let currentDirection: 'left' | 'right' | null = null;
let platform: Platform;
let ball: Ball;
let bricks: BrickManager;
let loopId: ReturnType<typeof requestAnimationFrame>;
let isGameOver = false;
let isGameStarted = false;

function initializeGame() {
    if (!canvas || !ctx) {
        return;
    }

    platform = new Platform(ctx, { canvasWidth: canvas.width, canvasHeight: canvas.height });
    ball = new Ball(ctx, canvas.width / 2, canvas.height * 0.9 - BALL_RADIUS - 2, BALL_RADIUS, '#00bcd4', BALL_SPEED);
    bricks = new BrickManager(levels[currentLevelIndex], ctx, canvas.width);
}

function draw() {
    if (!canvas || !ctx || isGameOver) {
        cancelAnimationFrame(loopId);
        return;
    }

    if (isGameStarted) {
        ball.update(canvas.width, canvas.height, platform, onGameOver);
    } else {
        ball.draw();
    }
    
    platform.move(currentDirection, canvas.width);
    bricks.draw(ball);

    if (bricks.isLevelCompleted()) {
        currentLevelIndex++;
        if (currentLevelIndex < levels.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            initializeGame();
        } else {
            throw new Error('All levels completed, not implemented yet');
        }
    }

    cancelAnimationFrame(loopId);

    if (isGameStarted) {
        loopId = requestAnimationFrame(draw);
    }
}

function onGameOver() {
    cancelAnimationFrame(loopId);
    isGameOver = true

    if (ctx && canvas) {
        ctx.font = '48px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height * 0.8);
        ctx.font = '24px Arial';
        ctx.fillText('Press Spacebar to start again', canvas.width / 2, canvas.height * 0.8 + 30);
    }
}

function drawStartGameMessage() {
    if (ctx && canvas) {
        ctx.font = '48px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Brick Breaker by Rado', canvas.width / 2, canvas.height * 0.8);
        ctx.font = '24px Arial';
        ctx.fillText('Press Spacebar to start', canvas.width / 2, canvas.height * 0.8 + 30);
    }
}

function clearStartGameMessage() {
    if (ctx && canvas) {
        ctx.clearRect(0, canvas.height * 0.8 - 60, canvas.width, 120);
    }
}

function restartGame() {
    if (!canvas || !ctx) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    isGameOver = false;
    initializeGame();
    draw();
}

self.onmessage = (event) => {
    const { canvas: _canvas, direction, command } = event.data;

    if (_canvas) {
        canvas = _canvas;
        ctx = _canvas.getContext('2d');

        if (canvas && ctx) {
            initializeGame();
            drawStartGameMessage();
            draw();
        }
    }

    if (direction !== undefined) {
        currentDirection = direction;
    }

    if (command === 'space') {
        if (isGameOver) {
            restartGame();
        } else {
            isGameStarted = true;
            clearStartGameMessage();
            draw();
        }
    }
};

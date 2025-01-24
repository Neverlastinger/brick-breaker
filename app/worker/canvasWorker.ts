import Ball from './Ball';
import BrickManager from './BrickManager';
import Platform from './Platform';
import level1 from './levels/1';

const BALL_SPEED = 7;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let currentDirection: 'left' | 'right' | null = null;
let platform: Platform;
let ball: Ball;
let bricks: BrickManager;
let loopId: ReturnType<typeof requestAnimationFrame>;
let isGameOver = false;

function initializeGame(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    platform = new Platform(ctx, { canvasWidth: canvas.width, canvasHeight: canvas.height });
    ball = new Ball(ctx, canvas.width / 2, canvas.height * 0.85, 10, '#00bcd4', BALL_SPEED * Math.random(), -BALL_SPEED);
    bricks = new BrickManager(level1, ctx, canvas.width);
}

function draw() {
    if (!canvas || !ctx || isGameOver) {
        return;
    }

    ball.update(canvas.width, canvas.height, platform, onGameOver);
    platform.move(currentDirection, canvas.width);
    bricks.draw(ball);

    cancelAnimationFrame(loopId);
    loopId = requestAnimationFrame(draw);
}

function onGameOver() {
    cancelAnimationFrame(loopId);
    isGameOver = true

    if (ctx && canvas) {
        ctx.font = '48px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press Spacebar to start again', canvas.width / 2, canvas.height / 2 + 30);
    }
}

function restartGame() {
    if (!canvas || !ctx) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    isGameOver = false;
    initializeGame(canvas, ctx);
    draw();
}

self.onmessage = (event) => {
    const { canvas: _canvas, direction, command } = event.data;

    if (_canvas) {
        canvas = _canvas;
        ctx = _canvas.getContext('2d');

        if (canvas && ctx) {
            initializeGame(canvas, ctx);
        }

        draw();
    }

    if (direction !== undefined) {
        currentDirection = direction;
    }

    if (command === 'space' && isGameOver) {
        restartGame();
    }
};

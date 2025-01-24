import Ball from './Ball';
import BrickManager from './BrickManager';
import Platform from './Platform';
import level1 from './levels/1';

const BALL_SPEED = 4;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let currentDirection: 'left' | 'right' | null = null;
let platform: Platform;
let ball: Ball;
let bricks: BrickManager;
let loopId: ReturnType<typeof requestAnimationFrame>;

function initializeGame(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    platform = new Platform(ctx, { canvasWidth: canvas.width, canvasHeight: canvas.height });
    ball = new Ball(ctx, canvas.width / 2, canvas.height / 2, 10, '#00bcd4', BALL_SPEED, -BALL_SPEED);
    bricks = new BrickManager(level1, ctx, canvas.width);
}

function draw() {
    if (!canvas || !ctx) {
        return;
    }

    ball.update(canvas.width, canvas.height, platform);
    platform.move(currentDirection, canvas.width);
    bricks.draw(ball);

    cancelAnimationFrame(loopId);
    loopId = requestAnimationFrame(draw);
}

self.onmessage = (event) => {
    const { canvas: _canvas, direction } = event.data;

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
};

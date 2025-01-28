import Ball from './Ball';
import BrickManager from './BrickManager';
import Platform from './Platform';
import level1 from './levels/1';
import level2 from './levels/2';
import level3 from './levels/3';
import MessageHandler from './MessageHandler';
import { ACTIONS } from '../actions';

const BALL_SPEED = 10;
const BALL_RADIUS = 10;

const levels = [level1, level2, level3];
let currentLevelIndex = 0;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let currentDirection: 'left' | 'right' | null = null;
let platform: Platform;
let ball: Ball;
let bricks: BrickManager;
let messageHandler: MessageHandler;
let loopId: ReturnType<typeof requestAnimationFrame>;

enum GAME_STATES {
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    GAME_WON = 'GAME_WON',
    LIFE_LOST = 'LIFE_LOST',
}

let gameState = GAME_STATES.PAUSED;

function initializeGame() {
    if (!canvas || !ctx) {
        return;
    }

    platform = new Platform(ctx, { canvasWidth: canvas.width, canvasHeight: canvas.height });

    ball = new Ball({
        ctx, 
        platform,
        radius: BALL_RADIUS, 
        color: '#00bcd4', 
        speed: BALL_SPEED
    });

    bricks = new BrickManager(levels[currentLevelIndex], ctx, canvas.width, canvas.height);
    messageHandler = new MessageHandler(ctx, canvas);
}

function draw() {
    if (!canvas || !ctx) {
        cancelAnimationFrame(loopId);
        return;
    }

    if (gameState === GAME_STATES.PAUSED) {
        ball.draw();
        ball.pause();
    } else if (gameState === GAME_STATES.RUNNING) {
        ball.update(canvas.width, canvas.height, platform, () => {
            gameState = GAME_STATES.LIFE_LOST;
            ball.pause();
        });
    } else {
        ball.draw();
    }

    platform.move(currentDirection, canvas.width);
    bricks.draw(ball);

    if (gameState === GAME_STATES.LIFE_LOST && messageHandler) {
        messageHandler.showMessage('Life Lost', 'Press Spacebar to continue');
        
        postMessage({
            action: ACTIONS.PLAY_GAME_OVER_SOUND
        });
    }

    if (bricks.isLevelCompleted()) {
        currentLevelIndex++;
        if (currentLevelIndex < levels.length) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            initializeGame();
        } else {
            gameState = GAME_STATES.GAME_WON;
            ball.draw();
            messageHandler.showMessage('You Won!', 'Press Spacebar to start again');
        }

        postMessage({
            action: ACTIONS.PLAY_LEVEL_COMPLETE_SOUND
        });
    }

    cancelAnimationFrame(loopId);

    if (gameState === GAME_STATES.RUNNING) {
        loopId = requestAnimationFrame(draw);
    }
}

self.onmessage = (event) => {
    const { canvas: _canvas, direction, command } = event.data;

    if (_canvas) {
        canvas = _canvas;
        ctx = _canvas.getContext('2d');

        if (canvas && ctx) {
            initializeGame();
            draw();
            messageHandler.showMessage('Brick Breaker by Rado', 'Press Spacebar to start');
        }
    }

    if (direction !== undefined) {
        currentDirection = direction;
    }

    if (command === 'space') {
        if (ctx && canvas) {
            if (gameState === GAME_STATES.GAME_WON) {                
                gameState = GAME_STATES.RUNNING;
                currentLevelIndex = 0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                initializeGame();
                draw();
            } else if (gameState === GAME_STATES.LIFE_LOST) {
                gameState = GAME_STATES.RUNNING;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ball.positionOnPlatform(platform);
                draw();
            } else if (gameState === GAME_STATES.PAUSED) {
                gameState = GAME_STATES.RUNNING;
                messageHandler.clearMessage();
                draw();
            } else if (gameState === GAME_STATES.RUNNING) {
                gameState = GAME_STATES.PAUSED;
                messageHandler.showMessage('Paused', 'Press Spacebar to continue');
            }
        }
    }
};

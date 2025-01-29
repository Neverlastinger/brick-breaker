import Ball from './Ball';
import BrickManager from './BrickManager';
import Platform from './Platform';
import level1 from './levels/1';
import level2 from './levels/2';
import level3 from './levels/3';
import MessageHandler from './MessageHandler';
import { ACTIONS } from '../actions';
import { COMMANDS } from '../commands';

const DEFAULT_BALL_SPEED = 10;
const CANVAS_HEIGHT_FOR_DEFAULT_SPEED = 400;
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
let movePlatformTo: number | null = null;

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
        speed: DEFAULT_BALL_SPEED + Math.max(0, canvas.height - CANVAS_HEIGHT_FOR_DEFAULT_SPEED) / 100
    });

    bricks = new BrickManager(levels[currentLevelIndex], ctx, canvas.width, canvas.height);
    messageHandler = new MessageHandler(ctx, canvas);
}

function draw() {
    if (!canvas || !ctx) {
        cancelAnimationFrame(loopId);
        return;
    }

    if (gameState === GAME_STATES.RUNNING) {
        messageHandler.clearMessage();
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

    if (movePlatformTo !== null) {
        platform.jump(movePlatformTo);
        movePlatformTo = null;
    } else {
        platform.move(currentDirection);
    }
    
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
            messageHandler.showMessage(`Level ${currentLevelIndex + 1}`, 'Press Spacebar to continue');
            gameState = GAME_STATES.PAUSED;
            initializeGame();
            draw();
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

function restartGameFromBeginning() {
    if (ctx && canvas) {
        gameState = GAME_STATES.RUNNING;
        currentLevelIndex = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initializeGame();
        draw();
    }
}

function resumeGameAfterLifeLost() {
    gameState = GAME_STATES.RUNNING;
    ball.positionOnPlatform(platform);
    ball.draw();
    draw();
}

function resumeGameAfterPause() {
    gameState = GAME_STATES.RUNNING;
    draw();
}

self.onmessage = (event) => {
    const { canvas: _canvas, direction, command, x } = event.data;

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

    if (command === COMMANDS.SPACE) {
        if (ctx && canvas) {
            if (gameState === GAME_STATES.GAME_WON) {                
                restartGameFromBeginning();
            } else if (gameState === GAME_STATES.LIFE_LOST) {
                resumeGameAfterLifeLost();
            } else if (gameState === GAME_STATES.PAUSED) {
                resumeGameAfterPause();
            } else if (gameState === GAME_STATES.RUNNING) {
                gameState = GAME_STATES.PAUSED;
                messageHandler.showMessage('Paused', 'Press Spacebar to continue');
            }
        }
    }

    if (command === COMMANDS.TOUCH) {
        if (ctx && canvas) {
            if (gameState === GAME_STATES.GAME_WON) {                
                restartGameFromBeginning();
            } else if (gameState === GAME_STATES.LIFE_LOST) {
                resumeGameAfterLifeLost();
            } else if (gameState === GAME_STATES.PAUSED) {
                resumeGameAfterPause();
            } else if (gameState === GAME_STATES.RUNNING) {
                movePlatformTo = x;
            }
        }
    }

    if (command === COMMANDS.TOUCH_MOVE) {
        if (gameState === GAME_STATES.RUNNING) {
            movePlatformTo = x;
        }
    }
};

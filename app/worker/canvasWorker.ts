import Ball from './Ball';
import BrickManager from './BrickManager';
import Platform from './Platform';
import level1 from './levels/1';
import level2 from './levels/2';
import level3 from './levels/3';
import level3c from './levels/3c';
import level3b from './levels/3b';
import level4 from './levels/4';
import level5 from './levels/5';
import MessageHandler from './MessageHandler';
import { ACTIONS } from '../actions';
import { COMMANDS } from '../commands';
import { BALL_RADIUS, CANVAS_HEIGHT_FOR_DEFAULT_SPEED, DEFAULT_BALL_COLOR, DEFAULT_BALL_SPEED } from './game-config';
import BallManager from './BallManager';
import Timer from './Timer';

const levels = [level1, level2, level3, level3b, level3c, level4, level5];
let currentLevelIndex = 0;
let difficulty = 0;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let currentDirection: 'left' | 'right' | null = null;
let platform: Platform;
let ballManager: BallManager;
let bricks: BrickManager;
let messageHandler: MessageHandler;
let loopId: ReturnType<typeof requestAnimationFrame>;
let movePlatformTo: number | null = null;
let timer: Timer;

enum GAME_STATES {
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    GAME_WON = 'GAME_WON',
    LIFE_LOST = 'LIFE_LOST',
    GAME_OVER_BLOCKED_SCREEN = 'GAME_OVER_BLOCKED_SCREEN',
    GAME_OVER = 'GAME_OVER'
}

let gameState = GAME_STATES.PAUSED;

function initializeLevel() {
    if (!canvas || !ctx) {
        return;
    }

    platform = new Platform(ctx, { canvasWidth: canvas.width, canvasHeight: canvas.height });
    const ballSpeed = DEFAULT_BALL_SPEED + Math.max(0, canvas.height - CANVAS_HEIGHT_FOR_DEFAULT_SPEED) / 100;

    const ball = new Ball({
        ctx, 
        platform,
        radius: BALL_RADIUS, 
        color: DEFAULT_BALL_COLOR, 
        speed: ballSpeed
    });

    ballManager = new BallManager();
    ballManager.push(ball);

    bricks = new BrickManager({ 
        level: levels[currentLevelIndex], 
        difficulty,
        ctx,  
        canvasWidth: canvas.width, 
        canvasHeight: canvas.height,
        bonusSpeed: ballSpeed * 0.6
    });

    messageHandler = new MessageHandler(ctx, canvas);

    if (!timer) {
        timer = new Timer({
            ctx,
            canvas,
            onTimeUp: () => {
                triggerGameOver();
            },
        });
    }
}

function draw() {
    if (!canvas || !ctx) {
        cancelAnimationFrame(loopId);
        return;
    }

    timer.draw();

    if (gameState === GAME_STATES.RUNNING) {
        messageHandler.clearMessage();
    }

    if (gameState === GAME_STATES.PAUSED) {
        ballManager.draw();
        ballManager.pause();
    } else if (gameState === GAME_STATES.RUNNING) {
        ballManager.clear();

        ballManager.update(canvas.width, canvas.height, platform, () => {
            gameState = GAME_STATES.LIFE_LOST;
            ballManager.pause();
            timer.stop();
            bricks.cancelBonuses();
        });
    } else {
        ballManager.clear();
        ballManager.draw();
    }

    if (movePlatformTo !== null) {
        platform.jump(movePlatformTo);
        movePlatformTo = null;
    } else {
        platform.move(currentDirection);
    }
    
    bricks.draw({ 
        balls: ballManager.getBalls(), 
        onBallReleased: (ball: Ball) => {
            ball.release();
            ballManager.push(ball);
        },
        platform,
        timer
    });

    if (gameState === GAME_STATES.LIFE_LOST && messageHandler) {
        timer.subtractMinute(); // Lose 1 minute
        timer.draw();

        if (timer.hasRunOut()) {
            triggerGameOver();
        } else {
            timer.getTime();
            const minutes = Math.floor(timer.getTime() / 60);
            const seconds = timer.getTime() % 60;

            messageHandler.showMessage('You lost a minute', `Time remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

            postMessage({
                action: ACTIONS.PLAY_LIFE_LOST_SOUND
            });
        }
    }

    if (bricks.isLevelCompleted()) {
        currentLevelIndex++;

        if (currentLevelIndex === levels.length) {
            currentLevelIndex = 0;
            difficulty++;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        messageHandler.showMessage(`Level ${difficulty * levels.length + currentLevelIndex + 1}`, 'Press Spacebar to continue');
        gameState = GAME_STATES.PAUSED;
        initializeLevel();
        draw();

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
        difficulty = 0;
        currentLevelIndex = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        timer.reset();
        timer.start();
        initializeLevel();
        draw();
    }
}

function resumeGameAfterLifeLost() {
    gameState = GAME_STATES.RUNNING;
    timer.start();

    if (!ctx || !canvas) {
        return;
    }

    const ball = new Ball({
        ctx, 
        platform,
        radius: BALL_RADIUS, 
        color: DEFAULT_BALL_COLOR, 
        speed: DEFAULT_BALL_SPEED + Math.max(0, canvas.height - CANVAS_HEIGHT_FOR_DEFAULT_SPEED) / 100
    });

    ballManager.push(ball);
    ballManager.positionOnPlatform(platform);
    ballManager.draw();
    draw();
}

function resumeGameAfterPause() {
    gameState = GAME_STATES.RUNNING;
    timer.start();
    draw();
}

function triggerGameOver() {
    gameState = GAME_STATES.GAME_OVER_BLOCKED_SCREEN;
    messageHandler.showMessage('Game Over');
    postMessage({ action: ACTIONS.PLAY_GAME_OVER_SOUND });
    timer.stop();

    setTimeout(() => {
        messageHandler.clearMessage();
        messageHandler.showMessage('Game Over', 'Press Spacebar to restart');
        gameState = GAME_STATES.GAME_OVER;
    }, 6000);
}

self.onmessage = (event) => {
    const { canvas: _canvas, direction, command, x } = event.data;

    if (_canvas) {
        canvas = _canvas;
        ctx = _canvas.getContext('2d');

        if (canvas && ctx) {
            initializeLevel();
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
            } else if (gameState === GAME_STATES.GAME_OVER) {
                restartGameFromBeginning()
            } else if (gameState === GAME_STATES.LIFE_LOST) {
                resumeGameAfterLifeLost();
            } else if (gameState === GAME_STATES.PAUSED) {
                resumeGameAfterPause();
            } else if (gameState === GAME_STATES.RUNNING) {
                gameState = GAME_STATES.PAUSED;
                timer.stop();
                bricks.cancelBonuses();
                messageHandler.showMessage('Paused', 'Press Spacebar to continue');
            }
        }
    }

    if (command === COMMANDS.TOUCH) {
        if (ctx && canvas) {
            if (gameState === GAME_STATES.GAME_WON) {                
                restartGameFromBeginning();
            } else if (gameState === GAME_STATES.GAME_OVER) {
                restartGameFromBeginning()
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

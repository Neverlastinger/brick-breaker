import Ball from './Ball';
import Brick from './Brick';
import { BONUSES } from './bonuses';
import { ADDITIONAL_BALL_CHANCE, MAX_BONUS_BALLS } from './game-config';

const BRICK_HEIGHT_TO_CANVAS_HEIGHT_RATIO = 40;
const BRICK_PADDING_TO_CANVAS_HEIGHT_RATIO = 160;

interface DrawParams {
    balls: Ball[], 
    onBallReleased: (ball: Ball) => void
}

export default class BrickManager {
    private ctx: CanvasRenderingContext2D;
    private level: (number | null)[][];
    private rowLength: number;
    private bricks: Brick[] = [];
    private brickWidth: number;
    private brickHeight: number;
    private brickPadding: number;
    private levelCompleted = false;
    private bonusBalls = 0;

    constructor(
        level: (number | null)[][],
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
        canvasHeight: number
    ) {
        this.level = level;
        this.rowLength = Math.max(...this.level.map((row) => row.length));
        this.ctx = ctx;
        this.brickPadding = Math.ceil(canvasHeight / BRICK_PADDING_TO_CANVAS_HEIGHT_RATIO);
        this.brickWidth = (canvasWidth - this.brickPadding * (this.rowLength + 1)) / this.rowLength;
        this.brickHeight = canvasHeight / BRICK_HEIGHT_TO_CANVAS_HEIGHT_RATIO;

        this.createBricks();
    }

    private createBricks() {
        for (let row = 0; row < this.level.length; row++) {
            for (let col = 0; col < this.rowLength; col++) {
                if (!this.level[row][col]) {
                    continue;
                }

                const x = this.brickPadding + col * (this.brickWidth + this.brickPadding);
                const y = row * (this.brickHeight + this.brickPadding);
                const color = `hsl(${(row / this.level.length) * 360}, 70%, 50%)`;
                this.bricks.push(new Brick(this.ctx, x, y, this.brickWidth, this.brickHeight, color, this.getSpecialty()));
            }
        }

        // An idea to position bricks at the bottom
        //
        // for (let col = 0; col < this.rowLength; col++) {
        //     const x = this.brickPadding + col * (this.brickWidth + this.brickPadding);
        //     const y = this.canvasHeight - (this.brickHeight + this.brickPadding);
        //     const color = `hsl(${(this.rowLength / this.level.length) * 360}, 70%, 50%)`;
        //     this.bricks.push(new Brick(this.ctx, x, y, this.brickWidth, this.brickHeight, color));
        // }
    }

    private getSpecialty(): string | null {
        const rand = Math.random();

        if (this.bonusBalls < MAX_BONUS_BALLS && ADDITIONAL_BALL_CHANCE[0] < rand  && rand < ADDITIONAL_BALL_CHANCE[1]) {
            this.bonusBalls++;
            return BONUSES.ADDITIONAL_BALL
        }

        return null;
    }

    draw({ balls, onBallReleased }: DrawParams) {
        let hasCollided = false;

        this.bricks.forEach((brick) => {
            if (brick.draw(balls, { skipCollisionCheck: hasCollided, onBallReleased })) {
                hasCollided = true;
            }
        });

        if (this.bricks.every((brick) => !brick.getIsVisible())) {
            this.levelCompleted = true;
        }
    }

    isLevelCompleted() {
        return this.levelCompleted;
    }
}

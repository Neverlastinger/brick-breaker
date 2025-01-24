import { skip } from 'node:test';
import Ball from './Ball';
import Brick from './Brick';

export default class BrickManager {
    private ctx: CanvasRenderingContext2D;
    private level: (number | null)[][];
    private rowLength: number;
    private bricks: Brick[] = [];
    private brickWidth: number;
    private brickHeight: number;
    private brickPadding: number;

    constructor(
        level: (number | null)[][],
        ctx: CanvasRenderingContext2D,
        canvasWidth: number,
    ) {
        this.level = level;
        this.rowLength = Math.max(...this.level.map((row) => row.length));
        this.ctx = ctx;
        this.brickPadding = 6;
        this.brickWidth = (canvasWidth - this.brickPadding * this.rowLength) / this.rowLength;
        this.brickHeight = 20;

        this.createBricks();
    }

    private createBricks() {
        for (let row = 0; row < this.level.length; row++) {
            for (let col = 0; col < this.rowLength; col++) {
                if (!this.level[row][col]) {
                    continue;
                }

                const x = col * (this.brickWidth + this.brickPadding);
                const y = row * (this.brickHeight + this.brickPadding);
                const color = `hsl(${(row / this.level.length) * 360}, 70%, 50%)`;
                this.bricks.push(new Brick(this.ctx, x, y, this.brickWidth, this.brickHeight, color));
            }
        }
    }

    draw(ball: Ball) {
        let hasCollided = false;

        this.bricks.forEach((brick) => {
            if (brick.draw(ball, { skipCollisionCheck: hasCollided })) {
                hasCollided = true;
            }
        });
    }
}

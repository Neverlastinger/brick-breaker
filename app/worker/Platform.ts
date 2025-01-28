import CollidableObject from "./CollidableObject";
import { drawRoundedRect } from "./lib/shape";

const PLATFORM_WIDTH_TO_CANVAS_WIDTH_RATIO = 6;
const PLATFORM_HEIGHT = 8;

export default class Platform extends CollidableObject {
    private speed = 12;
    private color = '#ffcdd2';
    private clearBuffer = this.speed + 1;
    private borderRadius = 10;
    private borderWidth = 2;
    private borderColor = '#ef9a9a';

    constructor(
        ctx: CanvasRenderingContext2D,
        { canvasWidth, canvasHeight }: { canvasWidth: number; canvasHeight: number }
    ) {
        const platformWidth = canvasWidth / PLATFORM_WIDTH_TO_CANVAS_WIDTH_RATIO;
        super(ctx, canvasWidth / 2 - platformWidth / 2, canvasHeight * 0.9, platformWidth, PLATFORM_HEIGHT);
        this.ctx = ctx;
    }

    move(direction: 'left' | 'right' | null, canvasWidth: number) {
        if (direction === 'left') {
            this.x = Math.max(0, this.x - this.speed); // Prevent moving out on the left
        } else if (direction === 'right') {
            this.x = Math.min(canvasWidth - this.width, this.x + this.speed); // Prevent moving out on the right
        }

        this.draw();
    }

    private draw() {
        // Clear the previous position
        this.ctx.clearRect(
            this.x - this.borderWidth - this.clearBuffer,
            this.y - this.borderWidth - 1,
            this.width + 2 * this.borderWidth + 2 * this.clearBuffer,
            this.height + 2 * this.borderWidth + 2
        );

        drawRoundedRect(this.ctx, this.x, this.y, this.width, this.height, this.borderRadius, this.color, this.borderColor, this.borderWidth);
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width + this.borderWidth, height: this.height + this.borderWidth };
    }
}

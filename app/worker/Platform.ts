import CollidableObject from "./CollidableObject";
import { drawRoundedRect } from "./lib/shape";

const MIN_PLATFORM_WIDTH = 100;
const PLATFORM_WIDTH_TO_CANVAS_WIDTH_RATIO = 5;
const PLATFORM_HEIGHT = 8;

export default class Platform extends CollidableObject {
    private speed = 12;
    private color = '#ffcdd2';
    private clearBuffer = this.speed + 1;
    private borderRadius = 10;
    private borderWidth = 2;
    private borderColor = '#ef9a9a';
    private canvasWidth: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        { canvasWidth, canvasHeight }: { canvasWidth: number; canvasHeight: number }
    ) {
        const platformWidth = Math.max(MIN_PLATFORM_WIDTH, canvasWidth / PLATFORM_WIDTH_TO_CANVAS_WIDTH_RATIO);
        super(ctx, canvasWidth / 2 - platformWidth / 2, canvasHeight * 0.9, platformWidth, PLATFORM_HEIGHT);
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
    }

    move(direction: 'left' | 'right' | null) {
        this.clear();        
        
        if (direction === 'left') {
            this.x = Math.max(0, this.x - this.speed); // Prevent moving out on the left
        } else if (direction === 'right') {
            this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed); // Prevent moving out on the right
        }

        this.draw();
    }

    jump(x: number) {
        this.clear(); 
        this.x = Math.max(0, Math.min(this.canvasWidth - this.width, x - this.width / 2));
        this.draw();
    }

    private draw() {
        drawRoundedRect({
            ctx: this.ctx, 
            x: this.x, 
            y: this.y, 
            width: this.width, 
            height: this.height, 
            radius: this.borderRadius, 
            color: this.color, 
            borderColor: this.borderColor, 
            borderWidth: this.borderWidth
        });
    }

    private clear() {
        // Clear the previous position
        this.ctx.clearRect(
            this.x - this.borderWidth - this.clearBuffer,
            this.y - this.borderWidth - 1,
            this.width + 2 * this.borderWidth + 2 * this.clearBuffer,
            this.height + 2 * this.borderWidth + 2
        );
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width + this.borderWidth, height: this.height + this.borderWidth };
    }
}

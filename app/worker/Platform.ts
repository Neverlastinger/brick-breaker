import CollidableObject from "./CollidableObject";

const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 10;

export default class Platform extends CollidableObject {
    private speed = 12;
    private color = '#b26500';
    private clearBuffer = this.speed + 1;

    constructor(
        ctx: CanvasRenderingContext2D,
        { canvasWidth, canvasHeight }: { canvasWidth: number; canvasHeight: number }
    ) {
        super(ctx, canvasWidth / 2 - PLATFORM_WIDTH / 2, canvasHeight * 0.9, PLATFORM_WIDTH, PLATFORM_HEIGHT);
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
            this.x - this.clearBuffer,
            this.y - 1,
            this.width + 2 * this.clearBuffer,
            this.height + 2
        );

        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

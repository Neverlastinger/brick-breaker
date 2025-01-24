export default class Platform {
    private ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private width = 100;
    private height = 10;
    private speed = 8;
    private color = '#b26500';
    private clearBuffer = this.speed + 1;

    constructor(
        ctx: CanvasRenderingContext2D,
        { canvasWidth, canvasHeight }: { canvasWidth: number; canvasHeight: number }
    ) {
        this.ctx = ctx;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight * 0.9;
    }

    draw() {
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

    move(direction: 'left' | 'right' | null, canvasWidth: number) {
        if (direction === 'left') {
            this.x = Math.max(0, this.x - this.speed); // Prevent moving out on the left
        } else if (direction === 'right') {
            this.x = Math.min(canvasWidth - this.width, this.x + this.speed); // Prevent moving out on the right
        }

        this.draw();
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

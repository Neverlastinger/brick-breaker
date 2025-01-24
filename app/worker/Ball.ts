import Platform from "./Platform";

export default class Ball {
    private ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private radius: number;
    private color: string;
    private velocityX: number; 
    private velocityY: number; 
    private clearBuffer: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        color: string,
        velocityX: number,
        velocityY: number
    ) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.clearBuffer = Math.max(Math.ceil(velocityX * 1.5), Math.ceil(velocityY * 1.5));
    }

    draw() {
        // Clear the previous position
        this.ctx.clearRect(
            this.x - this.radius - this.clearBuffer,
            this.y - this.radius - this.clearBuffer,
            this.radius * 2 + 2 * this.clearBuffer,
            this.radius * 2 + 2 * this.clearBuffer
        );

        // Draw the ball at its current position
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    update(canvasWidth: number, canvasHeight: number, platform: Platform) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Check for collisions with the walls
        if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
            this.velocityX *= -1; // Reverse horizontal direction
        }

        if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
            this.velocityY *= -1; // Reverse vertical direction
        }

        // Bounce off the platform
        if (this.checkCollisionWithPlatform(platform)) {
            this.velocityY *= -1;
            this.y = platform.getBounds().y - this.radius;
        }

        this.draw();
    }

    getBounds() {
        return { x: this.x, y: this.y, radius: this.radius, velocityX: this.velocityX, velocityY: this.velocityY };
    }

    reverseY() {
        this.velocityY *= -1;
    }

    reverseX() {
        this.velocityX *= -1;
    }

    private checkCollisionWithPlatform(platform: Platform): boolean {
        const { x: platformX, y: platformY, width: platformWidth, height: platformHeight } = platform.getBounds();
        
        return (
            this.y + this.radius >= platformY && // Ball is at the platform's height
            this.x + this.radius > platformX && // Ball's right edge is within platform
            this.x - this.radius < platformX + platformWidth // Ball's left edge is within platform
        );
    }
}

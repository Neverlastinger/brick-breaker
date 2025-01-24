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
    private lastTime: number | null = null;

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
        this.clearBuffer = Math.abs(Math.ceil(velocityY * 1.5));
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

    update(canvasWidth: number, canvasHeight: number, platform: Platform, onGameOver: () => void) {
        const now = performance.now();
        if (this.lastTime === null) {
            this.lastTime = now;
        }
        const deltaTime = (now - this.lastTime) / 1000; // Time in seconds
        this.lastTime = now;

        this.x += this.velocityX * deltaTime * 60; // Normalize to 60 FPS
        this.y += this.velocityY * deltaTime * 60; // Normalize to 60 FPS

        // Check for collisions with the walls
        if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
            this.velocityX *= -1; // Reverse horizontal direction
        }

        if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
            this.velocityY *= -1; // Reverse vertical direction
        }

            // Check if the ball hits the ground
        if (this.y + this.radius > canvasHeight) {
            onGameOver(); // Trigger the game over callback
            return;
        }

        // Bounce off the platform
        this.checkCollisionWithPlatform(platform);

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

    private checkCollisionWithPlatform(platform: Platform) {
        const { x: platformX, y: platformY, width: platformWidth } = platform.getBounds();
    
        const isColliding =
            this.y + this.radius >= platformY && // Ball is at the platform's height
            this.x + this.radius > platformX && // Ball's right edge is within platform
            this.x - this.radius < platformX + platformWidth; // Ball's left edge is within platform
    
        if (isColliding) {
            // Calculate the offset from the platform's center
            const platformCenter = platformX + platformWidth / 2;
            const hitOffset = (this.x - platformCenter) / (platformWidth / 2); // Normalize between -1 and 1
    
            // Adjust horizontal velocity based on the hit offset
            const maxBounceAngle = Math.PI / 4; // 45 degrees
            const bounceAngle = hitOffset * maxBounceAngle;
    
            const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2); // Maintain constant speed
            this.velocityX = speed * Math.sin(bounceAngle);
            this.velocityY = -Math.abs(speed * Math.cos(bounceAngle)); // Ensure the ball moves upward
        }
    }
}

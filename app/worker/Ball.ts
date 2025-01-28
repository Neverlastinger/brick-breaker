import { ACTIONS } from "../actions";
import Platform from "./Platform";

interface Props {
    ctx: CanvasRenderingContext2D,
    platform: Platform,
    radius: number,
    color: string,
    speed: number,
}

export default class Ball {
    private ctx: CanvasRenderingContext2D;
    private x: number = 0;
    private y: number = 0;
    private radius: number;
    private color: string;
    private velocityX: number; 
    private velocityY: number; 
    private clearBuffer: number;
    private lastTime: number | null = null;

    constructor({ ctx, platform, radius, color, speed }: Props) {
        this.ctx = ctx;
        this.radius = radius;
        this.positionOnPlatform(platform);
        this.color = color;
        this.velocityX = 0;
        this.velocityY = speed;
        this.bounceOffPlatformVertically(0, 0, Math.random() * 2 - 1);
        this.clearBuffer = Math.abs(Math.ceil(speed * 1.5));
    }

    draw() {
        this.clear();

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

        // Check for collisions with the left wall
        if (this.x - this.radius < 0 && this.velocityX < 0) {
            this.reverseX(); // Reverse horizontal direction
        }

        // Check for collisions with the right wall
        if (this.x + this.radius > canvasWidth && this.velocityX > 0) {
            this.reverseX(); // Reverse horizontal direction
        }

        // Check for collisions with the ceiling
        if (this.y - this.radius < 0 && this.velocityY < 0) {
            this.reverseY(); // Reverse vertical direction
        }

        // Check if the ball hits the ground
        if (this.y + this.radius > canvasHeight && this.velocityY > 0) {
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

    pause() {
        this.lastTime = null;
    }

    positionOnPlatform(platform: Platform) {
        this.clear();
        
        const { x: platformX, y: platformY, width: platformWidth, height: platformHeight } = platform.getBounds();

        this.x = platformX + platformWidth / 2 - this.radius / 2;
        this.y = platformY - platformHeight / 2 - this.radius;
    }

    private checkCollisionWithPlatform(platform: Platform) {
        const { x: platformX, y: platformY, width: platformWidth, height: platformHeight } = platform.getBounds();

        const isColliding =
            this.x + this.radius > platformX &&
            this.x - this.radius < platformX + platformWidth &&
            this.y + this.radius > platformY &&
            this.y - this.radius < platformY + platformHeight;
    
        if (isColliding) {
            // Check which side of the object the ball collided with
            const overlapTop = this.y + this.radius - platformY;
            const overlapBottom = platformY + platformHeight - (this.y - this.radius);
            const overlapLeft = this.x - this.radius - platformX
            const overlapRight = platformX + platformWidth - (this.x + this.radius);

            const threshold = Math.abs(this.velocityY);

            if (overlapTop < threshold && this.velocityY > 0) { // Top collision and ball is moving down
                this.bounceOffPlatformVertically(platformX, platformWidth);
            } else if (overlapBottom < threshold && this.velocityY < 0) { // Bottom collision and ball is moving up
                this.bounceOffPlatformVertically(platformX, platformWidth);
            }
            
            else if (overlapLeft < overlapRight && this.velocityX > 0) { // Left collision and ball is moving to the right
                this.reverseX(); 
            } else if (overlapLeft > overlapRight && this.velocityX < 0) { // Right collision and ball is moving to the left
                this.reverseX(); 
            }

            postMessage({ action: ACTIONS.PLAY_BOUNCE_SOUND });
        }
    }

    private bounceOffPlatformVertically(platformX: number, platformWidth: number, predefinedHitOffset?: number) {
        // Calculate the offset from the platform's center
        const platformCenter = platformX + platformWidth / 2;
        const hitOffset = predefinedHitOffset || (this.x - platformCenter) / (platformWidth / 2); // Normalize between -1 and 1

        // Adjust horizontal velocity based on the hit offset
        const maxBounceAngle = Math.PI / 4; // 45 degrees
        const bounceAngle = hitOffset * maxBounceAngle;

        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2); // Maintain constant speed
        this.velocityX = speed * Math.sin(bounceAngle);
        this.velocityY = speed * Math.cos(bounceAngle) * (this.velocityY > 0 ? -1 : 1); // Reverse vertical direction
    }

    private clear() {
        this.ctx.clearRect(
            this.x - this.radius - this.clearBuffer,
            this.y - this.radius - this.clearBuffer,
            this.radius * 2 + 2 * this.clearBuffer,
            this.radius * 2 + 2 * this.clearBuffer
        );
    }
}

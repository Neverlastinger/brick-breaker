import { ACTIONS } from "../actions";
import Platform from "./Platform";

interface Props {
    ctx: CanvasRenderingContext2D,
    platform?: Platform,
    x?: number,
    y?: number;
    radius: number,
    color: string,
    speed: number,
}

interface UpdateParams {
    canvasWidth: number, 
    canvasHeight: number, 
    platform: Platform, 
    otherBalls: Ball[], 
    onBallEliminated: () => void
}

export default class Ball {
    private ctx: CanvasRenderingContext2D;
    private x: number = 0;
    private y: number = 0;
    private radius: number;
    private color: string;
    private speed: number;
    private velocityX: number; 
    private velocityY: number; 
    private clearBuffer: number;
    private lastTime: number | null = null;

    constructor({ ctx, platform, x, y, radius, color, speed }: Props) {
        this.ctx = ctx;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.velocityX = 0;
        this.velocityY = speed;
        this.clearBuffer = Math.abs(Math.ceil(speed * 1.5));

        if (platform) {
            this.positionOnPlatform(platform);
            this.bounceOffObjectVertically(0, 0, Math.random() * 2 - 1);
        } else if (x && y) {
            this.x = x;
            this.y = y;
        }
    }

    draw() {
        // Draw the ball at its current position
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    clear() {
        this.ctx.clearRect(
            this.x - this.radius - this.clearBuffer,
            this.y - this.radius - this.clearBuffer,
            this.radius * 2 + 2 * this.clearBuffer,
            this.radius * 2 + 2 * this.clearBuffer
        );
    }

    update({ canvasWidth, canvasHeight, platform, otherBalls, onBallEliminated }: UpdateParams) {
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
        if (this.y > canvasHeight + this.radius * 2 && this.velocityY > 0) {
            onBallEliminated(); 
            this.clear();
            return;
        }

        // Bounce off the platform
        this.checkCollisionWithPlatform(platform);

        otherBalls.map((other) => this.checkCollisionWithAnotherBall(other));

        this.draw();
    }

    release() {
        this.bounceOffObjectVertically(0, 0, Math.random() * 2 - 1);
    }

    getBounds() {
        return { x: this.x, y: this.y, radius: this.radius, velocityX: this.velocityX, velocityY: this.velocityY, speed: this.speed };
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
                this.bounceOffObjectVertically(platformX, platformWidth);
            } else if (overlapBottom < threshold && this.velocityY < 0) { // Bottom collision and ball is moving up
                this.bounceOffObjectVertically(platformX, platformWidth);
            }
            
            else if (overlapLeft < overlapRight && this.velocityX > 0) { // Left collision and ball is moving to the right
                this.reverseX(); 
            } else if (overlapLeft > overlapRight && this.velocityX < 0) { // Right collision and ball is moving to the left
                this.reverseX(); 
            }

            postMessage({ action: ACTIONS.PLAY_BOUNCE_SOUND });
        }
    }

    checkCollisionWithAnotherBall(otherBall: Ball) {
        const dx = this.x - otherBall.x;
        const dy = this.y - otherBall.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.radius + otherBall.radius;
    
        if (distance < minDistance) {
            // Normalize the collision vector
            const nx = dx / distance;
            const ny = dy / distance;
    
            // Relative velocity
            const dvx = this.velocityX - otherBall.velocityX;
            const dvy = this.velocityY - otherBall.velocityY;
            const dotProduct = dvx * nx + dvy * ny;
    
            if (dotProduct > 0) return false; // Balls are moving apart
    
            // Apply 1D elastic collision formula for the normal direction
            const impulse = (2 * dotProduct) / 2; // Assuming equal masses
    
            this.velocityX -= impulse * nx;
            this.velocityY -= impulse * ny;
            otherBall.velocityX += impulse * nx;
            otherBall.velocityY += impulse * ny;
    
            // Resolve overlap (separate the balls along the normal)
            const overlap = (minDistance - distance) / 2;
            this.x += overlap * nx;
            this.y += overlap * ny;
            otherBall.x -= overlap * nx;
            otherBall.y -= overlap * ny;
    
            // Normalize the velocities to keep the speeds consistent
            const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
            const otherSpeed = Math.sqrt(otherBall.velocityX ** 2 + otherBall.velocityY ** 2);
    
            const targetSpeed = Math.max(this.speed, otherBall.speed); // Use the maximum speed of the two balls
    
            if (speed > 0) {
                this.velocityX = (this.velocityX / speed) * targetSpeed;
                this.velocityY = (this.velocityY / speed) * targetSpeed;
            }
    
            if (otherSpeed > 0) {
                otherBall.velocityX = (otherBall.velocityX / otherSpeed) * targetSpeed;
                otherBall.velocityY = (otherBall.velocityY / otherSpeed) * targetSpeed;
            }
        }
    }

    private bounceOffObjectVertically(x: number, width: number, predefinedHitOffset?: number) {
        // Calculate the offset from the platform's center
        const platformCenter = x + width / 2;
        const hitOffset = predefinedHitOffset || (this.x - platformCenter) / (width / 2); // Normalize between -1 and 1

        // Adjust horizontal velocity based on the hit offset
        const maxBounceAngle = Math.PI / 4; // 45 degrees
        const bounceAngle = hitOffset * maxBounceAngle;

        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2); // Maintain constant speed
        this.velocityX = speed * Math.sin(bounceAngle);
        this.velocityY = speed * Math.cos(bounceAngle) * (this.velocityY > 0 ? -1 : 1); // Reverse vertical direction
    }
}

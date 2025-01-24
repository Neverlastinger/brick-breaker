import Ball from "./Ball";

export default class Brick {
    private ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private color: string;
    private isVisible: boolean;

    constructor(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isVisible = true;
    }

    draw(ball: Ball, { skipCollisionCheck = false }: { skipCollisionCheck?: boolean } = {}) {
        if (!this.isVisible) return;

        const hasCollided = skipCollisionCheck ? false : this.isColliding(ball);
        
        this.ctx.clearRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);

        if (this.isVisible) {
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        return hasCollided;
    }

    getIsVisible() {
        return this.isVisible;
    }

    private isColliding(ball: Ball): boolean {
        if (!this.isVisible) return false;

        const { x: ballX, y: ballY, radius: ballRadius, velocityX: ballVelocityX, velocityY: ballVelocityY } = ball.getBounds();

        const isColliding =
            ballX + ballRadius > this.x &&
            ballX - ballRadius < this.x + this.width &&
            ballY + ballRadius > this.y &&
            ballY - ballRadius < this.y + this.height;

        if (isColliding) {
            this.isVisible = false;

            // Check which side of the brick the ball collided with
            const overlapTop = ballY + ballRadius - this.y;
            const overlapBottom = this.y + this.height - (ballY - ballRadius);
            const overlapLeft = ballX - ballRadius - this.x;
            const overlapRight = this.x + this.width - (ballX + ballRadius);

            const threshold = Math.abs(ballVelocityY);

            if (overlapTop < threshold && ballVelocityY > 0) { // Top collision and ball is moving down
                ball.reverseY(); 
            } else if (overlapBottom < threshold && ballVelocityY < 0) { // Bottom collision and ball is moving up
                ball.reverseY(); 
            }
            
            else if (overlapLeft < overlapRight && ballVelocityX > 0) { // Left collision and ball is moving to the right
                ball.reverseX(); 
            } else if (overlapLeft > overlapRight && ballVelocityX < 0) { // Right collision and ball is moving to the left
                ball.reverseX(); 
            }
        }

        return isColliding;
    }
}

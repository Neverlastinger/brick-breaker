import Ball from "./Ball";

export default class CollidableObject {
    protected ctx: CanvasRenderingContext2D;
    protected x: number;
    protected y: number;
    protected width: number;
    protected height: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    protected isColliding(ball: Ball): boolean {
        const { x: ballX, y: ballY, radius: ballRadius, velocityX: ballVelocityX, velocityY: ballVelocityY } = ball.getBounds();

        const isColliding =
            ballX + ballRadius > this.x &&
            ballX - ballRadius < this.x + this.width &&
            ballY + ballRadius > this.y &&
            ballY - ballRadius < this.y + this.height;

        if (isColliding) {
            // Check which side of the object the ball collided with
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

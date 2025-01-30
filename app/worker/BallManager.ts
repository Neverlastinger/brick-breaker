import Ball from "./Ball";
import Platform from "./Platform";

export default class BallManager {
    private balls: Ball[] = [];

    constructor() {
    }

    push(ball: Ball) {
        this.balls.push(ball);
    }

    draw() {
        this.balls.forEach((ball) => ball.draw());
    }
    
    clear() {
        this.balls.forEach((ball) => ball.clear());
    }

    update(canvasWidth: number, canvasHeight: number, platform: Platform, onLifeLost: () => void) {
        this.balls.forEach((ball) => ball.update({ 
            canvasWidth, 
            canvasHeight, 
            platform, 
            otherBalls: this.balls.filter((b) => b !== ball), 
            onBallEliminated: () => {
                this.balls = this.balls.filter((b) => b !== ball);

                if (this.balls.length === 0) {
                    onLifeLost();
                }
            }
        }));
    }

    pause() {
        this.balls.forEach((ball) => ball.pause());
    }

    positionOnPlatform(platform: Platform) {
        this.balls.forEach((ball) => ball.positionOnPlatform(platform));
    }
    
    getBalls() {
        return this.balls;
    }
}

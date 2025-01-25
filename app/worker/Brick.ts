import Ball from "./Ball";
import CollidableObject from "./CollidableObject";

export default class Brick extends CollidableObject {
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
        super(ctx, x, y, width, height);
        this.color = color;
        this.isVisible = true;
    }

    draw(ball: Ball, { skipCollisionCheck = false }: { skipCollisionCheck?: boolean } = {}) {
        if (!this.isVisible) {
            return;
        }

        const hasCollided = skipCollisionCheck ? false : this.isColliding(ball);

        if (hasCollided) {
            this.isVisible = false;
        }
        
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
}

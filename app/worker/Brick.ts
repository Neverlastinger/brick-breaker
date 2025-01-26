import Ball from "./Ball";
import CollidableObject from "./CollidableObject";
import { darkenHslColor } from "./lib/color";
import { drawRoundedRect } from "./lib/shape";

export default class Brick extends CollidableObject {
    private color: string;
    private isVisible: boolean;
    private borderColor: string;
    private borderWidth: number;
    private borderRadius: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        borderWidth: number = 3,
        borderRadius: number = 8 
    ) {
        super(ctx, x, y, width, height);
        this.color = color;
        this.isVisible = true;
        this.borderColor = darkenHslColor(color, 30);
        this.borderWidth = borderWidth;
        this.borderRadius = borderRadius;
    }

    draw(ball: Ball, { skipCollisionCheck = false }: { skipCollisionCheck?: boolean } = {}) {
        if (!this.isVisible) {
            return;
        }

        const hasCollided = skipCollisionCheck ? false : this.isColliding(ball);

        if (hasCollided) {
            this.isVisible = false;
        }
        
        this.ctx.clearRect(
            this.x - this.borderWidth,
            this.y - this.borderWidth,
            this.width + 2 * this.borderWidth,
            this.height + 2 * this.borderWidth
        );

        if (this.isVisible) {
            drawRoundedRect(this.ctx, this.x, this.y, this.width, this.height, this.borderRadius, this.color, this.borderColor, this.borderWidth);
        }

        return hasCollided;
    }

    getIsVisible() {
        return this.isVisible;
    }
}

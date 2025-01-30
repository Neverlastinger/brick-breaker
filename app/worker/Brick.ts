import Ball from "./Ball";
import CollidableObject from "./CollidableObject";
import { darkenHslColor } from "./lib/color";
import { drawRoundedRect } from "./lib/shape";
import { ACTIONS } from "../actions";
import { BONUSES } from "./bonuses";
import { BALL_RADIUS } from "./game-config";

export default class Brick extends CollidableObject {
    private color: string;
    private isVisible: boolean;
    private borderColor: string;
    private borderWidth: number = 3;
    private borderRadius: number = 8;
    private specialty: string | null;
    
    private bonusBall: Ball | null = null;

    constructor(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        specialty: string | null
    ) {
        super(ctx, x, y, width, height);
        this.color = color;
        this.isVisible = true;
        this.borderColor = darkenHslColor(color, 30);
        this.specialty = specialty;
    }

    draw(balls: Ball[], { skipCollisionCheck = false, onBallReleased }: { skipCollisionCheck?: boolean, onBallReleased: (ball: Ball) => void }) {
        if (!this.isVisible || balls.length == 0) {
            return;
        }

        const hasCollided = skipCollisionCheck ? false : balls.some((ball) => this.isColliding(ball));

        if (hasCollided) {
            this.isVisible = false;
            postMessage({ action: ACTIONS.PLAY_BOUNCE_SOUND });

            if (this.bonusBall) {
                onBallReleased(this.bonusBall);
            }
        }
        
        this.ctx.clearRect(
            this.x - this.borderWidth,
            this.y - this.borderWidth,
            this.width + 2 * this.borderWidth,
            this.height + 2 * this.borderWidth
        );

        if (this.isVisible) {
            if (this.specialty === BONUSES.ADDITIONAL_BALL) {
                this.bonusBall = new Ball({
                    ctx: this.ctx,
                    color: this.color,
                    radius: BALL_RADIUS,
                    speed: balls[0].getBounds().speed,
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2
                });

                this.bonusBall.draw();
            }

            drawRoundedRect({
                ctx: this.ctx, 
                x: this.x, 
                y: this.y, 
                width: this.width, 
                height: this.height, 
                borderWidth: this.borderWidth, 
                color: this.color, 
                borderColor: this.borderColor, 
                radius: this.borderRadius,
                noFill: !!this.specialty
            });
        }

        return hasCollided;
    }

    getIsVisible() {
        return this.isVisible;
    }
}

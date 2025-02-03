import Ball from "./Ball";
import CollidableObject from "./CollidableObject";
import { darkenHslColor } from "./lib/color";
import { drawRoundedRect } from "./lib/shape";
import { ACTIONS } from "../actions";
import { BONUSES } from "./bonuses";
import { BALL_RADIUS } from "./game-config";
import FallingBonus from "./FallingBonus";
import Platform from "./Platform";
import Timer from "./Timer";

interface Props {
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    bonus: string | null
    bonusSpeed: number;
    difficulty: number;
}

export default class Brick extends CollidableObject {
    private color: string;
    private isVisible: boolean;
    private borderColor: string;
    private borderWidth: number = 3;
    private borderRadius: number = 8;
    private bonus: string | null;
    private bonusSpeed: number;
    private difficulty: number;
    
    private bonusBall: Ball | null = null;
    private fallingBonus: FallingBonus | null = null;

    constructor({ ctx, x, y, width, height, color, bonus, bonusSpeed, difficulty }: Props) {
        super(ctx, x, y, width, height);
        this.color = color;
        this.isVisible = true;
        this.borderColor = darkenHslColor(color, 30);
        this.bonus = bonus;
        this.bonusSpeed = bonusSpeed;
        this.difficulty = difficulty;
    }

    draw(balls: Ball[], { skipCollisionCheck = false, onBallReleased }: { skipCollisionCheck?: boolean, onBallReleased: (ball: Ball) => void }) {
        if (balls.length === 0) {
            return;
        }

        if (!this.isVisible) {
            if (this.fallingBonus) {
                this.fallingBonus.update();
                this.fallingBonus.draw();
            }

            return;
        }

        const hasCollided = skipCollisionCheck ? false : balls.some((ball) => this.isColliding(ball));

        if (hasCollided) {
            this.isVisible = false;
            postMessage({ action: ACTIONS.PLAY_BOUNCE_SOUND });

            if (this.bonusBall) {
                onBallReleased(this.bonusBall);
            }

            // If the brick has extra time, create a falling bonus
            if (this.bonus === BONUSES.EXTRA_TIME) {
                this.fallingBonus = new FallingBonus({
                    ctx: this.ctx, 
                    x: this.x + this.width / 2, 
                    y: this.y, 
                    type: BONUSES.EXTRA_TIME,
                    speed: this.bonusSpeed,
                    difficulty: this.difficulty
                });
            }
        }
        
        this.ctx.clearRect(
            this.x - this.borderWidth,
            this.y - this.borderWidth,
            this.width + 2 * this.borderWidth,
            this.height + 2 * this.borderWidth
        );

        if (this.isVisible) {
            if (this.bonus === BONUSES.ADDITIONAL_BALL) {
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
                noFill: this.bonus === BONUSES.ADDITIONAL_BALL
            });
        }

        return hasCollided;
    }

    getIsVisible() {
        return this.isVisible;
    }

    checkBonusCollision(platform: Platform, timer: Timer) {
        if (this.fallingBonus) {
            this.fallingBonus.checkCollision(platform, timer);
        }
    }

    removeFallingBonus() {
        this.fallingBonus?.destroy();
        this.fallingBonus = null;
    }
}

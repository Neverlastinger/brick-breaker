import { BONUSES } from "./bonuses";
import { EXTRA_TIME_AMOUNT } from "./game-config";
import Platform from "./Platform";
import Timer from "./Timer";

interface Props {
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    type: string
    speed: number;
    difficulty: number;
}

export default class FallingBonus {
    private ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private radius: number = 15;
    private speed: number;
    private type: string;
    private isActive: boolean = true;
    private lastTime: number | null = null;
    private difficulty: number;

    constructor({ ctx, x, y, type, speed, difficulty }: Props) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = speed;
        this.difficulty = difficulty;
    }

    update() {
        if (!this.isActive) {
            return;
        }

        this.clear();

        const now = performance.now();
        if (this.lastTime === null) {
            this.lastTime = now;
        }
        const deltaTime = (now - this.lastTime) / 1000; // Time in seconds
        this.lastTime = now;

        this.y += this.speed * deltaTime * 60; // Normalize to 60 FPS

        if (this.y - this.radius > this.ctx.canvas.height) {
            this.isActive = false;
        }
    }

    draw() {
        if (!this.isActive) {
            return;
        }

        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const color = this.type === BONUSES.EXTRA_TIME ? "gold" : "white";
        this.ctx.strokeStyle = color
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();

        // Draw text inside the circle
        this.ctx.fillStyle = color
        this.ctx.font = "bold 12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(`+${this.getTimeToAdd()}`, this.x, this.y);
    }

    checkCollision(platform: Platform, timer: Timer) {
        if (!this.isActive) return;

        const { x: platformX, y: platformY, width: platformWidth } = platform.getBounds();

        if (
            this.y + this.radius >= platformY &&
            this.x + this.radius >= platformX &&
            this.x - this.radius <= platformX + platformWidth
        ) {
            this.isActive = false;
            if (this.type === BONUSES.EXTRA_TIME) {
                this.clear();
                timer.addTime(this.getTimeToAdd());
            }
        }
    }

    destroy() {
        this.isActive = false;
        this.clear();
    }

    private getTimeToAdd() {
        return EXTRA_TIME_AMOUNT[this.difficulty] || EXTRA_TIME_AMOUNT[EXTRA_TIME_AMOUNT.length - 1]
    }

    private clear() {
        this.ctx.clearRect(this.x - this.radius - 2, this.y - this.radius - 2, this.radius * 2 + 4, this.radius * 2 + 4);
    }
}

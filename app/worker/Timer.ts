import { INITIAL_TIME } from "./game-config";

interface Props {
    onTimeUp: () => void;
    onUpdate?: (minutes: number, seconds: number) => void;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
}

export default class Timer {
    private timeRemaining: number;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private onTimeUp: () => void;
    private onUpdate?: (minutes: number, seconds: number) => void;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private colorStep: number = 255; // Step to transition from red to white
    private highlightColor: "red" | "green" | "white" = 'white';
    private reverse: boolean = false;

    constructor({ onTimeUp, onUpdate, ctx, canvas }: Props) {
        this.timeRemaining = INITIAL_TIME;
        this.onTimeUp = onTimeUp;
        this.onUpdate = onUpdate;
        this.ctx = ctx;
        this.canvas = canvas;
    }

    draw() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;

        if (this.onUpdate) {
            this.onUpdate(minutes, seconds);
        }

        this.drawTimer(minutes, seconds);
    }

    private drawTimer(minutes: number, seconds: number) {
        this.ctx.clearRect(this.canvas.width - 120, 0, 100, 50); // Clear previous timer

        if (this.highlightColor !== 'white') { // active animation, calculate next color
            if (this.reverse) {
                this.colorStep += 20; // Move back to white
            } else {
                this.colorStep -= 20; // Move toward red or green
            }
    
            if (this.colorStep <= 50) {
                this.reverse = true;
            }
    
            if (this.reverse && this.colorStep >= 255) {
                this.colorStep = 255;
                this.highlightColor = 'white';
            }
        }

        // Compute color based on highlight effect
        let red = 50;
        let green = 50;
        let blue = 255;

        if (this.highlightColor === "red") {
            red = this.colorStep;
            blue = 50;
        } else if (this.highlightColor === "green") {
            green = this.colorStep;
            blue = 50;
        } else if (this.highlightColor === 'white') {
            red = 255;
            green = 255;
            blue = 255;
        }

        this.ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, this.canvas.width - 20, 30);
    }

    private startHighlightEffect(color: "red" | "green") {
        this.colorStep = 255;
        this.highlightColor = color; // Set highlight color
        this.reverse = false;
    }

    start() {
        if (this.intervalId) return;

        this.intervalId = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
            } else {
                this.stop();
                this.onTimeUp();
            }
        }, 1000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.timeRemaining = INITIAL_TIME;
    }

    subtractMinute() {
        this.timeRemaining = Math.max(0, this.timeRemaining - 60);
        this.startHighlightEffect("red");
    
        if (this.timeRemaining === 0) {
            this.stop();
            this.onTimeUp();
        }
    }

    addTime(seconds: number) {
        this.timeRemaining += seconds;
        this.startHighlightEffect("green");
    }

    getTime() {
        return this.timeRemaining;
    }

    hasRunOut() {
        return this.timeRemaining <= 0;
    }
}

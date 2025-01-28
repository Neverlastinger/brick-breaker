export default class MessageHandler {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    showMessage(text: string, subText: string = '', yOffset: number = 0) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.8 + yOffset;

        this.ctx.font = '36px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, centerX, centerY);

        if (subText) {
            this.ctx.font = '20px Arial';
            this.ctx.fillText(subText, centerX, centerY + 30);
        }
    }

    clearMessage() {
        const yStart = this.canvas.height * 0.8 - 60;
        this.ctx.clearRect(0, yStart, this.canvas.width, 120);
    }
}

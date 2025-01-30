interface Params {
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string,
    borderColor?: string,
    borderWidth?: number
    noFill?: boolean
}

export function drawRoundedRect({
    ctx,
    x,
    y,
    width,
    height,
    radius,
    color,
    borderColor,
    borderWidth,
    noFill
}: Params) {
    const r = Math.min(radius, width / 2, height / 2); // Ensure radius isn't too large
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    if (!noFill) {
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    if (borderWidth && borderColor) {
        // Draw the border
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }
}
export function darkenHslColor(hslColor: string, percent: number): string {
    // Extract H, S, and L values using a regular expression
    const match = hslColor.match(/^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/);
    if (!match) {
        throw new Error("Invalid HSL color format. Expected format: hsl(h, s%, l%)");
    }

    // Parse the values
    const h = parseFloat(match[1]); // Hue
    const s = parseFloat(match[2]); // Saturation
    const l = parseFloat(match[3]); // Lightness

    // Decrease lightness by the given percentage
    const newL = Math.max(0, l - (l * percent) / 100);

    // Return the new HSL color string
    return `hsl(${h}, ${s}%, ${newL}%)`;
}

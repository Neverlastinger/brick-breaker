import { useEffect, useLayoutEffect } from "react";
import styles from "./index.module.scss";

const MAX_WIDTH = 880;

export default function CanvasElement() {
    useEffect(() => {
        // window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }, []);

    const resizeCanvas = () => {
        const width = Math.min(window.innerWidth, MAX_WIDTH); // Full window width
        const height = window.innerHeight; // Full window height

        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    
        canvas.width = width;
        canvas.height = height;
    }

    useLayoutEffect(() => {
        
    }, []);

    return (
        <canvas id="canvas" className={styles.canvas}></canvas>
    );
}
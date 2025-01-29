import { RefObject, useEffect, useLayoutEffect } from "react";
import styles from "./index.module.scss";

const MAX_WIDTH = 880;

interface Props {
    ref: RefObject<HTMLCanvasElement | null>
}

export default function CanvasElement({ ref }: Props) {
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
        <canvas id="canvas" className={styles.canvas} ref={ref}></canvas>
    );
}
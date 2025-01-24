'use client'
import styles from "./index.module.scss";
import { useEffect } from "react";
import CanvasElement from "../CanvasElement";
import useEvents from "./useEvents";

export default function App() {
    const { setWorker } = useEvents();

    useEffect(() => {
        canvasWorker();
    }, []);

    const canvasWorker = () => {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;

        const worker = new Worker(new URL('@/app/worker/canvasWorker.ts', import.meta.url));
        setWorker(worker);

        const offscreen = canvas.transferControlToOffscreen();

        worker.postMessage({ canvas: offscreen }, [offscreen]);

        worker.onmessage = (event) => {
            console.log('Data from worker:', event.data);
        };
    }

    return (
        <div className={styles.wrapper}>
            <CanvasElement />
        </div>
    );
}
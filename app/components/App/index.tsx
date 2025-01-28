'use client'
import styles from "./index.module.scss";
import { useEffect, useMemo } from "react";
import CanvasElement from "../CanvasElement";
import useEvents from "./useEvents";
import Copy from "../Copy";
import { ACTIONS } from "@/app/actions";

export default function App() {
    const { setWorker } = useEvents();

    const bounceSound = useMemo(() => (
        new Audio('assets/audio/bounce.wav')
    ), []);

    const levelCompleteSound = useMemo(() => (
        new Audio('assets/audio/level-complete.mp3')
    ), []);

    const gameOverSound = useMemo(() => (
        new Audio('assets/audio/game-over.wav')
    ), []);

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
            const { action } = event.data;

            if (action === ACTIONS.PLAY_BOUNCE_SOUND) {
                bounceSound.currentTime = 0; 
                bounceSound.play(); 
            } else if (action === ACTIONS.PLAY_LEVEL_COMPLETE_SOUND) {
                levelCompleteSound.currentTime = 0;
                levelCompleteSound.play();
            } else if (action === ACTIONS.PLAY_GAME_OVER_SOUND) {
                gameOverSound.currentTime = 0;
                gameOverSound.volume = 0.2;
                gameOverSound.play();
            }
        };
    }

    return (
        <div className={styles.wrapper}>
            <CanvasElement />
            <Copy />
        </div>
    );
}
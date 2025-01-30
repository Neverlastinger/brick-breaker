'use client'
import styles from "./index.module.scss";
import { useEffect, useRef } from "react";
import CanvasElement from "../CanvasElement";
import useEvents from "./useEvents";
import Copy from "../Copy";
import { ACTIONS } from "@/app/actions";
import useAudioSound from "./useAudioSound";

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { setWorker } = useEvents(canvasRef);

    const bounceSound = useAudioSound('assets/audio/bounce.wav');
    const levelCompleteSound = useAudioSound('assets/audio/level-complete.mp3');
    const gameOverSound = useAudioSound('assets/audio/game-over.wav');

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

            if (action === ACTIONS.PLAY_BOUNCE_SOUND && bounceSound) {
                bounceSound.currentTime = 0; 
                bounceSound.volume = 0.1;
                bounceSound.play(); 
            } else if (action === ACTIONS.PLAY_LEVEL_COMPLETE_SOUND && levelCompleteSound) {
                levelCompleteSound.currentTime = 0;
                levelCompleteSound.volume = 0.1;
                levelCompleteSound.play();
            } else if (action === ACTIONS.PLAY_GAME_OVER_SOUND && gameOverSound) {
                gameOverSound.currentTime = 0;
                gameOverSound.volume = 0.03;
                gameOverSound.play();
            }
        };
    }

    return (
        <div className={styles.wrapper}>
            <CanvasElement ref={canvasRef} />
            <Copy />
        </div>
    );
}
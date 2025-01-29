import { COMMANDS } from "@/app/commands";
import { RefObject, useEffect, useRef, useState } from "react";

export default function useEvents(canvasRef: RefObject<HTMLCanvasElement | null>) {
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);
    const worker = useRef<Worker>(null);

    const setWorker = (newWorker: Worker) => {
        worker.current = newWorker;
    }

    useEffect(() => {
        addEventListener('keydown', handleKeyDown);
        addEventListener('keyup', handleKeyUp);
        addEventListener('touchstart', handleTouchStart);

        if (canvasRef && canvasRef.current) {
            canvasRef.current.addEventListener('touchmove', handleTouchMove);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        }
    }, []);

    useEffect(() => {
        if (worker.current) {
            worker.current.postMessage({ direction }); // Send the direction to the worker
        }
    }, [direction]);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            setDirection('left');
        } else if (event.key === 'ArrowRight') {
            setDirection('right');
        }

        if (event.code === 'Space' && worker.current) {
            worker.current.postMessage({ command: COMMANDS.SPACE });
        }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            setDirection(null);
        }
    }

    const handleTouchStart = (event: TouchEvent) => {
        if (worker.current && canvasRef.current) {
            const { x, y } = getTouchCoords(event);
            worker.current.postMessage({ command: COMMANDS.TOUCH, x, y });
        }
    }

    const handleTouchMove = (event: TouchEvent) => {
        if (worker.current && canvasRef.current) {
            const { x, y } = getTouchCoords(event);
            worker.current.postMessage({ command: COMMANDS.TOUCH_MOVE, x, y })
        }
    }

    const getTouchCoords = (event: TouchEvent) => {
        if (canvasRef.current) {
            const { clientX, clientY } = event.touches[0];

            const { x: canvasX, y: canvasY } = canvasRef.current?.getBoundingClientRect();
    
            const x = clientX - canvasX;
            const y = clientY - canvasY;
    
            return { x, y };
        }

        throw new Error('No canvas ref');
    }

    return { setWorker };
}
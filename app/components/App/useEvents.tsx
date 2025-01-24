import { useEffect, useRef, useState } from "react";

export default function useEvents() {
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);
    const worker = useRef<Worker>(null);

    const setWorker = (newWorker: Worker) => {
        worker.current = newWorker;
    }

    useEffect(() => {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                setDirection('left');
            } else if (event.key === 'ArrowRight') {
                setDirection('right');
            }
        });
        
        window.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                setDirection(null);
            }
        });

        addEventListener('keydown', (event) => {
            if (event.code === 'Space' && worker.current) {
                worker.current.postMessage({ command: 'space' });
            }
        });

        return () => {
            window.removeEventListener('keydown', () => {});
            window.removeEventListener('keyup', () => {});
        }
    }, []);

    useEffect(() => {
        if (worker.current) {
            worker.current.postMessage({ direction }); // Send the direction to the worker
        }
    }, [direction]);

    return { setWorker };
}
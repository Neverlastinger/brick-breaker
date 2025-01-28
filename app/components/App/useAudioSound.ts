import { useMemo } from "react";

export default function useAudioSound(path: string) {
    return useMemo(() => (
        typeof Audio !== "undefined" ? new Audio(path) : undefined
    ), [path]);
}
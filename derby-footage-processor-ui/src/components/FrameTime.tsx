import { useMemo } from "react";

export type FrameTimeProps = {
    frame: number;
    includeFrames?: boolean;
}

export const FrameTime = ({ frame, includeFrames }: FrameTimeProps) => {
    const formattedFrameTime = useMemo(() => {
        const totalSeconds = frame / 25;
        const frames = frame % 25;
        const seconds = Math.floor(totalSeconds) % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 60 / 60) % 60;

        return includeFrames
            ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}+${frames.toString().padStart(2, '0')}`
            : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, [frame]);

    return (
        <span className="tabular-nums slashed-zero">
            {formattedFrameTime}
        </span>
    )
}
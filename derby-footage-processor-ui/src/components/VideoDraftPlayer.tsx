import { Button, Slider } from "@/components/ui";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Project } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";

export type VideoDraftPlayerProps = {
    project: Project;
}

export const VideoDraftPlayer = ({ project }: VideoDraftPlayerProps) => {
    const [frame, setFrame] = useState(0);
    const [seekFrame, setSeekFrame] = useState(0);

    useEffect(() => setSeekFrame(frame), [frame, setSeekFrame]);

    const totalFrameCount = useMemo(() => project.footageFiles.reduce((t, f) => t + f.duration.frames, 0), [project])

    const formatFrameTime = (frame: number) => {
        const totalSeconds = frame / 25;
        const frames = frame % 25;
        const seconds = Math.floor(totalSeconds) % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 60 / 60) % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}+${frames.toString().padStart(2, '0')}`;
    };

    const seekFrameTime = useMemo(() => formatFrameTime(seekFrame), [seekFrame]);
    const totalFrameTime = useMemo(() => formatFrameTime(totalFrameCount), [totalFrameCount]);

    const handleDecrementFrame = useCallback((frameCount: number = 1) => {
        setFrame(c => Math.max(0, c - frameCount));
    }, [setFrame]);

    const handleIncrementFrame = useCallback((frameCount: number = 1) => {
        setFrame(c => c + frameCount);
    }, [setFrame]);

    const items = [
        { label: "360p", value: "360" },
        { label: "480p", value: "480" },
        { label: "720p", value: "720" },
        { label: "1080p", value: "1080" },
    ];

    const [displayQuality, setDisplayQuality] = useState("360");

    const handleDisplayQualityValueChange = (value: string | null) => {
        setDisplayQuality(value ?? "360");
    }

    const handleSeek = useCallback((value: number | readonly number[]) => {
        const frame = Array.isArray(value) ? value[0] : value;
        setSeekFrame(frame);
    }, [setSeekFrame]);

    const handleSeekEnd = useCallback((value: number | readonly number[]) => {
        const frame = Array.isArray(value) ? value[0] : value;
        setFrame(frame);
    }, [setFrame]);

    return (
        <div className="grid grid-rows-[min-content_1fr_min-content] gap-4 py-4 h-full max-h-[100vh]">
            <div className="grid-row-1 flex justify-end items-center gap-2 px-4">
                <span>Display quality</span>
                <Select items={items} value={displayQuality} onValueChange={handleDisplayQualityValueChange}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            { items.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem> ) }
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid-row-2 overflow-hidden max-w-[100vw] bg-black grid grid-rows-[1fr_fit-content(100%)_1fr]">
                <div className="grid-row-1"></div>
                <div className="grid-row-2 max-h-full h-full overflow-hidden">
                    <AspectRatio className="m-auto max-h-full max-w-full" ratio={16 / 9}>
                        <img src={`/api/draftFrame/${frame}/${displayQuality}`} className="grow w-full h-full" />
                    </AspectRatio>
                    <Slider 
                        className="relative bottom-8 px-8" 
                        value={seekFrame} 
                        max={totalFrameCount}
                        onValueChange={handleSeek}
                        onValueCommitted={handleSeekEnd}
                    />
                </div>
            </div>
            <div className="grid-row-3 flex justify-center items-center gap-8">
                <div className="flex gap-2">
                    <Button onClick={() => handleDecrementFrame(125)}>&lt; 5s</Button>
                    <Button onClick={() => handleDecrementFrame(25)}>&lt; 1s</Button>
                    <Button onClick={() => handleDecrementFrame(1)}>&lt;</Button>
                </div>
                <span className="tabular-nums slashed-zero">{seekFrameTime} / {totalFrameTime}</span>
                <div className="flex gap-2">
                    <Button onClick={() => handleIncrementFrame(1)}>&gt;</Button>
                    <Button onClick={() => handleIncrementFrame(25)}>1s &gt;</Button>
                    <Button onClick={() => handleIncrementFrame(125)}>5s &gt;</Button>
                </div>
            </div>
        </div>
    );
}
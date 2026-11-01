import { Color, type HslColor, type Project } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "./ui";
import { ColorSelectButton } from "./ColorSelectButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FrameSeeker } from "./FrameSeeker";

export type OverlayEditorProps = {
    project: Project;
    onProjectChanged?: () => void;
}

export const OverlayEditor = ({ project, onProjectChanged }: OverlayEditorProps) => {

    const [uncommittedColor, setUncommittedColor] = useState<HslColor>(Color.rgbToHsl({ red: 0, green: 0, blue: 0 }));

    const overlaySettings = useMemo(() => ({
        chromaKey: project.chromaKey,
        offsetFrames: project.overlayOffsetFrames,
    }), [project]);

    useEffect(() => {
        const chromaKeyColor = Color.rgbToHsl({ 
            red: project.chromaKey.red / 255,
            green: project.chromaKey.green / 255,
            blue: project.chromaKey.blue / 255,
        });
        console.log(overlaySettings.offsetFrames);

        setUncommittedColor(chromaKeyColor);
    }, [project]);

    const handleUncommittedColorChange = useCallback((color: HslColor) => {
        setUncommittedColor(color);
    }, []);

    const handleChromaKeyColorChange = useCallback((color: HslColor) => {
        const rgb = Color.hslToRgb(color);
        window.api.setOverlaySettings({
            ...overlaySettings,
            chromaKey: {
                ...project.chromaKey,
                red: Math.floor(rgb.red * 255),
                green: Math.floor(rgb.green * 255),
                blue: Math.floor(rgb.blue * 255),
            },
        });
        onProjectChanged?.();
    }, [onProjectChanged, overlaySettings]);

    const handleOffsetFramesChanged = useCallback((offsetFrames: number) => {
        console.log(offsetFrames);
        window.api.setOverlaySettings({
            ...overlaySettings,
            offsetFrames
        });
        onProjectChanged?.();
    }, [overlaySettings, onProjectChanged]);

    const maxOffset = useMemo(() => project.footageFiles.reduce((t, f) => t + f.duration.frames, 0), [project.footageFiles]);
    const minOffset = useMemo(() => -project.overlayFiles.reduce((t, f) => t + f.duration.frames, 0), [project.overlayFiles]);

    return (
        <Card className="shrink-0">
            <CardHeader>
                <CardTitle>Overlay</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <span>Offset</span>
                    <FrameSeeker
                        value={overlaySettings.offsetFrames}
                        min={minOffset}
                        max={maxOffset}
                        onValueChanged={handleOffsetFramesChanged}
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <span>Background color</span>
                    <ColorSelectButton 
                        className="w-8 h-8" 
                        color={uncommittedColor} 
                        onColorChanged={handleUncommittedColorChange}
                        onColorCommitted={handleChromaKeyColorChange} 
                    />
                </div>
            </CardContent>
        </Card>
    );
}
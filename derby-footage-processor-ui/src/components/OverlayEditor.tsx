import { Color, type HslColor, type Project } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "./ui";
import { ColorSelectButton } from "./ColorSelectButton";
import { useCallback, useEffect, useMemo, useState } from "react";

export type OverlayEditorProps = {
    project: Project;
    onProjectChanged?: () => void;
}

export const OverlayEditor = ({ project, onProjectChanged }: OverlayEditorProps) => {
    const chromaKeyColor = useMemo(() => Color.rgbToHsl({ 
        red: project.chromaKey.red / 255,
        green: project.chromaKey.green / 255,
        blue: project.chromaKey.blue / 255,
    }), [project]);

    const test = useCallback((color: HslColor) => {
        setUncommittedColor(color);
    }, []);

    const [uncommittedColor, setUncommittedColor] = useState<HslColor>(Color.rgbToHsl({ red: 0, green: 0, blue: 0 }));

    useEffect(() => setUncommittedColor(chromaKeyColor), [chromaKeyColor]);

    const handleChromaKeyColorChange = useCallback((color: HslColor) => {
        const rgb = Color.hslToRgb(color);
        window.api.setOverlaySettings({
            chromaKey: {
                ...project.chromaKey,
                red: Math.floor(rgb.red * 255),
                green: Math.floor(rgb.green * 255),
                blue: Math.floor(rgb.blue * 255),
            },
        });
        onProjectChanged?.();
    }, [onProjectChanged]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Overlay</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <ColorSelectButton 
                        color={uncommittedColor} 
                        onColorChanged={test}
                        onColorCommitted={handleChromaKeyColorChange} 
                    />
                </div>
            </CardContent>
        </Card>
    );
}
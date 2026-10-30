import { Color, type HslColor, type Project } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, Slider } from "./ui";
import { ColorSelectButton } from "./ColorSelectButton";
import { useCallback, useEffect, useState } from "react";

export type OverlayEditorProps = {
    project: Project;
    onProjectChanged?: () => void;
}

export const OverlayEditor = ({ project, onProjectChanged }: OverlayEditorProps) => {

    const [uncommittedColor, setUncommittedColor] = useState<HslColor>(Color.rgbToHsl({ red: 0, green: 0, blue: 0 }));
    const [uncommittedVariance, setUncommittedVariance] = useState(0.1);

    useEffect(() => {
        const chromaKeyColor = Color.rgbToHsl({ 
            red: project.chromaKey.red / 255,
            green: project.chromaKey.green / 255,
            blue: project.chromaKey.blue / 255,
        });

        setUncommittedColor(chromaKeyColor);
        setUncommittedVariance(project.chromaKey.variancePercent);
    }, [project]);

    const handleUncommittedColorChange = useCallback((color: HslColor) => {
        setUncommittedColor(color);
    }, []);

    const handleVarianceChange = useCallback((value: number | readonly number[]) => {
        const variance = Array.isArray(value) ? value[0] : value;
        setUncommittedVariance(variance);
    }, [setUncommittedVariance]);

    const handleVarianceCommit = useCallback((value: number | readonly number[]) => {
        const variance = Array.isArray(value) ? value[0] : value;
        window.api.setOverlaySettings({
            chromaKey: {
                ...project.chromaKey,
                variancePercent: variance,
            },
        });
    }, []);

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
                <div className="flex gap-2 items-center">
                    <span>Background color</span>
                    <ColorSelectButton 
                        className="w-8 h-8" 
                        color={uncommittedColor} 
                        onColorChanged={handleUncommittedColorChange}
                        onColorCommitted={handleChromaKeyColorChange} 
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <span>Variance</span>
                    <Slider 
                        value={[uncommittedVariance]} 
                        max={100} 
                        min={0} 
                        onValueChange={handleVarianceChange}
                        onValueCommitted={handleVarianceCommit}
                    />
                    <span>{uncommittedVariance}%</span>
                </div>
            </CardContent>
        </Card>
    );
}
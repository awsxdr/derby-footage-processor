import type { VideoFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import { ColorSelectButton } from ".";
import { Color, type HslColor } from "@/types";
import { Slider } from "./ui";
import { VideoItem } from "./VideoItem";
import { VideoFileList } from "./VideoFileList";

export type AddOverlayWizardStepProps = {
    onBusyChanged: (isBusy: boolean) => void;
    onReadyToContinueChanged: (readyToContinue: boolean) => void;
}

export const AddOverlayWizardStep = ({ onBusyChanged, onReadyToContinueChanged }: AddOverlayWizardStepProps) => {
    const [overlayFiles, setOverlayFiles] = useState<VideoFile[]>([]);
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => onBusyChanged(isBusy), [isBusy]);

    const handleAddFile = useCallback(async () => {
        setIsBusy(true);
        const files = await window.api.openOverlayFiles();
        setOverlayFiles(files);
        setIsBusy(false);
    }, [setOverlayFiles]);

    const handleRemoveFile = useCallback(async (fileId: string) => {
        const files = await window.api.removeOverlayFile({ fileId });
        setOverlayFiles(files);
    }, [setOverlayFiles])

    useEffect(() => onReadyToContinueChanged(true), []);

    useEffect(() => {
        (async () => {
            const files = await window.api.getOverlayFiles();
            setOverlayFiles(files);
        })();
    }, []);

    const [chromaKeyColor, setChromaKeyColor] = useState<HslColor>(Color.rgbToHsl({ red: 0, green: 1, blue: 0 }));
    const [chromaKeyVariance, setChromaKeyVariance] = useState(10);

    const handleVarianceChange = (value: number | readonly number[]) => {
        if(Array.isArray(value)) {
            setChromaKeyVariance(value[0] as number);
        } else {
            setChromaKeyVariance(value as number);
        }
    }

    return (
        <>
            <div className="pb-2 text-lg">Overlay files</div>
            <div className="flex gap-2 items-center">
                <span>Background color</span>
                <ColorSelectButton disabled={isBusy} className="w-8 h-8" color={chromaKeyColor} onColorChanged={setChromaKeyColor} />
            </div>
            <div className="flex gap-2 items-center">
                <span>Variance</span>
                <Slider 
                    value={[chromaKeyVariance]} 
                    max={100} 
                    min={0} 
                    disabled={isBusy}
                    onValueChange={handleVarianceChange} 
                />
                <span>{chromaKeyVariance}%</span>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleAddFile} disabled={isBusy}>Add file(s)</Button>
            </div>
            <VideoFileList videos={overlayFiles} onFileRemoved={handleRemoveFile} />
        </>
    );

}
import type { VideoFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import { VideoItem } from "./VideoItem";

export type AddFootageWizardStepProps = {
    onReadyToContinueChanged: (readyToContinue: boolean) => void;
}

export const AddFootageWizardStep = ({ onReadyToContinueChanged }: AddFootageWizardStepProps) => {
    const [footageFiles, setFootageFiles] = useState<VideoFile[]>([]);

    const handleAddFile = useCallback(async () => {
        const files = await window.api.openFootageFiles();
        setFootageFiles(files);
    }, [setFootageFiles]);

    const handleRemoveFile = useCallback(async (fileId: string) => {
        const files = await window.api.removeFootageFile({ fileId });
        setFootageFiles(files);
    }, [setFootageFiles])

    useEffect(() => {
        onReadyToContinueChanged(footageFiles.length !== 0);
    }, [footageFiles])

    useEffect(() => {
        (async () => {
            const files = await window.api.getFootageFiles();
            setFootageFiles(files);
        })();
    }, []);

    return (
        <>
            <div className="pb-2 text-lg">Footage files</div>
            <div className="flex justify-end">
                <Button onClick={handleAddFile}>Add file(s)</Button>
            </div>
            <Card>
                <CardContent className="flex flex-wrap gap-4 overflow-y-auto py-1">
                    {footageFiles.map(f => (
                        <VideoItem file={f} key={f.id} onFileRemoved={handleRemoveFile} />
                    ))}
                </CardContent>
            </Card>
        </>
    );

}
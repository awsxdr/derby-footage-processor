import type { VideoFile } from "@/types";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { VideoFileList } from "./VideoFileList";

export type AddFootageWizardStepProps = {
    onBusyChanged: (isBusy: boolean) => void;
    onReadyToContinueChanged: (readyToContinue: boolean) => void;
}

export const AddFootageWizardStep = ({ onBusyChanged, onReadyToContinueChanged }: AddFootageWizardStepProps) => {
    const [footageFiles, setFootageFiles] = useState<VideoFile[]>([]);
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => onBusyChanged(isBusy), [isBusy]);

    const handleAddFile = useCallback(async () => {
        setIsBusy(true);
        const files = await window.api.openFootageFiles();
        setFootageFiles(files);
        setIsBusy(false);
    }, [setFootageFiles, setIsBusy]);

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
                <Button onClick={handleAddFile} disabled={isBusy}>Add file(s)</Button>
            </div>
            <VideoFileList videos={footageFiles} onFileRemoved={handleRemoveFile} />
        </>
    );

}
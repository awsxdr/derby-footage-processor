import type { VideoFile } from "@/types";
import { Button, Card, CardContent } from "./ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { XIcon } from "@hugeicons/core-free-icons";

export type VideoItemProps = {
    file: VideoFile;
    onFileRemoved?: (fileId: string) => void;
}

export const VideoItem = ({ file, onFileRemoved }: VideoItemProps) => {
    return (
        <Card className="p-1 rounded-md">
            <CardContent className="flex flex-col p-2 gap-1">
                <div className="flex justify-between items-center">
                    <span>{file.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => onFileRemoved?.(file.id)}>
                        <HugeiconsIcon icon={XIcon} />
                    </Button>
                </div>
                <img src={`/api/thumbnail/${file.id}`} className="w-[180px] h-[90px] rounded-sm" />
            </CardContent>
        </Card>
    );
}
import type { VideoFile } from "@/types";
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle, Button, Card, CardContent } from "./ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { XIcon } from "@hugeicons/core-free-icons";
import { FrameTime } from ".";
import { useState } from "react";

export type VideoItemProps = {
    file: VideoFile;
    onFileRemoved?: (fileId: string) => void;
}

export const VideoItem = ({ file, onFileRemoved }: VideoItemProps) => {

    const [removeColor, setRemoveColor] = useState("#fff");

    return (
        <Attachment key={file.id} orientation="vertical">
            <AttachmentMedia variant="image">
                <img 
                    src={`/api/thumbnail/${file.id}`} 
                    className="w-[180px] h-[90px] rounded-sm" 
                />                        
            </AttachmentMedia>
            <AttachmentContent>
                <AttachmentTitle>{file.name}</AttachmentTitle>
                <AttachmentDescription>
                    <FrameTime frame={file.duration.frames} />
                </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
                <AttachmentAction 
                    aria-label={`Remove ${file.name}`}
                    onClick={() => onFileRemoved?.(file.id)}
                    onMouseEnter={() => setRemoveColor("#444")} 
                    onMouseLeave={() => setRemoveColor("#fff")} 
                >
                    <HugeiconsIcon 
                        icon={XIcon} 
                        color={removeColor} 
                        strokeWidth={4} 
                    />
                </AttachmentAction>
            </AttachmentActions>
        </Attachment>
    );
}
import type { VideoFile } from "@/types";
import { AttachmentGroup, Card, CardContent, Empty, EmptyMedia, EmptyTitle } from "./ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileVideoCameraIcon } from "@hugeicons/core-free-icons";
import { VideoItem } from "./VideoItem";

export type VideoFileListProps = {
    videos: VideoFile[];
    onFileRemoved: (fileId: string) => void;
};

export const VideoFileList = ({ videos, onFileRemoved }: VideoFileListProps) => {
    return (
        <Card>
            <CardContent className="flex flex-wrap gap-4 overflow-y-auto py-1">
                {videos.length === 0 && (
                    <Empty className="py-10">
                        <EmptyMedia variant="icon">
                            <HugeiconsIcon icon={FileVideoCameraIcon} />
                        </EmptyMedia>
                        <EmptyTitle>No files yet</EmptyTitle>
                    </Empty>
                )}
                <AttachmentGroup>
                {videos.map(f => (<VideoItem key={f.id} file={f} onFileRemoved={onFileRemoved} />))}
                </AttachmentGroup>
            </CardContent>
        </Card>
    )
}
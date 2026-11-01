export type Project = {
    isDirty: boolean;
    footageFiles: VideoFile[];
    overlayFiles: VideoFile[];
    chromaKey: ChromaKey;
    overlayOffsetFrames: number;
    periods: Period[];
}

export type VideoFile = {
    id: string;
    path: string;
    name: string;
    duration: VideoDuration;
}

export type ChromaKey = {
    red: number;
    green: number;
    blue: number;
    variancePercent: number;
}

export type OverlaySettings = {
    chromaKey: ChromaKey;
    offsetFrames: number;
};

export type VideoDuration = {
    frames: number;
    seconds: number;
}

export type Period = {
    startFrame: number;
    endFrame: number;
    startPaddingFrames: number;
    endPaddingFrames: number;
}
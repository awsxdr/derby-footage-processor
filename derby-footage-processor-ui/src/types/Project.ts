export type Project = {
    footageFiles: VideoFile[];
    overlayFiles: VideoFile[];
    chromaKey: ChromaKey;
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
};

export type VideoDuration = {
    frames: number;
    seconds: number;
}
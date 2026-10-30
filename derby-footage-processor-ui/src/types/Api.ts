import type { OverlaySettings, Project, VideoFile } from ".";

export type Api = {
    startNewProject: () => Promise<void>;
    openProject: () => Promise<boolean>;
    saveProject: (parameters: { forceDialog: boolean }) => Promise<void>;
    render: () => Promise<void>;
    exit: () => Promise<void>;
    getCurrentProject: () => Promise<Project>;
    getFootageFiles: () => Promise<VideoFile[]>;
    openFootageFiles: () => Promise<VideoFile[]>;
    removeFootageFile: (parameters: { fileId: string }) => Promise<VideoFile[]>;
    getOverlayFiles: () => Promise<VideoFile[]>;
    openOverlayFiles: () => Promise<VideoFile[]>;
    removeOverlayFile: (parameters: { fileId: string }) => Promise<VideoFile[]>;
    setOverlaySettings: (settings: OverlaySettings) => Promise<void>;
};


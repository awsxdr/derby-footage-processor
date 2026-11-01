import type { Project } from "@/types";
import { OverlayEditor } from "./OverlayEditor";
import { PeriodsEditor } from "./PeriodsEditor";

export type ProjectEditorProps = {
    project: Project;
    onProjectChanged?: () => void;
}

export const ProjectEditor = ({ project, onProjectChanged }: ProjectEditorProps) => {
    return (
        
        <div className="flex flex-col p-2 gap-2 overflow-y-auto max-h-[100%]">
            <OverlayEditor project={project} onProjectChanged={onProjectChanged} />
            <PeriodsEditor project={project} onProjectChanged={onProjectChanged} />
        </div>
    );
}
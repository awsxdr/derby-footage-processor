import type { Project } from "@/types";
import { Menubar } from "./ui";
import { ProjectMenu, ToolsMenu } from ".";

export type ProjectEditorMenuProps = {
    project: Project;
}

export const ProjectEditorMenu = ({ project }: ProjectEditorMenuProps) => {
    return (
        <Menubar className="w-full border-0">
            <ProjectMenu project={project} />
            <ToolsMenu project={project} />
        </Menubar>

    );
}
import { ProjectEditor, VideoDraftPlayer } from "@/components";
import { ProjectMenu } from "@/components/ProjectMenu";
import { RightSidebar } from "@/layouts";
import type { Project } from "@/types";
import { useCallback, useEffect, useState } from "react";

export const ProjectPage = () => {

    const [project, setProject] = useState<Project | null>(null);

    const handleProjectChanged = useCallback(() => {
        (async () => {
            const project = await window.api.getCurrentProject();
            setProject(project);
        })();
    }, [setProject]);

    useEffect(() => handleProjectChanged(), [setProject]);

    return (
        <RightSidebar
            menu={(project && <ProjectMenu project={project} />)}
            mainContent={(project && <VideoDraftPlayer project={project} />)}
            sidebarContent={(project && <ProjectEditor project={project} onProjectChanged={handleProjectChanged} />)}
        />
    );
}
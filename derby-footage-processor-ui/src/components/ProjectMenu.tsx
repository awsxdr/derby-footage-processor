import type { Project } from "@/types";
import { Menubar, MenubarContent, MenubarGroup, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "./ui";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { YesNoAlertDialog, type YesNoAlertDialogProps } from "./YesNoAlertDialog";

export type ProjectMenuProps = {
    project: Project;
}

type AcceptNewProjectDialogProps = Omit<YesNoAlertDialogProps, 'title' | 'description'>;

const AcceptNewProjectDialog = (props: AcceptNewProjectDialogProps) => (
    <YesNoAlertDialog 
        title="Start new project?" 
        description="You have unsaved work in the current project which will be lost if you continue."
        {...props}
    />
);

type AcceptOpenProjectDialogProps = Omit<YesNoAlertDialogProps, 'title' | 'description'>;

const AcceptOpenProjectDialog = (props: AcceptOpenProjectDialogProps) => (
    <YesNoAlertDialog
        title="Open project?"
        description="You have unsaved work in the current project which will be lost if you continue."
        {...props}
    />
);

type AcceptExitDialogProps = Omit<YesNoAlertDialogProps, 'title' | 'description'>;

const AcceptExitDialog = (props: AcceptExitDialogProps) => (
    <YesNoAlertDialog
        title="Are you sure you want to quit?"
        description="You have unsaved work in the current project which will be lost if you continue."
        {...props}
    />
);

export const ProjectMenu = ({ project }: ProjectMenuProps) => {

    const navigate = useNavigate();

    const [acceptNewProjectDialogOpen, setAcceptNewProjectDialogOpen] = useState(false);
    const [acceptOpenProjectDialogOpen, setAcceptOpenProjectDialogOpen] = useState(false);
    const [acceptExitDialogOpen, setAcceptExitDialogOpen] = useState(false);

    const handleAcceptNewProject = useCallback(async () => {
        await window.api.startNewProject();
        await navigate("/newProject");
    }, []);

    const handleProjectNew = useCallback(async () => {
        if (project.isDirty) {
            setAcceptNewProjectDialogOpen(true);
            return;
        }

        await handleAcceptNewProject();
    }, [project.isDirty, handleAcceptNewProject]);

    const handleAcceptOpenProject = useCallback(async () => {
        await window.api.openProject();
        window.location.reload();
    }, []);

    const handleProjectOpen = useCallback(async () => {
        if (project.isDirty) {
            setAcceptOpenProjectDialogOpen(true);
            return;
        }

        await handleAcceptOpenProject();
    }, [project.isDirty, handleAcceptOpenProject]);

    const handleProjectSave = useCallback(async () => {
        await window.api.saveProject({ forceDialog: false });
    }, []);

    const handleProjectSaveAs = useCallback(async () => {
        await window.api.saveProject({ forceDialog: true });
    }, []);

    const handleProjectRender = useCallback(() => {

    }, []);

    const handleAcceptExit = useCallback(async () => {
        await window.api.exit();
    }, []);

    const handleExit = useCallback(async () => {
        if (project.isDirty) {
            setAcceptExitDialogOpen(true);
            return;
        }

        await handleAcceptExit();
    }, []);

    return (
        <>
            <AcceptNewProjectDialog 
                open={acceptNewProjectDialogOpen} 
                onYes={handleAcceptNewProject} 
                onNo={() => setAcceptNewProjectDialogOpen(false)} 
            />
            <AcceptOpenProjectDialog
                open={acceptOpenProjectDialogOpen}
                onYes={handleAcceptOpenProject}
                onNo={() => setAcceptOpenProjectDialogOpen(false)}
            />
            <AcceptExitDialog
                open={acceptExitDialogOpen}
                onYes={handleAcceptExit}
                onNo={() => setAcceptExitDialogOpen(false)}
            />
            <Menubar className="w-full border-0">
                <MenubarMenu>
                    <MenubarTrigger>Project</MenubarTrigger>
                    <MenubarContent>
                        <MenubarGroup>
                            <MenubarItem onClick={handleProjectNew}>
                                New
                            </MenubarItem>
                        </MenubarGroup>
                        <MenubarSeparator />
                        <MenubarGroup>
                            <MenubarItem onClick={handleProjectOpen}>
                                Open...
                            </MenubarItem>
                            <MenubarItem onClick={handleProjectSave}>
                                Save
                            </MenubarItem>
                            <MenubarItem onClick={handleProjectSaveAs}>
                                Save as...
                            </MenubarItem>
                        </MenubarGroup>
                        <MenubarSeparator />
                        <MenubarGroup>
                            <MenubarItem onClick={handleProjectRender}>
                                Render...
                            </MenubarItem>
                        </MenubarGroup>
                        <MenubarSeparator />
                        <MenubarGroup>
                            <MenubarItem onClick={handleExit}>
                                Exit
                            </MenubarItem>
                        </MenubarGroup>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </>
    );
}
import type { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui";
import { OverlayEditor } from "./OverlayEditor";

export type ProjectEditorProps = {
    project: Project;
    onProjectChanged?: () => void;
}

export const ProjectEditor = ({ project, onProjectChanged }: ProjectEditorProps) => {
    return (
        <div className="flex flex-col p-2 gap-2">
            <OverlayEditor project={project} onProjectChanged={onProjectChanged} />
            <Card>
                <CardHeader>
                    <CardTitle>Intermissions</CardTitle>
                </CardHeader>
                <CardContent>
                    Blah 2
                </CardContent>
            </Card>
        </div>
    );
}
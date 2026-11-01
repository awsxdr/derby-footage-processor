import type { Project } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "./ui";
import { PeriodItem } from ".";
import { useMemo } from "react";

export type PeriodsEditorProps = {
    project: Project;
    onProjectChanged?: () => void;
}

export const PeriodsEditor = ({ project }: PeriodsEditorProps) => {

    const footageDuration = useMemo(() => project.footageFiles.reduce((t, f) => t + f.duration.frames, 0), [project.footageFiles]);

    return (
        <Card className="shrink-0">
            <CardHeader>
                <CardTitle>Periods</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {
                    project.periods.map(period => (
                        <PeriodItem footageDuration={footageDuration} period={period} />
                    ))
                }
            </CardContent>
        </Card>
    )
}
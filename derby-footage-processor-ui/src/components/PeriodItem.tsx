import type { Period } from "@/types"
import { Card, CardContent, Field, Input } from "./ui";
import { FrameSeeker } from ".";

export type PeriodItemProps = {
    footageDuration: number;
    period: Period;
}

export const PeriodItem = ({ footageDuration, period }: PeriodItemProps) => {
    return (
        <Card>
            <CardContent className="flex flex-col gap-2">
                <div>
                    Start
                    <FrameSeeker value={period.startFrame} min={0} max={footageDuration} />
                </div>
                <div>
                    End
                    <FrameSeeker value={period.endFrame} min={0} max={footageDuration} />
                </div>
                <Field orientation="horizontal" className="gap-1">
                    Pad start <Input className="w-20 align-end" value={period.startPaddingFrames / 25} />s
                </Field>
                <Field orientation="horizontal" className="gap-1">
                    Pad end <Input className="w-20 align-end" value={period.endPaddingFrames / 25} />s
                </Field>
            </CardContent>
        </Card>
    );
}